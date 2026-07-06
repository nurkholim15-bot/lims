package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"lim-system/database"
	"lim-system/models"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Document represents the metadata of an uploaded PDF file
type Document struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	FileName   string    `gorm:"size:255;not null" json:"file_name"`
	FilePath   string    `gorm:"size:255;not null" json:"file_path"`
	FileSize   int64     `json:"file_size"`
	UploadedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"uploaded_at"`
	Status     string    `gorm:"size:50;default:'processing'" json:"status"`
}

// TableName defines the table name for Document model
func (Document) TableName() string {
	return "chat_sch.documents"
}

// DocumentChunk represents a single chunk of text from a document, along with its page number
type DocumentChunk struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	DocumentID uint   `gorm:"not null" json:"document_id"`
	PageNumber int    `json:"page_number"`
	Content    string `gorm:"type:text;not null" json:"content"`
}

// TableName defines the table name for DocumentChunk model
func (DocumentChunk) TableName() string {
	return "chat_sch.document_chunks"
}

// GetEmbedding makes an HTTP call to the configured embedding API (Ollama or OpenAI-compatible)
// and returns the vector representation of the text.
func GetEmbedding(text string) ([]float32, error) {
	// First check for dedicated embedding API URL
	apiURL := os.Getenv("AI_EMBEDDING_API_URL")
	if apiURL == "" {
		apiURL = models.GetGlobalParam("AI_EMBEDDING_API_URL", "")
	}
	
	// Fallback logic if dedicated URL is not defined
	if apiURL == "" {
		generalAPI := os.Getenv("AI_API_URL")
		// If the main AI_API_URL is local, use it as fallback
		if strings.Contains(generalAPI, "11434") || strings.Contains(generalAPI, "localhost") || strings.Contains(generalAPI, "127.0.0.1") || strings.Contains(generalAPI, "172.24.96.1") {
			apiURL = generalAPI
		} else {
			// Otherwise default to local Ollama on host
			apiURL = "http://localhost:11434"
		}
	}

	modelName := os.Getenv("AI_EMBEDDING_MODEL")
	if modelName == "" {
		modelName = models.GetGlobalParam("AI_EMBEDDING_MODEL", "nomic-embed-text")
	}

	// Detect if it is Ollama direct API (which uses /api/embeddings) or OpenAI-compatible API
	isOllamaDirect := !strings.Contains(apiURL, "/v1") && (strings.Contains(apiURL, "11434") || strings.Contains(apiURL, "localhost") || strings.Contains(apiURL, "127.0.0.1") || strings.Contains(apiURL, "172.24.96.1"))

	var endpoint string
	var reqBody []byte
	var err error

	if isOllamaDirect {
		endpoint = strings.TrimSuffix(apiURL, "/") + "/api/embeddings"
		reqData := map[string]interface{}{
			"model":  modelName,
			"prompt": text,
		}
		reqBody, err = json.Marshal(reqData)
	} else {
		// OpenAI compatible format (e.g. Groq, local API gateway, etc.)
		base := strings.TrimSuffix(apiURL, "/")
		base = strings.Replace(base, "/chat/completions", "", 1)
		base = strings.Replace(base, "/completions", "", 1)

		if !strings.HasSuffix(base, "/v1") && !strings.Contains(base, "/v1/") {
			endpoint = base + "/v1/embeddings"
		} else {
			endpoint = base + "/embeddings"
		}

		reqData := map[string]interface{}{
			"model": modelName,
			"input": text,
		}
		reqBody, err = json.Marshal(reqData)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to marshal request data: %v", err)
	}

	// Read timeout configuration
	timeoutStr := models.GetGlobalParam("AI_TIMEOUT", "120")
	timeoutSec, _ := strconv.Atoi(timeoutStr)
	client := &http.Client{
		Timeout: time.Duration(timeoutSec) * time.Second,
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	apiKey := os.Getenv("AI_API_KEY")
	if apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %v", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api returned non-200 status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var embedding []float32
	if isOllamaDirect {
		var respData struct {
			Embedding []float32 `json:"embedding"`
		}
		if err := json.Unmarshal(bodyBytes, &respData); err != nil {
			return nil, fmt.Errorf("failed to unmarshal ollama response: %v, raw: %s", err, string(bodyBytes))
		}
		embedding = respData.Embedding
	} else {
		var respData struct {
			Data []struct {
				Embedding []float32 `json:"embedding"`
			} `json:"data"`
		}
		if err := json.Unmarshal(bodyBytes, &respData); err != nil {
			return nil, fmt.Errorf("failed to unmarshal openai response: %v, raw: %s", err, string(bodyBytes))
		}
		if len(respData.Data) == 0 {
			return nil, fmt.Errorf("no embedding returned in openai response: %s", string(bodyBytes))
		}
		embedding = respData.Data[0].Embedding
	}

	if len(embedding) == 0 {
		return nil, fmt.Errorf("received empty embedding vector")
	}

	return embedding, nil
}

// SplitText splits a raw text string into smaller overlapping chunks.
func SplitText(text string, chunkSize int, chunkOverlap int) []string {
	// Standardize spaces and newlines
	text = strings.Join(strings.Fields(text), " ")

	var chunks []string
	length := len(text)

	if length <= chunkSize {
		if length > 0 {
			chunks = append(chunks, text)
		}
		return chunks
	}

	start := 0
	for start < length {
		end := start + chunkSize
		if end > length {
			end = length
		}

		// Avoid cutting words mid-character if possible
		if end < length {
			lastSpace := strings.LastIndex(text[start:end], " ")
			if lastSpace > chunkSize/2 {
				end = start + lastSpace
			}
		}

		chunks = append(chunks, strings.TrimSpace(text[start:end]))

		if end >= length {
			break
		}

		// Advance pointer
		start = end - chunkOverlap
		if start >= end {
			start = end
		}
	}

	return chunks
}

// IngestPDF reads PDF page-by-page, extracts text, cuts into chunks,
// generates vector embeddings, and stores them in PostgreSQL pgvector.
func IngestPDF(filePath string, docID uint) {
	log.Printf("[RAG-Ingest] Starting ingestion for document ID %d, path: %s", docID, filePath)

	// 1. Get total page count using pdfinfo
	pageCount, err := getPDFPageCount(filePath)
	if err != nil {
		log.Printf("[RAG-Ingest] Error getting page count: %v", err)
		updateDocStatus(docID, "failed")
		return
	}
	log.Printf("[RAG-Ingest] Document ID %d has %d pages.", docID, pageCount)

	totalChunks := 0

	// 2. Loop through pages and process chunks
	for page := 1; page <= pageCount; page++ {
		text, err := extractPageText(filePath, page)
		if err != nil {
			log.Printf("[RAG-Ingest] Warning: failed to extract text from page %d: %v. Skipping page.", page, err)
			continue
		}

		trimmedText := strings.TrimSpace(text)
		if len(trimmedText) < 10 {
			log.Printf("[RAG-Ingest] Page %d is empty or contains too little text (scanned PDF). Skipping.", page)
			continue
		}

		// Load chunk size and overlap configurations dynamically from DB global parameters
		chunkSizeStr := models.GetGlobalParam("AI_CHUNK_SIZE", "1000")
		chunkSize, errParseSize := strconv.Atoi(chunkSizeStr)
		if errParseSize != nil || chunkSize <= 0 {
			chunkSize = 1000
		}

		chunkOverlapStr := models.GetGlobalParam("AI_CHUNK_OVERLAP", "200")
		chunkOverlap, errParseOverlap := strconv.Atoi(chunkOverlapStr)
		if errParseOverlap != nil || chunkOverlap < 0 {
			chunkOverlap = 200
		}

		// Split page text into overlapping chunks
		chunks := SplitText(trimmedText, chunkSize, chunkOverlap)
		log.Printf("[RAG-Ingest] Page %d split into %d chunks using size %d and overlap %d.", page, len(chunks), chunkSize, chunkOverlap)

		for _, chunk := range chunks {
			if len(chunk) < 5 {
				continue
			}

			// Generate vector embedding
			embedding, err := GetEmbedding(chunk)
			if err != nil {
				log.Printf("[RAG-Ingest] Error generating embedding for chunk in page %d: %v. Aborting document.", page, err)
				updateDocStatus(docID, "failed")
				return
			}

			// Convert float32 array to pgvector string format: [val1,val2,...]
			var strVals []string
			for _, val := range embedding {
				strVals = append(strVals, fmt.Sprintf("%f", val))
			}
			vectorStr := "[" + strings.Join(strVals, ",") + "]"

			// Insert chunk and vector into DB using GORM Raw SQL
			errInsert := database.ChatBotDB.Exec(
				"INSERT INTO chat_sch.document_chunks (document_id, page_number, content, embedding) VALUES (?, ?, ?, ?)",
				docID, page, chunk, vectorStr,
			).Error
			if errInsert != nil {
				log.Printf("[RAG-Ingest] Error saving chunk to DB: %v. Aborting document.", errInsert)
				updateDocStatus(docID, "failed")
				return
			}
			totalChunks++
		}
	}

	log.Printf("[RAG-Ingest] Completed ingestion for document ID %d. Processed %d total chunks.", docID, totalChunks)
	updateDocStatus(docID, "completed")
}

func getPDFPageCount(pdfPath string) (int, error) {
	cmd := exec.Command("pdfinfo", pdfPath)
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return 0, err
	}

	re := regexp.MustCompile(`Pages:\s+(\d+)`)
	matches := re.FindStringSubmatch(out.String())
	if len(matches) < 2 {
		return 0, fmt.Errorf("could not find page count in pdfinfo output")
	}

	return strconv.Atoi(matches[1])
}

func extractPageText(pdfPath string, page int) (string, error) {
	cmd := exec.Command("pdftotext", "-f", strconv.Itoa(page), "-l", strconv.Itoa(page), "-layout", pdfPath, "-")
	var out bytes.Buffer
	cmd.Stdout = &out
	if err := cmd.Run(); err != nil {
		return "", err
	}
	return out.String(), nil
}

func updateDocStatus(docID uint, status string) {
	err := database.ChatBotDB.Exec("UPDATE chat_sch.documents SET status = ? WHERE id = ?", status, docID).Error
	if err != nil {
		log.Printf("[RAG-Ingest] Error updating document status to %s for ID %d: %v", status, docID, err)
	}
}
