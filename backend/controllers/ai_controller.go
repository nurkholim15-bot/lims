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

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ChatCompletionMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatCompletionRequest struct {
	Model       string                  `json:"model"`
	Messages    []ChatCompletionMessage `json:"messages"`
	Temperature float64                 `json:"temperature"`
	MaxTokens   int                     `json:"max_tokens,omitempty"`
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

	// Build Prompts
	systemPrompt := "Anda adalah asisten kecerdasan buatan penulisan laporan evaluasi teknis laboratorium (Technical Analyst) untuk laboratorium pengujian peralatan.\n" +
		"Tugas Anda adalah membuat draf laporan evaluasi kelayakan teknis yang mendalam (Analyst Executive Summary & Technical Recommendations) berdasarkan data hasil uji peralatan yang diberikan.\n" +
		"Sebagai analis teknis, Anda harus memberikan ulasan profesional dalam Bahasa Indonesia yang baku dan formal.\n\n" +
		"Aturan Format Penulisan Laporan (Wajib Diikuti Ketat):\n" +
		"1. DILARANG keras menggunakan format tabel Markdown (seperti menggunakan karakter '|' atau garis '---'). Gunakan bentuk teks paragraf naratif dan daftar poin bernomor.\n" +
		"2. SELURUH isi laporan wajib menggunakan Bahasa Indonesia yang formal dan baku. Dilarang keras menghasilkan tindakan perbaikan, dampak lapangan, atau analisis dalam bahasa Inggris (misalnya: dilarang menulis 'Upgrade equipment', wajib menggunakan 'Tingkatkan kualitas peralatan').\n" +
		"3. Ganti penomoran judul utama (heading) dengan huruf kapital A., C., D. (DILARANG membuat Bagian B karena Bagian B akan dibuat otomatis oleh sistem):\n" +
		"   A. Ringkasan Eksekutif Analis (Executive Summary)\n" +
		"   C. Analisis Deviasi Teknis & Dampak Operasional\n" +
		"   D. Saran Perbaikan & Tindak Lanjut Spesifik\n" +
		"4. Di bawah judul C dan D, gunakan pengelompokan aspek dengan angka (1., 2., 3., dst.), dan rincian parameter menggunakan desimal berjenjang (1.1., 1.2., 2.1., dst.). Jangan menggunakan simbol list seperti '*' atau '+'.\n" +
		"5. Tuliskan laporan secara ringkas, padat, dan langsung pada intinya. DILARANG KERAS mengulang-ulang daftar saran atau kalimat rekomendasi perbaikan.\n" +
		"6. Jangan menyamakan atau menukar antara 'Skor' dengan 'Hasil' (persentase hasil pengukuran). Gunakan Nilai Skor (seperti 50) sebagai nilai skor parameter. Cek threshold kelulusan dinamis masing-masing aspek yang diberikan di data transaksi (misalnya threshold untuk aspek KONPE adalah 60.00, jika skor aspek KONPE adalah 59.96 maka KONPE di bawah threshold dan merupakan penyebab utama status TIDAK LULUS). Jangan asumsikan threshold 65 untuk seluruh aspek.\n\n" +
		"Pedoman Konten Analisis (Wajib Diikuti Ketat):\n" +
		"1. Bagian A (Ringkasan Eksekutif):\n" +
		"   - Paparkan apakah peralatan layak secara keseluruhan.\n" +
		"   - Sebutkan total nilai akhir, status kelulusan, dan jika statusnya TIDAK LULUS, sebutkan secara spesifik HANYA aspek yang terdaftar di bagian [ASPEK YANG BENAR-BENAR GAGAL / DI BAWAH THRESHOLD] sebagai alasan ketidaklulusan. DILARANG KERAS menyatakan aspek lain yang tidak ada di daftar tersebut sebagai tidak memenuhi standar (contoh: KEPEN dengan skor 79.23 dan threshold 60.00 adalah LULUS/MEMENUHI standar secara aspek, dilarang menyebut KEPEN tidak memenuhi standar meskipun parameter KELCH di dalamnya gagal. Kegagalan parameter KELCH hanya dibahas di Bagian C/D, bukan sebagai penyebab kegagalan aspek KEPEN di Bagian A).\n" +
		"2. Bagian C (Analisis Deviasi Teknis & Dampak Operasional):\n" +
		"   - HANYA cantumkan aspek dan parameter yang berstatus TIDAK MEMENUHI standar (yang ada di dalam data yang diberikan).\n" +
		"   - Jelaskan dampak operasional/taktis di lapangan secara detail jika deviasi tersebut tidak diperbaiki.\n" +
		"3. Bagian D (Saran Perbaikan):\n" +
		"   - HANYA cantumkan saran perbaikan untuk parameter yang TIDAK MEMENUHI standar.\n" +
		"   - Gunakan format terstruktur: '[AspekNumber].[ParamNumber]. Perbaiki [Nama Parameter] ([Kode Parameter]) dengan [tindakan perbaikan spesifik dalam Bahasa Indonesia].'\n" +
		"   - Contoh: '1.1. Perbaiki Konstruksi-Fasilitas Perlindungan (KOFAS) dengan memperkuat engsel pintu pelindung.'\n\n" +
		"Gunakan bahasa Indonesia yang formal, teknis, lugas, obyektif, dan berwibawa. Jangan mengarang informasi di luar data hasil uji yang disediakan."

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

	userPrompt.WriteString("[DATA TRANSAKSI DETAIL PARAMETER HASIL UJI YANG GAGAL / DEVIASE (HANYA INI YANG DIANALSIS)]\n")
	userPrompt.WriteString(resultsText.String())

	userPrompt.WriteString("[FORMAT OUTPUT YANG WAJIB DIIKUTI]\n")
	userPrompt.WriteString("Tulis laporan persis dengan struktur berikut (dilarang menggunakan tabel Markdown, '#' atau '##', dan DILARANG menuliskan Bagian B):\n\n")
	userPrompt.WriteString("A. Ringkasan Eksekutif Analis (Executive Summary)\n")
	userPrompt.WriteString("   (Tulis ulasan ringkasan eksekutif kelayakan secara naratif dalam Bahasa Indonesia, sebutkan status kelulusan, nilai gabungan, dan jelaskan detail aspek mana saja yang berada di bawah threshold sehingga menyebabkan status tidak lulus).\n\n")
	userPrompt.WriteString("C. Analisis Deviasi Teknis & Dampak Operasional\n")
	userPrompt.WriteString("   (Daftar parameter yang TIDAK MEMENUHI standar saja, kelompokkan per aspek dengan format):\n")
	userPrompt.WriteString("   1. [Nama Aspek] ([Kode Aspek]):\n")
	userPrompt.WriteString("      1.1. [Nama Parameter] ([Kode Parameter]) - Skor: [Skor] (Tidak Memenuhi standar) - Dampak: [Dampak operasional lapangan jika tidak diperbaiki]\n\n")
	userPrompt.WriteString("D. Saran Perbaikan & Tindak Lanjut Spesifik\n")
	userPrompt.WriteString("   (Daftar saran perbaikan untuk parameter yang TIDAK MEMENUHI standar saja, dengan format):\n")
	userPrompt.WriteString("   1. [Nama Aspek] ([Kode Aspek]):\n")
	userPrompt.WriteString("      1.1. Perbaiki [Nama Parameter] ([Kode Parameter]) dengan [tindakan perbaikan spesifik dalam Bahasa Indonesia].\n")

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

	// Call OpenAI-compatible service
	payload := ChatCompletionRequest{
		Model:       modelName,
		Messages:    []ChatCompletionMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt.String()},
		},
		Temperature: 0.2,
		MaxTokens:   maxTokens,
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

	// Get timeout from database or fallback to cache/default (120 seconds)
	timeoutSec := 120
	var gp models.GlobalParameter
	if err := database.DB.Where("param_key = ?", "AI_TIMEOUT").First(&gp).Error; err == nil {
		if val, err := strconv.Atoi(gp.ParamValue); err == nil && val > 0 {
			timeoutSec = val
		}
	} else {
		cacheVal := models.GetGlobalParam("AI_TIMEOUT", "120")
		if val, err := strconv.Atoi(cacheVal); err == nil && val > 0 {
			timeoutSec = val
		}
	}

	client := &http.Client{Timeout: time.Duration(timeoutSec) * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghubungi AI API: " + err.Error() + ". Pastikan konfigurasi jaringan atau Ollama Anda aktif."})
		return
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca respon AI API: " + err.Error()})
		return
	}

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("AI API mengembalikan kode error %d: %s", resp.StatusCode, string(bodyBytes))})
		return
	}

	var chatResp ChatCompletionResponse
	if err := json.Unmarshal(bodyBytes, &chatResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca format JSON respon AI: " + err.Error()})
		return
	}

	if len(chatResp.Choices) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI API tidak memberikan pilihan draf respon."})
		return
	}

	reportContent := chatResp.Choices[0].Message.Content

	// Stitch the Go-generated Section B into the report
	cHeader := "C. Analisis Deviasi Teknis"
	idx := strings.Index(reportContent, cHeader)
	if idx != -1 {
		reportContent = reportContent[:idx] + goSectionB + "\n\n" + reportContent[idx:]
	} else {
		// Fallback: If C is not found, check B (in case AI generated a placeholder for B)
		bHeader := "B. Analisis Kekuatan"
		idxB := strings.Index(reportContent, bHeader)
		if idxB != -1 {
			reportContent = reportContent[:idxB] + goSectionB + "\n\n" + reportContent[idxB:]
		} else {
			reportContent = reportContent + "\n\n" + goSectionB
		}
	}
	c.JSON(http.StatusOK, gin.H{"report": reportContent})
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
