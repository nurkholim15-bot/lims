package controllers

import (
	"fmt"
	"html"
	"lim-system/models"
	"lim-system/database"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GetTravelRequests returns travel requests based on user role and filters
func GetTravelRequests(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	roleName := role.(string)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	status := c.Query("status")
	yearStr := c.Query("year")
	monthStr := c.Query("month")

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	var requests []models.TravelRequest
	var total int64

	filterType := c.Query("type")

	sourceTable := "travel_requests"
	if yearStr != "" && monthStr != "" {
		var y, m int
		fmt.Sscanf(yearStr, "%d", &y)
		fmt.Sscanf(monthStr, "%d", &m)
		if y > 0 && m >= 1 && m <= 12 {
			suffix := fmt.Sprintf("%d%02d", y, m)
			partitionTable := fmt.Sprintf("travel_requests_%s", suffix)

			var exists bool
			database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", partitionTable).Scan(&exists)
			if exists {
				sourceTable = partitionTable
			}
		}
	}

	query := database.DB.Model(&models.TravelRequest{}).Table(sourceTable).
		Preload("User").
		Preload("Location").
		Preload("Location.City").
		Preload("Location.City.Province")

	// Role-based filtering
	if roleName != "ADMIN" && roleName != "SUPERVISOR_SPD" {
		query = query.Where(fmt.Sprintf("%s.user_id = ?", sourceTable), userID)
	} else if filterType == "mine" {
		query = query.Where(fmt.Sprintf("%s.user_id = ?", sourceTable), userID)
	}

	// Search filter
	if search != "" {
		query = query.Where(fmt.Sprintf("%s.no_spd ILIKE ? OR %s.reg_number ILIKE ? OR %s.purpose ILIKE ? OR CAST(%s.id AS VARCHAR) ILIKE ?", sourceTable, sourceTable, sourceTable, sourceTable), "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Status filter
	if status != "" {
		query = query.Where(fmt.Sprintf("%s.status = ?", sourceTable), status)
	}

	// Count total
	query.Count(&total)

	// Fetch data with pagination
	err := query.Order(fmt.Sprintf("%s.created_at desc", sourceTable)).Offset(offset).Limit(limit).Find(&requests).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": requests,
		"source_table": sourceTable,
		"metadata": gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

// CreateTravelRequest creates a new SPD request
func CreateTravelRequest(c *gin.Context) {
	var req models.TravelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	
	req.UserID = userID.(uint)
	req.CreatedUser = username.(string)
	req.UpdatedUser = username.(string)
	req.Purpose = html.EscapeString(req.Purpose)
	req.Notes = html.EscapeString(req.Notes)
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()

	// 1. Generate Registration Number (Serial)
	format := database.GetGlobalParam("SPD_NUMBER_FORMAT", "SPD-%Y-%05d")
	now := time.Now()
	var currentVal int
	
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var counter models.TravelRequestCounter
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("year = ?", now.Year()).First(&counter).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				counter = models.TravelRequestCounter{Year: now.Year(), CurrentVal: 1}
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan nomor SPD: " + err.Error()})
		return
	}

	regNumber := strings.Replace(format, "%Y", fmt.Sprintf("%d", now.Year()), 1)
	regNumber = strings.Replace(regNumber, "%05d", fmt.Sprintf("%05d", currentVal), 1)

	req.NoSpd = regNumber

	if err := database.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create travel request: " + err.Error()})
		return
	}


	c.JSON(http.StatusCreated, req)
}

// UpdateTravelRequest updates an existing travel request
func UpdateTravelRequest(c *gin.Context) {
	id := c.Param("id")
	var req models.TravelRequest
	if err := database.DB.First(&req, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Travel request not found"})
		return
	}

	var input models.TravelRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	
	// Update fields
	req.LocationCode = input.LocationCode
	req.Purpose = html.EscapeString(input.Purpose)
	req.StartDate = input.StartDate
	req.EndDate = input.EndDate
	req.EstimatedBudget = input.EstimatedBudget
	req.RegNumber = input.RegNumber
	req.Status = input.Status
	req.Notes = html.EscapeString(input.Notes)
	req.UpdatedUser = username.(string)
	req.UpdatedAt = time.Now()

	if err := database.DB.Save(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update travel request: " + err.Error()})
		return
	}


	c.JSON(http.StatusOK, req)
}

// ApproveTravelRequest handles approval/rejection by supervisor
func ApproveTravelRequest(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("role")
	roleName := role.(string)

	if roleName != "ADMIN" && roleName != "SUPERVISOR_SPD" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya SUPERVISOR_SPD yang dapat menyetujui SPD"})
		return
	}

	var req models.TravelRequest
	if err := database.DB.First(&req, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Travel request not found"})
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
	req.Status = input.Status
	req.Notes = input.Notes
	req.UpdatedUser = username.(string)
	req.UpdatedAt = time.Now()

	if err := database.DB.Save(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve travel request: " + err.Error()})
		return
	}


	c.JSON(http.StatusOK, req)
}
