package controllers

import (
	"fmt"
	"lim-system/database"
	"lim-system/models"
	"lim-system/services"
	"lim-system/views"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// checkSOPPermission verifies if the user is an ADMIN or has CanManageSOP flag set to true
func checkSOPPermission(c *gin.Context) bool {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		views.Unauthorized(c, "User tidak terautentikasi")
		return false
	}

	userID := uint(0)
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	var currentUser models.User
	if err := database.DB.Preload("Role").First(&currentUser, userID).Error; err != nil {
		views.Unauthorized(c, "User tidak ditemukan")
		return false
	}

	if currentUser.Role.Name != "ADMIN" && currentUser.Role.Name != "SUPERVISOR_LABORATORY" {
		views.Forbidden(c, "Akses Ditolak: Hanya administrator atau supervisor laboratorium yang diperbolehkan mengelola berkas SOP")
		return false
	}

	return true
}

// UploadSOP handles uploading of a PDF SOP file, saving it locally,
// and triggering the background ingestion pipeline.
func UploadSOP(c *gin.Context) {
	if !checkSOPPermission(c) {
		return
	}

	file, err := c.FormFile("document")
	if err != nil {
		views.BadRequest(c, "No file uploaded under 'document' key", err.Error())
		return
	}

	// 1. Ensure file is a PDF
	ext := filepath.Ext(file.Filename)
	if ext != ".pdf" {
		views.BadRequest(c, "Only PDF files are supported for SOP ingestion", "")
		return
	}

	// 2. Ensure upload folder exists
	uploadDir := "./public/uploads/sop"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		views.InternalError(c, "Failed to create upload directory", err.Error())
		return
	}

	// 3. Save file with a unique name using timestamp prefix to avoid name collisions
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
	filePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		views.InternalError(c, "Failed to save uploaded file", err.Error())
		return
	}

	// 4. Create document record in database with status 'processing'
	doc := services.Document{
		FileName:   file.Filename,
		FilePath:   filePath,
		FileSize:   file.Size,
		UploadedAt: time.Now(),
		Status:     "processing",
	}

	if err := database.ChatBotDB.Create(&doc).Error; err != nil {
		// Clean up the saved file on DB insert failure
		os.Remove(filePath)
		views.InternalError(c, "Failed to record document metadata in database", err.Error())
		return
	}

	// 5. Trigger ingestion pipeline asynchronously in a background goroutine
	go services.IngestPDF(filePath, doc.ID)

	views.Created(c, doc, "SOP document uploaded successfully. Ingestion process started in the background.")
}

// ListSOPs returns all uploaded SOP documents from the database.
func ListSOPs(c *gin.Context) {
	var docs []services.Document
	if err := database.ChatBotDB.Order("uploaded_at desc").Find(&docs).Error; err != nil {
		views.InternalError(c, "Failed to retrieve documents from database", err.Error())
		return
	}

	views.Success(c, docs, "SOP documents retrieved successfully.")
}

// DeleteSOP deletes a document by ID, including its file and all its vector chunks.
func DeleteSOP(c *gin.Context) {
	if !checkSOPPermission(c) {
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		views.BadRequest(c, "Invalid document ID format", err.Error())
		return
	}

	var doc services.Document
	if err := database.ChatBotDB.First(&doc, id).Error; err != nil {
		views.NotFound(c, "SOP document not found")
		return
	}

	// 1. Delete physical file
	if err := os.Remove(doc.FilePath); err != nil && !os.IsNotExist(err) {
		// Log warning but proceed with DB delete in case file was already manually removed
		fmt.Printf("Warning: failed to delete physical file %s: %v\n", doc.FilePath, err)
	}

	// 2. Delete database record (foreign key cascade will delete related document_chunks automatically)
	if err := database.ChatBotDB.Delete(&doc).Error; err != nil {
		views.InternalError(c, "Failed to delete document from database", err.Error())
		return
	}

	views.Success(c, nil, "SOP document and associated vector chunks deleted successfully.")
}
