package controllers

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"lim-system/database"
	"lim-system/models"
	"lim-system/services"
	"lim-system/views"

	"github.com/gin-gonic/gin"
)

type MachineResultInput struct {
	ApplicationID uint64  `json:"application_id"`
	SubAspectCode string  `json:"scoring_parameter_code" binding:"required"`
	Score         float64 `json:"score"`
	MachineID     string  `json:"machine_id"`
	Notes         string  `json:"notes"`
	PhotoBase64   string  `json:"photo_base64"`
	PhotoFileName string  `json:"photo_file_name"`
}

// ReceiveMachineResult handles machine simulator telemetry data and pushes it directly into active testing_results.
func ReceiveMachineResult(c *gin.Context) {
	// Verify Simulator API Key
	configuredKey := models.GetGlobalParam("SIMULATOR_API_KEY", "89669aa98816a7e5f754d3065bb5b7525a31b81529ee810ec265c7306e959c11")
	clientKey := c.GetHeader("X-Simulator-Key")
	if clientKey != configuredKey {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized simulator API key"})
		return
	}

	var input MachineResultInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid format: " + err.Error()})
		return
	}

	// Validate that the code exists in ScoringSubAspect (v2.0)
	var subAspect models.ScoringSubAspect
	if err := database.DB.Where("code = ?", input.SubAspectCode).First(&subAspect).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Scoring code not found: " + input.SubAspectCode})
		return
	}

	if !subAspect.IsSimulator && input.ApplicationID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter ini tidak dikonfigurasi sebagai data simulator"})
		return
	}

	log := models.SimulatorDataLog{
		ApplicationID: input.ApplicationID,
		SubAspectCode: input.SubAspectCode,
		Score:         input.Score,
		MachineID:     input.MachineID,
		Notes:         input.Notes,
		IsUsed:        false,
		CreatedAt:     time.Now(),
	}

	if err := database.DB.Create(&log).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Simpan Gagal (Database Error): " + err.Error()})
		return
	}

	// --- Automated push to testing_results (Now restricted to explicit ApplicationID) ---
	var targetApps []models.TestingApplication
	
	if input.ApplicationID != 0 {
		var app models.TestingApplication
		// Only auto-push for Planned OR Executed status
		if err := database.DB.Where("id = ? AND (status = ? OR status = ?)", input.ApplicationID, "Planned", "Executed").First(&app).Error; err == nil {
			targetApps = append(targetApps, app)
		}
	}

	if len(targetApps) > 0 {
		var aspect models.ScoringAspect
		database.DB.Where("code = ?", subAspect.AspectCode).First(&aspect)

		// Process photo/chart attachment if provided
		var photoPath string
		if input.PhotoBase64 != "" {
			b64Data := input.PhotoBase64
			if idx := strings.Index(b64Data, ","); idx != -1 {
				b64Data = b64Data[idx+1:]
			}
			imgBytes, err := base64.StdEncoding.DecodeString(b64Data)
			if err == nil && len(imgBytes) > 0 {
				ext := ".png"
				if strings.HasSuffix(strings.ToLower(input.PhotoFileName), ".jpg") || strings.HasSuffix(strings.ToLower(input.PhotoFileName), ".jpeg") {
					ext = ".jpg"
				} else if strings.HasSuffix(strings.ToLower(input.PhotoFileName), ".svg") {
					ext = ".svg"
				}

				fileName := fmt.Sprintf("machine_%d_%s_%d%s", input.ApplicationID, input.SubAspectCode, time.Now().Unix(), ext)
				contentType := "image/png"
				if ext == ".jpg" {
					contentType = "image/jpeg"
				} else if ext == ".svg" {
					contentType = "image/svg+xml"
				}

				// Try MinIO if available
				if services.Minio != nil {
					savedPath, err := services.Minio.UploadGenericFile(c.Request.Context(), fileName, bytes.NewReader(imgBytes), int64(len(imgBytes)), contentType)
					if err == nil && savedPath != "" {
						photoPath = savedPath
					}
				}

				// Fallback local file save
				if photoPath == "" {
					now := time.Now()
					localDir := fmt.Sprintf("./public/uploads/%d/%02d", now.Year(), now.Month())
					os.MkdirAll(localDir, 0755)
					localFilePath := filepath.Join(localDir, fileName)
					if err := os.WriteFile(localFilePath, imgBytes, 0644); err == nil {
						photoPath = fmt.Sprintf("%d/%02d/%s", now.Year(), now.Month(), fileName)
					}
				}
			}
		}

		for _, app := range targetApps {
			// Update or Create TestingResult
			var result models.TestingResult
			// Search by ApplicationID AND SubAspectCode to prevent duplicates
			err := database.DB.Where("application_id = ? AND sub_aspect_code = ?", 
				app.ID, input.SubAspectCode).First(&result).Error
			
			if err != nil {
				// Create new
				result = models.TestingResult{
					ApplicationID:        app.ID,
					SubAspectCode:        &input.SubAspectCode,
					AspectCode:           aspect.Code,
					Score:                input.Score,
					Notes:                "(Auto) " + input.Notes,
					PhotoPath:            photoPath,
					CreatedAt:            time.Now(),
				}
				database.DB.Create(&result)
			} else {
				// Update existing
				updates := map[string]interface{}{
					"score":       input.Score,
					"notes":       "(Auto-Update) " + input.Notes,
					"created_at":  time.Now(),
					"aspect_code": aspect.Code,
				}
				if photoPath != "" {
					updates["photo_path"] = photoPath
				}
				database.DB.Model(&result).Updates(updates)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Data simulator berhasil diterima",
		"log_saved":    true,
		"apps_updated": len(targetApps),
		"data":         log,
	})
}

// GetSimulatorLogs returns the simulator data logs, optionally filtered by param_code and is_used status.
func GetSimulatorLogs(c *gin.Context) {
	subAspectCode := c.Query("sub_aspect_code")
	isUsedStr := c.Query("is_used")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.SimulatorDataLog{})

	if subAspectCode != "" {
		query = query.Where("sub_aspect_code = ?", subAspectCode)
	}
	if isUsedStr == "false" {
		query = query.Where("is_used = false")
	} else if isUsedStr == "true" {
		query = query.Where("is_used = true")
	}

	var total int64
	query.Count(&total)

	var logs []models.SimulatorDataLog
	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal mengambil data log simulator", err.Error())
		return
	}
	
	views.SuccessWithMeta(c, logs, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Simulator logs retrieved")
}

// ProxyNodeRed acts as an endpoint-to-endpoint reverse proxy to bypass browser CORS / PNA blocks.
func ProxyNodeRed(c *gin.Context) {
	action := c.Param("action")
	if action != "data-peralatan" && action != "publish-mqtt" && action != "publish-socket" && action != "publish-modbus" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Aksi simulator tidak dikenal"})
		return
	}

	targetURL := "http://127.0.0.1:1880/" + action
	req, err := http.NewRequest(c.Request.Method, targetURL, c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat request proxy: " + err.Error()})
		return
	}

	// Copy headers
	for k, vv := range c.Request.Header {
		for _, v := range vv {
			req.Header.Add(k, v)
		}
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Node-RED tidak merespons: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	// Copy response headers and body
	for k, vv := range resp.Header {
		for _, v := range vv {
			c.Header(k, v)
		}
	}
	c.Status(resp.StatusCode)
	c.DataFromReader(resp.StatusCode, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
}

type TriggerScpiInput struct {
	ApplicationID uint64 `json:"application_id"`
	ParamCode     string `json:"param_code"`
}

// TriggerScpiMeasurement executes the SCPI measurement on-demand when the analyst clicks the SCPI button in LIMS UI.
func TriggerScpiMeasurement(c *gin.Context) {
	var input TriggerScpiInput
	if err := c.ShouldBindJSON(&input); err != nil || input.ApplicationID == 0 || input.ParamCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "application_id dan param_code wajib diisi"})
		return
	}

	pCode := strings.ToUpper(input.ParamCode)
	cmdArgs := []string{
		"scpi_integration/lims_scpi_agent.py",
		"--param-code", pCode,
		"--app-id", fmt.Sprintf("%d", input.ApplicationID),
		"--api-url", "http://127.0.0.1:8081",
	}

	cmd := exec.Command("python3", cmdArgs...)
	out, err := cmd.CombinedOutput()
	outStr := string(out)

	if err != nil {
		log.Printf("Trigger SCPI notice: %v, output: %s", err, outStr)
		if strings.Contains(outStr, "ERROR_NOT_CONFIGURED") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Parameter '%s' belum dikonfigurasi di file config.json! Harap daftarkan alat uji di config.json atau input nilai secara manual.", pCode),
			})
			return
		}
	}

	// Cari hasil terbaru di database testing_results
	var result models.TestingResult
	if err := database.DB.Where("application_id = ? AND sub_aspect_code = ?", input.ApplicationID, pCode).Order("id desc").First(&result).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"success":      true,
			"score":        result.Score,
			"actual_value": result.Score,
			"photo_path":   result.PhotoPath,
			"notes":        result.Notes,
			"message":      fmt.Sprintf("Data SCPI %s berhasil ditarik dari alat uji!", pCode),
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Gagal mengeksekusi SCPI untuk %s: %s", pCode, outStr),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pengukuran SCPI dieksekusi",
		"output":  outStr,
	})
}
