package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"lim-system/database"
	"lim-system/models"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"context"
	"bufio"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"runtime"
)

type ChatCompletionMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OllamaOptions struct {
	NumCtx     int `json:"num_ctx,omitempty"`
	NumThread  int `json:"num_thread,omitempty"`
	NumPredict int `json:"num_predict,omitempty"`
}

type ChatCompletionRequest struct {
	Model       string                  `json:"model"`
	Messages    []ChatCompletionMessage `json:"messages"`
	Temperature float64                 `json:"temperature"`
	MaxTokens   int                     `json:"max_tokens,omitempty"`
	Stream      bool                    `json:"stream,omitempty"`
	Options     *OllamaOptions          `json:"options,omitempty"`
}

type GenericStreamResponse struct {
	Choices []struct {
		Delta struct {
			Content          string `json:"content"`
			ReasoningContent string `json:"reasoning_content"`
		} `json:"delta"`
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
		Text string `json:"text"`
	} `json:"choices"`
	Response string `json:"response"`
	Message  struct {
		Content string `json:"content"`
	} `json:"message"`
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func extractContentFromStreamChunk(data string) string {
	var resp GenericStreamResponse
	if err := json.Unmarshal([]byte(data), &resp); err != nil {
		return ""
	}
	if len(resp.Choices) > 0 {
		if resp.Choices[0].Delta.Content != "" {
			return resp.Choices[0].Delta.Content
		}
		if resp.Choices[0].Delta.ReasoningContent != "" {
			return resp.Choices[0].Delta.ReasoningContent
		}
		if resp.Choices[0].Message.Content != "" {
			return resp.Choices[0].Message.Content
		}
		if resp.Choices[0].Text != "" {
			return resp.Choices[0].Text
		}
	}
	if resp.Response != "" {
		return resp.Response
	}
	if resp.Message.Content != "" {
		return resp.Message.Content
	}
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		return resp.Candidates[0].Content.Parts[0].Text
	}
	return ""
}

type ChatCompletionResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type AIExecutionItem struct {
	ParameterName    string  `json:"parameter_name"`
	ParamCode        string  `json:"param_code"`
	AspectName       string  `json:"aspect_name"`
	AspectCode       string  `json:"aspect_code"`
	Weight           float64 `json:"weight"`
	ActualValue      string  `json:"actual_value"`
	Notes            string  `json:"notes"`
	TestTypeCode     string  `json:"test_type_code"`
	StandardValue    float64 `json:"standard_value"`
	StandardValueMax float64 `json:"standard_value_max"`
	StandardOperator string  `json:"standard_operator"`
	StandardUnit     string  `json:"standard_unit"`
}

func GenerateReport(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var app models.TestingApplication
	isArchived := false

	// Load testing application with preloads
	if err := database.DB.Preload("Partner").Preload("Partner.Type").
		Preload("Equipment").Preload("Equipment.Category").Preload("Equipment.Brand").
		Preload("Equipment.Model").Preload("Equipment.Variant").Preload("Equipment.Brand.Origin").
		Preload("AspectScores").
		First(&app, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Check Archive
			if errArc := database.DB.Table("testing_applications_arc").Where("id = ?", id).First(&app).Error; errArc == nil {
				resolveArchivedRelations(&app)
				isArchived = true
			} else {
				c.JSON(http.StatusNotFound, gin.H{"error": "Application tidak ditemukan di database produksi maupun arsip."})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
			return
		}
	}

	// Fetch execution items (params and scores) using matching logic from GetExecution
	items := getExecutionItemsForAI(app.ID, isArchived)

	// Retrieve configurations from environment
	apiURL := os.Getenv("AI_API_URL")
	apiKey := os.Getenv("AI_API_KEY")
	modelName := os.Getenv("AI_MODEL")

	if apiURL == "" {
		apiURL = "https://api.groq.com/openai/v1"
	}
	if modelName == "" {
		modelName = "llama3-8b-8192"
	}

	// Determine final URL endpoint
	fullURL := strings.TrimSuffix(apiURL, "/")
	if !strings.HasSuffix(fullURL, "/chat/completions") {
		fullURL = fullURL + "/chat/completions"
	}

	// Format results programmatically:
	// Go will generate Section B (passing parameters) directly and 100% accurately.
	// Go will also filter only failing parameters to be sent to the AI (resultsText).
	
	// Group items by Aspect Name + Code
	aspectGroups := make(map[string][]AIExecutionItem)
	var aspectOrder []string
	for _, item := range items {
		key := fmt.Sprintf("%s (%s)", item.AspectName, item.AspectCode)
		if _, exists := aspectGroups[key]; !exists {
			aspectOrder = append(aspectOrder, key)
		}
		aspectGroups[key] = append(aspectGroups[key], item)
	}

	// 1. Build Section B programmatically in Go
	var secB strings.Builder
	secB.WriteString("B. Analisis Kekuatan & Kelebihan Teknis\n")
	secB.WriteString("   (Daftar parameter yang MEMENUHI/MELAMPAUI standar secara teknis):\n\n")

	hasPassing := false
	aspectIndex := 1
	for _, aspectKey := range aspectOrder {
		var aspectSecB strings.Builder
		aspectSecB.WriteString(fmt.Sprintf("   %d. %s:\n", aspectIndex, aspectKey))
		
		paramIndex := 1
		aspectHasPassing := false
		for _, item := range aspectGroups[aspectKey] {
			if item.ActualValue == "" {
				continue
			}
			
			actualVal, err := strconv.ParseFloat(item.ActualValue, 64)
			if err != nil {
				continue
			}
			
			isPassed := false
			switch strings.TrimSpace(strings.ToLower(item.StandardOperator)) {
			case "range":
				isPassed = actualVal >= item.StandardValue && actualVal <= item.StandardValueMax
			case "<=":
				isPassed = actualVal <= item.StandardValue
			case "<":
				isPassed = actualVal < item.StandardValue
			case ">":
				isPassed = actualVal > item.StandardValue
			case "=":
				isPassed = actualVal == item.StandardValue
			default:
				isPassed = actualVal >= item.StandardValue
			}
			
			if isPassed {
				aspectHasPassing = true
				hasPassing = true
				
				// Standard string
				stdStr := "-"
				if item.StandardValue != 0 || item.StandardValueMax != 0 || item.StandardUnit != "" {
					if strings.TrimSpace(strings.ToLower(item.StandardOperator)) == "range" {
						stdStr = fmt.Sprintf("%v s.d %v %s", item.StandardValue, item.StandardValueMax, item.StandardUnit)
					} else {
						stdStr = fmt.Sprintf("%s %v %s", item.StandardOperator, item.StandardValue, item.StandardUnit)
					}
				}
				
				aspectSecB.WriteString(fmt.Sprintf("      %d.%d. %s (%s) - Skor: %s (Memenuhi standar, Standar: %s)\n", 
					aspectIndex, paramIndex, item.ParameterName, item.ParamCode, item.ActualValue, stdStr))
				paramIndex++
			}
		}
		
		if aspectHasPassing {
			secB.WriteString(aspectSecB.String())
			secB.WriteString("\n")
			aspectIndex++
		}
	}
	
	if !hasPassing {
		secB.WriteString("   - Tidak ada parameter yang memenuhi atau melampaui standar.\n\n")
	}
	
	goSectionB := secB.String()

	// 2. Filter only failing items for the AI prompt (resultsText)
	var resultsText strings.Builder
	hasFailing := false
	
	for _, aspectKey := range aspectOrder {
		var aspectFailingText strings.Builder
		aspectFailingText.WriteString(fmt.Sprintf("Aspek: %s\n", aspectKey))
		
		aspectHasFailing := false
		for _, item := range aspectGroups[aspectKey] {
			if item.ActualValue == "" {
				continue
			}
			
			actualVal, err := strconv.ParseFloat(item.ActualValue, 64)
			if err != nil {
				continue
			}
			
			isPassed := false
			switch strings.TrimSpace(strings.ToLower(item.StandardOperator)) {
			case "range":
				isPassed = actualVal >= item.StandardValue && actualVal <= item.StandardValueMax
			case "<=":
				isPassed = actualVal <= item.StandardValue
			case "<":
				isPassed = actualVal < item.StandardValue
			case ">":
				isPassed = actualVal > item.StandardValue
			case "=":
				isPassed = actualVal == item.StandardValue
			default:
				isPassed = actualVal >= item.StandardValue
			}
			
			if !isPassed {
				aspectHasFailing = true
				hasFailing = true
				
				// Standard string
				stdStr := "-"
				if item.StandardValue != 0 || item.StandardValueMax != 0 || item.StandardUnit != "" {
					if strings.TrimSpace(strings.ToLower(item.StandardOperator)) == "range" {
						stdStr = fmt.Sprintf("%v s.d %v %s", item.StandardValue, item.StandardValueMax, item.StandardUnit)
					} else {
						stdStr = fmt.Sprintf("%s %v %s", item.StandardOperator, item.StandardValue, item.StandardUnit)
					}
				}
				
				percentStr := "-"
				if actualVal > 0 && (strings.TrimSpace(strings.ToLower(item.StandardOperator)) == "<=" || strings.TrimSpace(strings.ToLower(item.StandardOperator)) == "<") {
					percentStr = fmt.Sprintf("%.1f%%", (item.StandardValue/actualVal)*100)
				} else if item.StandardValue > 0 {
					percentStr = fmt.Sprintf("%.1f%%", (actualVal/item.StandardValue)*100)
				}
				
				notesStr := ""
				if item.Notes != "" {
					notesStr = fmt.Sprintf(", Temuan=%s", item.Notes)
				}
				
				aspectFailingText.WriteString(fmt.Sprintf("  - %s (%s): Skor=%s, Bobot=%.1f%%, Standar=%s, Hasil=%s, Ket=Tidak Memenuhi%s\n", 
					item.ParameterName, item.ParamCode, item.ActualValue, item.Weight, stdStr, percentStr, notesStr))
			}
		}
		
		if aspectHasFailing {
			resultsText.WriteString(aspectFailingText.String())
			resultsText.WriteString("\n")
		}
	}
	
	if !hasFailing {
		resultsText.WriteString("  - Tidak ada parameter yang gagal/tidak memenuhi standar.\n")
	}

	// Load Aspect details to get names and thresholds
	var aspectMetaList []models.ScoringAspect
	if err := database.DB.Find(&aspectMetaList).Error; err != nil {
		// Log error or fallback
	}
	aspectThresholdMap := make(map[string]float64)
	aspectNameMap := make(map[string]string)
	for _, a := range aspectMetaList {
		aspectThresholdMap[a.Code] = a.Threshold
		aspectNameMap[a.Code] = a.Name
	}

	var aspectScoresText strings.Builder
	var failedAspectsBuilder strings.Builder
	hasFailedAspects := false
	for _, aspectScore := range app.AspectScores {
		name := aspectNameMap[aspectScore.AspectCode]
		if name == "" {
			name = aspectScore.AspectCode
		}
		threshold := aspectThresholdMap[aspectScore.AspectCode]
		if threshold == 0 {
			threshold = 60.0 // default fallback
		}
		aspectScoresText.WriteString(fmt.Sprintf("- Aspek: %s (%s) - Skor Hasil: %.2f - Standar Threshold Kelulusan: %.2f\n", name, aspectScore.AspectCode, aspectScore.Score, threshold))
		
		if aspectScore.Score < threshold {
			failedAspectsBuilder.WriteString(fmt.Sprintf("- Aspek %s (%s) dengan Skor Hasil %.2f (Threshold %.2f)\n", name, aspectScore.AspectCode, aspectScore.Score, threshold))
			hasFailedAspects = true
		}
	}
	
	failedAspectsText := failedAspectsBuilder.String()
	if !hasFailedAspects {
		failedAspectsText = "- Tidak ada (Semua aspek memenuhi threshold)\n"
	}

	// Build Prompts (Streamlined to minimize CPU prefill latency while maintaining strict formatting)
	systemPrompt := "Anda adalah Technical Analyst laboratorium pengujian peralatan. Tulis draf laporan evaluasi teknis dalam Bahasa Indonesia yang formal dan baku.\n\n" +
		"Aturan Format (Wajib Diikuti):\n" +
		"1. DILARANG keras menggunakan format tabel Markdown. Gunakan teks paragraf naratif dan daftar poin bernomor.\n" +
		"2. DILARANG membuat Bagian B (Bagian B dibuat otomatis oleh sistem).\n" +
		"3. Gunakan penomoran judul utama (heading) berikut:\n" +
		"   A. Ringkasan Eksekutif Analis (Executive Summary)\n" +
		"   C. Analisis Deviasi Teknis & Dampak Operasional\n" +
		"   D. Saran Perbaikan & Tindak Lanjut Spesifik\n" +
		"4. Untuk Bagian C & D, gunakan pengelompokan aspek dengan angka (1., 2.) dan rincian parameter dengan desimal (1.1., 1.2.).\n" +
		"5. Tulis secara ringkas dan padat. HANYA analisis parameter yang berstatus TIDAK MEMENUHI standar pada data.\n" +
		"6. Di Bagian A, sebutkan nilai akhir, status kelulusan, dan HANYA sebutkan aspek yang terdaftar di [ASPEK YANG BENAR-BENAR GAGAL].\n" +
		"7. Gunakan Bahasa Indonesia yang formal (dilarang bahasa Inggris)."

	var userPrompt strings.Builder
	userPrompt.WriteString("[INFORMASI TRANSAKSI]\n")
	userPrompt.WriteString(fmt.Sprintf("- No Registrasi: %s\n", app.RegNumber))

	if app.Equipment.EquipmentName != "" {
		userPrompt.WriteString(fmt.Sprintf("- Nama Peralatan: %s\n", app.Equipment.EquipmentName))
		userPrompt.WriteString(fmt.Sprintf("- Brand / Model: %s / %s\n", app.Equipment.Brand.Name, app.Equipment.Model.Name))
		userPrompt.WriteString(fmt.Sprintf("- Varian / No. Seri: %s / %s\n", app.Equipment.Variant.Name, app.Equipment.SerialNo))
		userPrompt.WriteString(fmt.Sprintf("- Spesifikasi Teknis: %s\n", app.Equipment.TechnicalSpec))
	}
	if app.Partner.Name != "" {
		userPrompt.WriteString(fmt.Sprintf("- Pemohon / Instansi: %s\n", app.Partner.Name))
	}
	userPrompt.WriteString(fmt.Sprintf("- Nilai Skor Akhir Gabungan: %.2f / 100.00\n", app.FinalScore))
	userPrompt.WriteString(fmt.Sprintf("- Status Kelayakan Kelulusan: %s\n\n", app.FinalStatus))

	userPrompt.WriteString("[DATA TRANSAKSI RINGKASAN SKOR PER ASPEK]\n")
	userPrompt.WriteString(aspectScoresText.String())
	userPrompt.WriteString("\n")

	userPrompt.WriteString("[ASPEK YANG BENAR-BENAR GAGAL / DI BAWAH THRESHOLD]\n")
	userPrompt.WriteString(failedAspectsText)
	userPrompt.WriteString("\n")

	userPrompt.WriteString("[DATA TRANSAKSI DETAIL PARAMETER HASIL UJI YANG GAGAL / DEVIASE]\n")
	userPrompt.WriteString(resultsText.String())

	userPrompt.WriteString("\nTulis laporan persis dengan struktur A, C, dan D secara ringkas dalam Bahasa Indonesia.\n")

	// Get max tokens from database or fallback to cache/default (1000)
	maxTokens := 1000
	var gpMax models.GlobalParameter
	if err := database.DB.Where("param_key = ?", "AI_MAX_TOKENS").First(&gpMax).Error; err == nil {
		if val, err := strconv.Atoi(gpMax.ParamValue); err == nil && val > 0 {
			maxTokens = val
		}
	} else {
		cacheVal := models.GetGlobalParam("AI_MAX_TOKENS", "1000")
		if val, err := strconv.Atoi(cacheVal); err == nil && val > 0 {
			maxTokens = val
		}
	}

	numCtx := 512
	if val := os.Getenv("AI_NUM_CTX"); val != "" {
		if c, err := strconv.Atoi(val); err == nil && c > 0 {
			numCtx = c
		}
	}

	numThread := runtime.NumCPU()
	if val := os.Getenv("AI_NUM_THREAD"); val != "" {
		if t, err := strconv.Atoi(val); err == nil && t > 0 {
			numThread = t
		}
	}

	// Call OpenAI-compatible service with Stream enabled & Ollama CPU options
	payload := ChatCompletionRequest{
		Model:       modelName,
		Messages:    []ChatCompletionMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt.String()},
		},
		Temperature: 0.2,
		MaxTokens:   maxTokens,
		Stream:      true, // Enable streaming
		Options: &OllamaOptions{
			NumCtx:     numCtx,
			NumThread:  numThread,
			NumPredict: maxTokens,
		},
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyusun payload permintaan AI: " + err.Error()})
		return
	}

	req, err := http.NewRequest("POST", fullURL, bytes.NewBuffer(jsonBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat HTTP request: " + err.Error()})
		return
	}

	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" && strings.ToLower(apiKey) != "none" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	// Setup SSE Headers so we can stream immediately
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no") // Mencegah Nginx/Vite dev server melakukan buffering
	c.Writer.Flush()

	// Send 2KB initial whitespace comment padding to force Nginx & proxies to immediately flush HTTP headers to browser client
	c.Writer.Write([]byte(": " + strings.Repeat(" ", 2048) + "\n\n"))
	c.Writer.Flush()

	// Send Go-generated Section B as a special event to the frontend immediately!
	c.SSEvent("sectionB", map[string]string{"text": goSectionB})
	c.Writer.Flush()

	// Disable HTTP client timeout for streaming, let the connection stay open
	client := &http.Client{Timeout: 0}
	
	// Add context with timeout (5 mins) tied to request context so it cancels if client disconnects
	ctx, cancel := context.WithTimeout(c.Request.Context(), 300*time.Second)
	defer cancel()
	req = req.WithContext(ctx)

	// Heartbeat ticker to keep Nginx & browser connection alive during model cold-start / loading
	stopHeartbeat := make(chan struct{})
	go func() {
		ticker := time.NewTicker(3 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				// Send SSE comment ping to prevent proxy/Nginx timeout while waiting for LLM response
				c.Writer.Write([]byte(": ping\n\n"))
				c.Writer.Flush()
			case <-stopHeartbeat:
				return
			case <-ctx.Done():
				return
			}
		}
	}()

	fmt.Println("[AI Stream] Menghubungi API AI:", fullURL)
	resp, err := client.Do(req)
	close(stopHeartbeat) // Stop heartbeat once response headers are received from LLM
	fmt.Println("[AI Stream] Respons API diterima. Error:", err)

	if err != nil {
		c.SSEvent("error", map[string]string{"text": "Gagal menghubungi AI API: " + err.Error() + ". Pastikan konfigurasi jaringan atau Ollama Anda aktif."})
		c.SSEvent("done", "STREAM_FINISHED")
		c.Writer.Flush()
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		c.SSEvent("error", map[string]string{"text": fmt.Sprintf("AI API mengembalikan kode error %d: %s", resp.StatusCode, string(bodyBytes))})
		c.SSEvent("done", "STREAM_FINISHED")
		c.Writer.Flush()
		return
	}

	// Read stream from LLM (supports OpenAI, Groq, Ollama, Gemini, Reasoning models)
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || line == "data: [DONE]" {
			if line == "data: [DONE]" {
				break
			}
			continue
		}

		rawJSON := line
		if strings.HasPrefix(line, "data: ") {
			rawJSON = strings.TrimPrefix(line, "data: ")
		}

		content := extractContentFromStreamChunk(rawJSON)
		if content != "" {
			fmt.Print(content) // Cetak ke terminal Go
			c.SSEvent("message", map[string]string{"text": content})
			c.Writer.Flush()
		}
	}

	if err := scanner.Err(); err != nil {
		c.SSEvent("error", "Terjadi kesalahan saat membaca stream AI: "+err.Error())
		c.Writer.Flush()
	}

	c.SSEvent("done", "STREAM_FINISHED")
	c.Writer.Flush()
}

// Replicate execution items retrieval query logic for prompt data collection
func getExecutionItemsForAI(appID uint64, isArchived bool) []AIExecutionItem {
	var items []AIExecutionItem

	var plans []models.TestingPlan
	plansTable := "testing_plans"
	if isArchived {
		plansTable = "testing_plans_arc"
	}
	database.DB.Table(plansTable).Preload("Aspect.Methodology").Preload("Aspect.TestType").
		Where("application_id = ?", appID).
		Find(&plans)

	if len(plans) == 0 {
		// Fallback lookup if plans are empty (template structure)
		var app models.TestingApplication
		database.DB.First(&app, appID)
		var aspects []models.ScoringAspect
		if app.LabMethodologyCode != nil {
			var labAspects []models.ScoringAspect
			database.DB.Preload("Methodology").Where("methodology_code = ?", *app.LabMethodologyCode).Find(&labAspects)
			aspects = append(aspects, labAspects...)
		}
		if app.FieldMethodologyCode != nil {
			var fieldAspects []models.ScoringAspect
			database.DB.Preload("Methodology").Where("methodology_code = ?", *app.FieldMethodologyCode).Find(&fieldAspects)
			aspects = append(aspects, fieldAspects...)
		}
		for _, a := range aspects {
			plans = append(plans, models.TestingPlan{Aspect: a, AspectCode: a.Code})
		}
	}

	var existingResults []models.TestingResult
	resultsTable := "testing_results"
	if isArchived {
		resultsTable = "testing_results_arc"
	}
	database.DB.Table(resultsTable).Where("application_id = ?", appID).Find(&existingResults)

	resultsMap := make(map[string]models.TestingResult)
	for _, er := range existingResults {
		if er.SubAspectCode != nil {
			resultsMap[*er.SubAspectCode] = er
		}
	}

	for _, p := range plans {
		asp := p.Aspect
		var subAspects []models.ScoringSubAspect
		database.DB.Where("aspect_code = ?", asp.Code).Find(&subAspects)

		for _, sub := range subAspects {
			er, exists := resultsMap[sub.Code]

			testTypeCode := ""
			if asp.TestTypeCode != nil {
				testTypeCode = *asp.TestTypeCode
			} else if asp.Methodology.TestTypeCode != "" {
				testTypeCode = asp.Methodology.TestTypeCode
			}

			item := AIExecutionItem{
				ParameterName:    sub.Name,
				ParamCode:        sub.Code,
				AspectName:       asp.Name,
				AspectCode:       asp.Code,
				Weight:           sub.Weight,
				ActualValue:      "",
				Notes:            "",
				TestTypeCode:     testTypeCode,
				StandardValue:    sub.StandardValue,
				StandardValueMax: sub.StandardValueMax,
				StandardOperator: sub.StandardOperator,
				StandardUnit:     sub.StandardUnit,
			}
			if exists {
				item.ActualValue = fmt.Sprintf("%v", er.Score)
				item.Notes = er.Notes
			}
			items = append(items, item)
		}
	}
	return items
}
