package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"lim-system/database"
	"lim-system/models"
	"lim-system/services"
	"lim-system/views"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

type ChatSearchResult struct {
	ID         uint    `json:"id"`
	DocumentID uint    `json:"document_id"`
	PageNumber int     `json:"page_number"`
	Content    string  `json:"content"`
	Distance   float64 `json:"distance"`
	FileName   string  `json:"file_name"`
}

type SourceCitation struct {
	FileName   string `json:"file_name"`
	PageNumber int    `json:"page_number"`
}

type ChatResponse struct {
	Answer  string           `json:"answer"`
	Sources []SourceCitation `json:"sources"`
}

// ProcessRAGQuery handles user questions by searching pgvector for relevant SOP chunks,
// parsing real-time database details, constructing prompts, calling the LLM, and returning the answer and sources.
func ProcessRAGQuery(message string, username string) (string, []SourceCitation, error) {
	// 1. Generate embedding for user query
	queryVector, err := services.GetEmbedding(message)
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate embedding: %w", err)
	}

	// Convert query vector to PostgreSQL pgvector string format
	var strVals []string
	for _, val := range queryVector {
		strVals = append(strVals, fmt.Sprintf("%f", val))
	}
	vectorStr := "[" + strings.Join(strVals, ",") + "]"

	// Load RAG parameters dynamically from database
	thresholdStr := models.GetGlobalParam("AI_SIMILARITY_THRESHOLD", "0.65")
	similarityThreshold, errParse := strconv.ParseFloat(thresholdStr, 64)
	if errParse != nil || similarityThreshold <= 0 {
		similarityThreshold = 0.65
	}

	limitStr := models.GetGlobalParam("AI_SEARCH_LIMIT", "4")
	searchLimit, errParseLimit := strconv.Atoi(limitStr)
	if errParseLimit != nil || searchLimit <= 0 {
		searchLimit = 4
	}

	// 2. Perform Cosine Similarity search in pgvector
	var results []ChatSearchResult
	errSearch := database.ChatBotDB.Raw(`
		SELECT c.id, c.document_id, c.page_number, c.content, (c.embedding <=> ?::vector) as distance, d.file_name
		FROM chat_sch.document_chunks c
		JOIN chat_sch.documents d ON c.document_id = d.id
		ORDER BY distance ASC
		LIMIT ?
	`, vectorStr, searchLimit).Scan(&results).Error

	if errSearch != nil {
		return "", nil, fmt.Errorf("database similarity search failed: %w", errSearch)
	}

	// 3. Detect intents and fetch real-time database context
	var statusContext string
	var productContext string
	messageLower := strings.ToLower(message)
	regPattern := regexp.MustCompile(`(?i)([A-Za-z]{3,4})-[A-Za-z0-9-]+`)
	regNumber := regPattern.FindString(message)

	// A. Intent: Lacak Progress / Status Aplikasi
	if regNumber != "" || strings.Contains(messageLower, "status") || strings.Contains(messageLower, "progress") || strings.Contains(messageLower, "lacak") || strings.Contains(messageLower, "proses") || strings.Contains(messageLower, "registrasi") || strings.Contains(messageLower, "verifikasi") {
		var apps []models.TestingApplication
		var queryErr error
		dbQuery := database.DB.Preload("Equipment").Preload("Partner")

		if regNumber != "" {
			queryErr = dbQuery.Where("reg_number ILIKE ?", "%"+regNumber+"%").Find(&apps).Error
		} else {
			queryErr = dbQuery.Where("created_user = ?", username).Order("created_at desc").Limit(3).Find(&apps).Error
		}

		if queryErr == nil && len(apps) > 0 {
			// Fetch current user details to check phone number
			var currentUser models.User
			_ = database.DB.Preload("Role").Where("username = ?", username).First(&currentUser).Error

			// Skip authorization check only for ADMIN and HELPDESK roles
			if currentUser.Role.Name != "ADMIN" && currentUser.Role.Name != "HELPDESK" {
				normUserPhone := normalizePhoneNumber(currentUser.Phone)
				for _, app := range apps {
					normPartnerPhone := normalizePhoneNumber(app.Partner.PicPhone)
					if normUserPhone == "" || normPartnerPhone == "" || normUserPhone != normPartnerPhone {
						return "Anda tidak berhak mengecek peralatan tsb", nil, nil
					}
				}
			}
			statusMap := map[string]string{
				"REGISTERED": "Registrasi Baru (Menunggu Verifikasi Administrasi)",
				"VERIFIED":   "Terverifikasi Administrasi (Menunggu Persetujuan Pimpinan)",
				"APPROVED":   "Disetujui Pimpinan (Menunggu Pembuatan Rencana Uji)",
				"PLANNED":    "Perencanaan Selesai (Menunggu Pelaksanaan Pengujian)",
				"EXECUTED":   "Pengujian Selesai Dilaksanakan (Menunggu Pengolahan Data)",
				"ANALYZED":   "Pengolahan & Analisa Data Selesai (Menunggu Finalisasi Laporan)",
				"FINALIZED":  "Laporan Uji Selesai (Finalized)",
				"REPORTED":   "Laporan Selesai & Sertifikasi Diterbitkan",
				"CERTIFIED":  "Sertifikasi Selesai",
				"CANCELLED":  "Dibatalkan",
				"CANCELED":   "Dibatalkan",
			}

			var sb strings.Builder
			sb.WriteString("DATA PROGRESS/STATUS PENGAJUAN UJI LIMS REALTIME DARI DATABASE:\n")
			for _, app := range apps {
				statusText := statusMap[strings.ToUpper(app.Status)]
				if statusText == "" {
					statusText = app.Status
				}
				eqName := "-"
				if app.Equipment.EquipmentName != "" {
					eqName = app.Equipment.EquipmentName
				}
				sb.WriteString(fmt.Sprintf("- Nomor Registrasi: %s\n", app.RegNumber))
				sb.WriteString(fmt.Sprintf("  Nama Alat: %s\n", eqName))
				sb.WriteString(fmt.Sprintf("  Status Tahapan LIMS: %s\n", statusText))
				sb.WriteString(fmt.Sprintf("  Tanggal Pengajuan: %s\n\n", app.CreatedAt.Format("02 January 2006")))
			}
			statusContext = sb.String()
		} else {
			if regNumber != "" {
				statusContext = fmt.Sprintf("DATA PROGRESS/STATUS PENGAJUAN UJI LIMS REALTIME DARI DATABASE:\n- Tidak ditemukan data pengajuan dengan nomor registrasi %s.\n", regNumber)
			} else {
				statusContext = "DATA PROGRESS/STATUS PENGAJUAN UJI LIMS REALTIME DARI DATABASE:\n- Anda belum memiliki data pengajuan pengujian terdaftar di LIMS saat ini.\n"
			}
		}
	}

	// B. Intent: Produk LIMS / Paket Pengujian
	if strings.Contains(messageLower, "produk") || strings.Contains(messageLower, "layanan") || strings.Contains(messageLower, "paket") || strings.Contains(messageLower, "mcu") || strings.Contains(messageLower, "biaya") || strings.Contains(messageLower, "harga") || strings.Contains(messageLower, "fasilitas") {
		var packages []models.TestingPackage
		queryErr := database.DB.Preload("Methodologies").Where("is_active = ?", true).Order("name asc").Find(&packages).Error
		if queryErr == nil && len(packages) > 0 {
			var sb strings.Builder
			sb.WriteString("DATA LAYANAN / PAKET PENGUJIAN (PRODUK LIMS) AKTIF DARI DATABASE:\n")
			for _, pkg := range packages {
				sb.WriteString(fmt.Sprintf("- Nama Layanan: %s (Kode: %s)\n", pkg.Name, pkg.PackageCode))
				sb.WriteString(fmt.Sprintf("  Biaya/Tarif: Rp %.0f\n", pkg.BasePrice))
				if pkg.Description != "" {
					sb.WriteString(fmt.Sprintf("  Keterangan: %s\n", pkg.Description))
				}
				if len(pkg.Methodologies) > 0 {
					var methods []string
					for _, m := range pkg.Methodologies {
						methods = append(methods, m.Name)
					}
					sb.WriteString(fmt.Sprintf("  Daftar Pengujian: %s\n", strings.Join(methods, ", ")))
				}
				sb.WriteString("\n")
			}
			productContext = sb.String()
		} else {
			productContext = "DATA LAYANAN / PAKET PENGUJIAN (PRODUK LIMS) AKTIF DARI DATABASE:\n- Belum ada paket pengujian aktif terdaftar di sistem.\n"
		}
	}

	// 4. Build context from search results and dynamic data
	var docContextBuilder strings.Builder
	var citations []SourceCitation
	seenCitations := make(map[string]bool)

	for _, res := range results {
		if res.Distance > similarityThreshold {
			continue
		}

		docContextBuilder.WriteString(fmt.Sprintf("\n--- DOKUMEN: %s (Halaman %d) ---\n", res.FileName, res.PageNumber))
		docContextBuilder.WriteString(res.Content)
		docContextBuilder.WriteString("\n")

		citeKey := fmt.Sprintf("%s:%d", res.FileName, res.PageNumber)
		if !seenCitations[citeKey] {
			seenCitations[citeKey] = true
			citations = append(citations, SourceCitation{
				FileName:   res.FileName,
				PageNumber: res.PageNumber,
			})
		}
	}

	// Assemble final context text
	var finalContextBuilder strings.Builder
	if statusContext != "" {
		finalContextBuilder.WriteString(statusContext)
		finalContextBuilder.WriteString("=========================================\n")
	}
	if productContext != "" {
		finalContextBuilder.WriteString(productContext)
		finalContextBuilder.WriteString("=========================================\n")
	}
	if docContextBuilder.Len() > 0 {
		finalContextBuilder.WriteString("KONTEKS RUJUKAN SOP LABORATORIUM:\n")
		finalContextBuilder.WriteString(docContextBuilder.String())
		finalContextBuilder.WriteString("=========================================\n")
	}

	finalContextText := finalContextBuilder.String()

	// 5. Construct prompts for LLM
	var systemPrompt string
	if finalContextText == "" {
		systemPrompt = "Anda adalah Asisten Lab AI LIMS yang cerdas, sopan, dan jujur. Karena tidak ditemukan rujukan SOP atau data transaksi/produk yang relevan dalam database saat ini, jawablah secara jujur bahwa informasi tersebut tidak ditemukan dalam sistem, lalu berikan saran umum yang membantu dengan ramah dalam Bahasa Indonesia."
	} else {
		systemPrompt = fmt.Sprintf(`Anda adalah AI Asisten Lab LIMS yang cerdas, jujur, ramah, dan berwibawa.
Tugas Anda adalah menjawab pertanyaan user secara komprehensif berdasarkan Konteks Data Realtime LIMS dan SOP Rujukan yang disediakan di bawah ini.

KONTEKS INFORMASI SYSTEM (REALTIME DATABASE & SOP):
=========================================
%s
=========================================

ATURAN UTAMA JAWABAN:
1. Jawablah pertanyaan user secara jelas, profesional, terstruktur, ramah, dan menggunakan Bahasa Indonesia yang baik dan benar.
2. Jika menjawab terkait status/progress pengajuan, bacalah bagian 'DATA PROGRESS/STATUS' di atas. Sebutkan detail No. Registrasi, Peralatan, dan tahapan status LIMS-nya secara lengkap dan ramah (misal: 'Saat ini pengajuan Anda berada di tahap Verifikasi Administrasi...').
3. Jika menjawab terkait produk LIMS/paket pengujian, sebutkan nama paket, tarif/biaya, deskripsi, serta metodenya secara rapi (gunakan format list/bullet points).
4. Jika menjawab terkait prosedur teknis, bacalah bagian 'KONTEKS RUJUKAN SOP' dan sebutkan nama file dokumen dan nomor halaman referensi yang Anda gunakan di dalam penjelasan jawaban Anda.
5. Jika informasi yang ditanyakan tidak terdapat pada data di atas, jawablah secara jujur bahwa informasi tersebut tidak terdaftar atau tidak ditemukan dalam sistem saat ini.
`, finalContextText)
	}

	// 5. Send payload to LLM (Ollama or Groq based on .env config)
	apiURL := os.Getenv("AI_API_URL")
	apiKey := os.Getenv("AI_API_KEY")
	modelName := os.Getenv("AI_MODEL")

	if apiURL == "" {
		apiURL = "https://api.groq.com/openai/v1"
	}
	if modelName == "" {
		modelName = "llama3-8b-8192"
	}

	fullURL := strings.TrimSuffix(apiURL, "/")
	if !strings.HasSuffix(fullURL, "/chat/completions") {
		fullURL = fullURL + "/chat/completions"
	}

	// Prepare chat messages
	messages := []ChatCompletionMessage{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: message},
	}

	chatReq := ChatCompletionRequest{
		Model:       modelName,
		Messages:    messages,
		Temperature: 0.2, // Low temperature for factual consistency
	}

	// Get max tokens parameter from DB
	maxTokensStr := models.GetGlobalParam("AI_MAX_TOKENS", "1000")
	if maxTokens, err := strconv.Atoi(maxTokensStr); err == nil && maxTokens > 0 {
		chatReq.MaxTokens = maxTokens
	}

	reqBody, err := json.Marshal(chatReq)
	if err != nil {
		return "", nil, fmt.Errorf("failed to serialize LLM request: %w", err)
	}

	timeoutStr := models.GetGlobalParam("AI_TIMEOUT", "120")
	timeoutSec, _ := strconv.Atoi(timeoutStr)
	client := &http.Client{
		Timeout: time.Duration(timeoutSec) * time.Second,
	}

	httpReq, err := http.NewRequest("POST", fullURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", nil, fmt.Errorf("failed to create LLM HTTP request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	if apiKey != "" && apiKey != "none" {
		httpReq.Header.Set("Authorization", "Bearer "+apiKey)
	}

	resp, err := client.Do(httpReq)
	if err != nil {
		return "", nil, fmt.Errorf("LLM server connection failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", nil, fmt.Errorf("failed to read LLM response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", nil, fmt.Errorf("LLM returned non-200 status code: %d, body: %s", resp.StatusCode, string(respBody))
	}

	var chatResp ChatCompletionResponse
	if err := json.Unmarshal(respBody, &chatResp); err != nil {
		return "", nil, fmt.Errorf("failed to parse LLM response: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return "", nil, fmt.Errorf("LLM returned empty choices")
	}

	return chatResp.Choices[0].Message.Content, citations, nil
}

// RAGChatQuery handles user questions by searching pgvector for relevant SOP chunks.
func RAGChatQuery(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		views.BadRequest(c, "Message is required", err.Error())
		return
	}

	// Get username from context (set by AuthMiddleware)
	usernameVal, _ := c.Get("username")
	username := "SYSTEM"
	if usernameVal != nil {
		username = usernameVal.(string)
	}

	answer, citations, err := ProcessRAGQuery(req.Message, username)
	if err != nil {
		views.InternalError(c, "Failed to process chat query", err.Error())
		return
	}

	// Return response with citations
	views.Success(c, ChatResponse{
		Answer:  answer,
		Sources: citations,
	}, "Response generated successfully")
}

func normalizePhoneNumber(phone string) string {
	// Remove all non-digit characters
	reg := regexp.MustCompile(`[^0-9]`)
	digits := reg.ReplaceAllString(phone, "")
	
	// Strip leading country code prefixes if they exist (e.g. 62 or 0)
	if strings.HasPrefix(digits, "62") {
		digits = strings.TrimPrefix(digits, "62")
	} else if strings.HasPrefix(digits, "0") {
		digits = strings.TrimPrefix(digits, "0")
	}
	
	return digits
}
