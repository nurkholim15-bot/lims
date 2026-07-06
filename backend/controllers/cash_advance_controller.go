package controllers

import (
	"fmt"
	"html"
	"lim-system/models"
	"lim-system/database"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GetCashAdvances returns cash advances based on user role
func GetCashAdvances(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	roleName := role.(string)

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.Query("search")
	status := c.Query("status")
	filterType := c.Query("type")
	filterYear := c.Query("year")
	filterMonth := c.Query("month")

	var page, limit int
	fmt.Sscanf(pageStr, "%d", &page)
	fmt.Sscanf(limitStr, "%d", &limit)
	if page < 1 { page = 1 }
	if limit < 1 { limit = 10 }
	offset := (page - 1) * limit

	sourceTable := "cash_advances"
	if filterYear != "" && filterMonth != "" {
		var y, m int
		fmt.Sscanf(filterYear, "%d", &y)
		fmt.Sscanf(filterMonth, "%d", &m)
		if y > 0 && m >= 1 && m <= 12 {
			suffix := fmt.Sprintf("%d%02d", y, m)
			partitionTable := fmt.Sprintf("cash_advances_%s", suffix)

			var exists bool
			database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", partitionTable).Scan(&exists)
			if exists {
				sourceTable = partitionTable
			}
		}
	}

	query := database.DB.Model(&models.CashAdvance{}).Table(sourceTable).Preload("User").Preload("TravelRequest")

	if roleName != "ADMIN" && roleName != "SUPERVISOR_REIMBURSE" {
		query = query.Where("user_id = ?", userID)
	} else if filterType == "mine" {
		query = query.Where("user_id = ?", userID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if filterYear != "" && filterMonth != "" {
		startDate := fmt.Sprintf("%s-%s-01", filterYear, filterMonth)
		query = query.Where(fmt.Sprintf("%s.created_at >= ? AND %s.created_at < (?::date + interval '1 month')", sourceTable, sourceTable), startDate, startDate)
	} else if filterYear != "" {
		startDate := fmt.Sprintf("%s-01-01", filterYear)
		query = query.Where(fmt.Sprintf("%s.created_at >= ? AND %s.created_at < (?::date + interval '1 year')", sourceTable, sourceTable), startDate, startDate)
	}

	if search != "" && search != "%" {
		searchPattern := "%" + search + "%"
		query = query.Joins(fmt.Sprintf("LEFT JOIN travel_requests ON travel_requests.id = %s.travel_request_id", sourceTable)).
			Where(fmt.Sprintf("%s.title ILIKE ? OR %s.no_cash_advance ILIKE ? OR travel_requests.reg_number ILIKE ?", sourceTable, sourceTable), searchPattern, searchPattern, searchPattern)
	}

	var total int64
	query.Count(&total)

	var advances []models.CashAdvance
	if err := query.Order(fmt.Sprintf("%s.id DESC", sourceTable)).Offset(offset).Limit(limit).Find(&advances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cash advances"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": advances,
		"metadata": gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

// CreateCashAdvance creates a new cash advance
func CreateCashAdvance(c *gin.Context) {
	username, _ := c.Get("username")
	usernameStr := username.(string)
	userID, _ := c.Get("user_id")

	var input models.CashAdvance
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.TravelRequestID != nil {
		// Verify travel request exists
		var travel models.TravelRequest
		if err := database.DB.First(&travel, *input.TravelRequestID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Travel Request tidak ditemukan"})
			return
		}
	}

	format := database.GetGlobalParam("CASH_ADVANCE_NUMBER_FORMAT", "ADV-%Y-%05d")
	now := time.Now()
	var currentVal int
	
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var counter models.CashAdvanceCounter
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("year = ?", now.Year()).First(&counter).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				counter = models.CashAdvanceCounter{Year: now.Year(), CurrentVal: 1}
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan nomor registrasi kasbon: " + err.Error()})
		return
	}

	noCashAdvance := strings.Replace(format, "%Y", fmt.Sprintf("%d", now.Year()), 1)
	noCashAdvance = strings.Replace(noCashAdvance, "%05d", fmt.Sprintf("%05d", currentVal), 1)

	input.NoCashAdvance = noCashAdvance
	input.UserID = userID.(uint)
	input.CreatedUser = usernameStr
	input.UpdatedUser = usernameStr
	input.Title = html.EscapeString(input.Title)
	input.Notes = html.EscapeString(input.Notes)
	input.CreatedAt = now
	input.UpdatedAt = now
	input.Status = "PENDING"
	input.Date = now

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cash advance: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// ApproveCashAdvance updates status
func ApproveCashAdvance(c *gin.Context) {
	id := c.Param("id")
	role, _ := c.Get("role")
	roleName := role.(string)

	if roleName != "ADMIN" && roleName != "SUPERVISOR_REIMBURSE" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya SUPERVISOR_REIMBURSE/ADMIN yang dapat memproses kasbon"})
		return
	}

	var advance models.CashAdvance
	if err := database.DB.First(&advance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cash Advance not found"})
		return
	}

	var req struct {
		Status string `json:"status"` // APPROVED, TRANSFERRED, REJECTED
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	
	if err := database.DB.Model(&advance).Updates(map[string]interface{}{
		"status": req.Status,
		"updated_user": username.(string),
		"updated_at": time.Now(),
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cash advance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cash advance status updated successfully"})
}
