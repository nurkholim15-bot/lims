package controllers

import (
	"net/http"
	"os"
	"strconv"
	"time"

	"lim-system/models"
	"lim-system/views"
	"lim-system/database"

	"github.com/gin-gonic/gin"
)

type MachineResultInput struct {
	ApplicationID uint64    `json:"application_id"`
	SubAspectCode string  `json:"scoring_parameter_code" binding:"required"` // Tetap terima tag lama dari simulator IoT
	Score         float64 `json:"score"`
	MachineID     string  `json:"machine_id"`
	Notes         string  `json:"notes"`
}

// ReceiveMachineResult handles incoming telemetry from testing machines / simulators.
// Data is saved into simulator_data_logs table as a queue, NOT directly into testing_results.
// It will be consumed when the operator submits test results in Pelaksanaan Pengujian.
// Security: requires header X-Simulator-Key matching SIMULATOR_API_KEY in .env
func ReceiveMachineResult(c *gin.Context) {
	// --- API Key Validation ---
	expectedKey := os.Getenv("SIMULATOR_API_KEY")
	if expectedKey != "" {
		providedKey := c.GetHeader("X-Simulator-Key")
		if providedKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Header X-Simulator-Key wajib disertakan"})
			return
		}
		if providedKey != expectedKey {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "API Key tidak valid"})
			return
		}
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

	if !subAspect.IsSimulator {
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
					CreatedAt:            time.Now(),
				}
				database.DB.Create(&result)
			} else {
				// Update existing
				database.DB.Model(&result).Updates(map[string]interface{}{
					"score":      input.Score,
					"notes":      "(Auto-Update) " + input.Notes,
					"created_at": time.Now(),
					"aspect_code": aspect.Code,
				})
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
