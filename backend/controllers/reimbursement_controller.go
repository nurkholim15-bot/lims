package controllers

import (
	"fmt"
	"html"
	"lim-system/models"
	"lim-system/services"
	"lim-system/database"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GetReimbursements returns reimbursements based on user role
func GetReimbursements(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	roleName := role.(string)

	// Pagination parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.Query("search")
	filterType := c.Query("type")
	status := c.Query("status")
	yearStr := c.Query("year")
	monthStr := c.Query("month")

	var page, limit int
	fmt.Sscanf(pageStr, "%d", &page)
	fmt.Sscanf(limitStr, "%d", &limit)
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	sourceTable := "reimbursements"
	if yearStr != "" && monthStr != "" {
		var y, m int
		fmt.Sscanf(yearStr, "%d", &y)
		fmt.Sscanf(monthStr, "%d", &m)
		if y > 0 && m >= 1 && m <= 12 {
			suffix := fmt.Sprintf("%d%02d", y, m)
			partitionTable := fmt.Sprintf("reimbursements_%s", suffix)

			var exists bool
			database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", partitionTable).Scan(&exists)
			if exists {
				sourceTable = partitionTable
			}
		}
	}

	var reimbursements []models.Reimbursement
	query := database.DB.Model(&models.Reimbursement{}).Table(sourceTable).Preload("User").Preload("TravelRequest").Preload("CashAdvance")

	// Filter by user role or type
	if roleName != "ADMIN" && roleName != "SUPERVISOR_REIMBURSE" {
		query = query.Where(fmt.Sprintf("%s.user_id = ?", sourceTable), userID)
	} else if filterType == "mine" {
		query = query.Where(fmt.Sprintf("%s.user_id = ?", sourceTable), userID)
	}

	// Status filter
	if status != "" {
		query = query.Where(fmt.Sprintf("%s.status = ?", sourceTable), status)
	}

	// Search filter
	if search != "" && search != "%" {
		searchPattern := "%" + search + "%"
		query = query.Joins(fmt.Sprintf("LEFT JOIN travel_requests ON travel_requests.id = %s.travel_request_id", sourceTable)).
			Where(fmt.Sprintf("%s.title ILIKE ? OR CAST(%s.id AS TEXT) ILIKE ? OR travel_requests.reg_number ILIKE ?", sourceTable, sourceTable), searchPattern, searchPattern, searchPattern)
	}

	var total int64
	query.Count(&total)

	if err := query.Order(fmt.Sprintf("%s.id DESC", sourceTable)).Offset(offset).Limit(limit).Find(&reimbursements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reimbursements"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": reimbursements,
		"metadata": gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

// CreateReimbursement creates a new reimbursement request
func CreateReimbursement(c *gin.Context) {
	username, _ := c.Get("username")
	usernameStr := username.(string)
	userID, _ := c.Get("user_id")

	// 1. Generate Registration Number (Serial)
	format := database.GetGlobalParam("REIMBURSE_NUMBER_FORMAT", "REIM-%Y-%05d")
	now := time.Now()
	var currentVal int
	
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var counter models.ReimbursementCounter
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("year = ?", now.Year()).First(&counter).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				counter = models.ReimbursementCounter{Year: now.Year(), CurrentVal: 1}
				if createErr := tx.Create(&counter).Error; createErr != nil {
					return createErr
				}
				currentVal = counter.CurrentVal
				return nil
			}
			return err
		}
		counter.CurrentVal += 1
		if saveErr := tx.Save(&counter).Error; saveErr != nil {
			return saveErr
		}
		currentVal = counter.CurrentVal
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan nomor registrasi: " + err.Error()})
		return
	}

	regNumber := strings.Replace(format, "%Y", fmt.Sprintf("%d", now.Year()), 1)
	regNumber = strings.Replace(regNumber, "%05d", fmt.Sprintf("%05d", currentVal), 1)

	var reimbursement models.Reimbursement
	reimbursement.RegNumber = regNumber
	reimbursement.Title = html.EscapeString(c.PostForm("title"))
	reimbursement.Notes = html.EscapeString(c.PostForm("notes"))
	reimbursement.UserID = userID.(uint)
	reimbursement.CreatedUser = usernameStr
	reimbursement.UpdatedUser = usernameStr
	reimbursement.CreatedAt = now
	reimbursement.UpdatedAt = now
	reimbursement.Status = "PENDING"
	
	if amountStr := c.PostForm("amount"); amountStr != "" {
		reimbursement.Amount, _ = strconv.ParseFloat(amountStr, 64)
	}
	
	if travelIDStr := c.PostForm("travel_request_id"); travelIDStr != "" {
		if travelID, err := strconv.ParseUint(travelIDStr, 10, 32); err == nil {
			id := uint(travelID)
			reimbursement.TravelRequestID = &id
		}
	}

	if advanceIDStr := c.PostForm("cash_advance_id"); advanceIDStr != "" {
		if advanceID, err := strconv.ParseUint(advanceIDStr, 10, 32); err == nil {
			id := uint(advanceID)
			reimbursement.CashAdvanceID = &id
			
			// Optional: We can validate if cash advance is valid, belongs to user, etc.
			var advance models.CashAdvance
			if err := database.DB.First(&advance, id).Error; err == nil {
				// Deduct the advance amount from the total reimbursement amount
				reimbursement.Amount = reimbursement.Amount - advance.Amount
			}
		}
	}
	// Parse Date
	if dateStr := c.PostForm("date"); dateStr != "" {
		t, _ := time.Parse("2006-01-02", dateStr)
		reimbursement.Date = t
	}

	// 2. Handle File Upload with Serial Prefix
	file, header, err := c.Request.FormFile("receipt")
	if err == nil {
		defer file.Close()
		
		// Use RegNumber as filename prefix
		ext := filepath.Ext(header.Filename)
		timestamp := now.Format("150405")
		uniqueName := fmt.Sprintf("%s_%s%s", regNumber, timestamp, ext)
		
		contentType := header.Header.Get("Content-Type")
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		path, uploadErr := services.Minio.UploadGenericFile(c.Request.Context(), uniqueName, file, header.Size, contentType)
		if uploadErr == nil {
			reimbursement.ReceiptPath = path
		} else {
			fmt.Printf("MinIO Upload Error: %v\n", uploadErr)
		}
	}

	if err := database.DB.Create(&reimbursement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reimbursement: " + err.Error()})
		return
	}


	c.JSON(http.StatusCreated, reimbursement)
}

// ApproveReimbursement handles approval/paid status
func ApproveReimbursement(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("role")
	roleName := role.(string)

	if roleName != "ADMIN" && roleName != "SUPERVISOR_REIMBURSE" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya SUPERVISOR_REIMBURSE yang dapat menyetujui reimbursement"})
		return
	}

	var reimbursement models.Reimbursement
	if err := database.DB.First(&reimbursement, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reimbursement not found"})
		return
	}

	var input struct {
		Status string `json:"status"`
		Notes  string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	reimbursement.Status = input.Status
	reimbursement.Notes = input.Notes
	reimbursement.UpdatedUser = username.(string)
	reimbursement.UpdatedAt = time.Now()

	if err := database.DB.Save(&reimbursement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update reimbursement: " + err.Error()})
		return
	}


	c.JSON(http.StatusOK, reimbursement)
}
