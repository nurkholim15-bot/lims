package controllers

import (
	"fmt"
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// --- Testing Tools Master ---

func GetTestingTools(c *gin.Context) {
	var tools []models.TestingTool
	query := database.DB.Preload("Location.City")

	if locationCode := c.Query("location_code"); locationCode != "" {
		query = query.Where("location_code = ?", locationCode)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Find(&tools)
	c.JSON(http.StatusOK, tools)
}

func CreateTestingTool(c *gin.Context) {
	var tool models.TestingTool
	if err := c.ShouldBindJSON(&tool); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	username, _ := c.Get("username")
	tool.CreatedUser = username.(string)
	tool.UpdatedUser = username.(string)
	if err := database.DB.Create(&tool).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal menambahkan alat: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, tool)
}

func UpdateTestingTool(c *gin.Context) {
	code := c.Param("code")
	var tool models.TestingTool
	if err := database.DB.Where("code = ?", code).First(&tool).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tool not found"})
		return
	}
	c.ShouldBindJSON(&tool)
	username, _ := c.Get("username")
	
	// Create history before update
	hist := models.HistTestingTool{
		TtID:         tool.Code,
		Code:         tool.Code,
		Name:         tool.Name,
		Type:         tool.Type,
		MinStock:     tool.MinStock,
		InitialStock: tool.InitialStock,
		CurrentStock: tool.CurrentStock,
		LocationCode: tool.LocationCode,
		CreatedAt:    tool.CreatedAt,
		UpdatedAt:    tool.UpdatedAt,
		CreatedUser:  tool.CreatedUser,
		UpdatedUser:  username.(string),
	}
	database.DB.Create(&hist)

	tool.UpdatedUser = username.(string)
	database.DB.Save(&tool)
	c.JSON(http.StatusOK, tool)
}

func DeleteTestingTool(c *gin.Context) {
	code := c.Param("code")
	var tool models.TestingTool
	if err := database.DB.Where("code = ?", code).First(&tool).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tool not found"})
		return
	}

	username, _ := c.Get("username")
	now := time.Now()

	// Create history before delete
	hist := models.HistTestingTool{
		TtID:         tool.Code,
		Code:         tool.Code,
		Name:         tool.Name,
		Type:         tool.Type,
		MinStock:     tool.MinStock,
		InitialStock: tool.InitialStock,
		CurrentStock: tool.CurrentStock,
		LocationCode: tool.LocationCode,
		CreatedAt:    tool.CreatedAt,
		UpdatedAt:    tool.UpdatedAt,
		CreatedUser:  tool.CreatedUser,
		UpdatedUser:  tool.UpdatedUser,
		DeletedAt:    gorm.DeletedAt{Time: now, Valid: true},
		DeletedUser:  username.(string),
	}
	database.DB.Create(&hist)

	tool.DeletedUser = username.(string)
	database.DB.Save(&tool)
	
	database.DB.Delete(&tool)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func GetHistTestingTools(c *gin.Context) {
	var items []models.HistTestingTool
	ttID := c.Query("tt_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Unscoped().Model(&models.HistTestingTool{}).Order("id desc")
	if ttID != "" {
		query = query.Where("tt_id = ?", ttID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

// --- Availability & Reservation ---

type AvailabilityRequest struct {
	ToolCode string `json:"tool_code" binding:"required"`
	Date     string `json:"date" binding:"required"` // YYYY-MM-DD
}

func GetToolAvailability(c *gin.Context) {
	toolCode := c.Query("tool_code")
	dateStr := c.Query("date")

	if toolCode == "" || dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tool_code and date are required"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format (YYYY-MM-DD)"})
		return
	}

	var tool models.TestingTool
	if err := database.DB.Preload("Location.City").Where("code = ?", toolCode).First(&tool).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tool not found"})
		return
	}

	// Office Hours: 08:00 - 17:00 local time
	// GMT Offset handled here
	// Default is GMT+7. If location is GMT+8, 08:00 local is 07:00 server (GMT+7).
	
	var availability []models.TestingToolAvailability
	avTableName := "testing_tool_availabilities_" + date.Format("200601")
	if err := database.DB.Table(avTableName).Where("tool_code = ? AND date = ?", toolCode, date).Find(&availability).Error; err != nil {
		// Fallback to parent table if partition doesn't exist
		database.DB.Where("tool_code = ? AND date = ?", toolCode, date).Find(&availability)
	}

	// Build the 24-hour grid
	type HourlySlot struct {
		Hour     int    `json:"hour"`
		Status   string `json:"status"` // AVAILABLE, BOOKED, OUT_OF_OFFICE, LOW_STOCK
		BookedBy string `json:"booked_by,omitempty"`
		Quantity int    `json:"quantity"`
	}

	grid := make([]HourlySlot, 24)
	for h := 0; h < 24; h++ {
		// Default status
		status := "OUT_OF_OFFICE"
		
		// Logic for Office Hours (08:00 - 17:00 local time)
		// Default server time is GMT+7.
		// offsetDelta is the difference between tool's GMT and server's GMT (+7)
		offsetDelta := tool.Location.City.GMTOffset - 7
		
		// If it's 08:00 local time, what is it in server time (GMT+7)?
		// local_time = server_time + offsetDelta
		// server_time = local_time - offsetDelta
		
		serverStartHour := 8 - offsetDelta
		serverEndHour := 17 - offsetDelta
		
		if h >= serverStartHour && h < serverEndHour {
			status = "AVAILABLE"
		}

		grid[h] = HourlySlot{
			Hour:     h,
			Status:   status,
			Quantity: 1, // Default for non-stock or available
		}
		
		if tool.Type == "STOCK" {
			avail := tool.CurrentStock - tool.MinStock
			if avail < 0 {
				avail = 0
			}
			grid[h].Quantity = avail
			if avail <= 0 {
				grid[h].Status = "BOOKED"
			}
		}
	}

	// Fetch existing reservations for this tool on this date
	var reservations []models.TestingToolReservation
	resTableName := "testing_tool_reservations_" + date.Format("200601")
	if err := database.DB.Table(resTableName).Where("tool_code = ? AND date(start_time) = ?", toolCode, date).Find(&reservations).Error; err != nil {
		// Fallback to parent table if partition doesn't exist
		database.DB.Where("tool_code = ? AND date(start_time) = ?", toolCode, date).Find(&reservations)
	}

	for _, res := range reservations {
		start := res.StartTime.Hour()
		end := res.EndTime.Hour()

		for h := start; h < end; h++ {
			if h >= 0 && h < 24 {
				if tool.Type == "STOCK" {
					grid[h].Quantity -= res.Quantity
					if grid[h].Quantity <= 0 {
						grid[h].Quantity = 0
						grid[h].Status = "BOOKED"
					}
				} else {
					grid[h].Status = "BOOKED"
					var user models.User
					database.DB.First(&user, res.UserID)
					grid[h].BookedBy = user.Username
				}
			}
		}
	}

	// Overlay manual availability overrides if any (testing_tool_availabilities table)
	for _, av := range availability {
		if av.Hour >= 0 && av.Hour < 24 {
			grid[av.Hour].Status = av.Status
			grid[av.Hour].Quantity = av.Quantity
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"tool":         tool,
		"date":         dateStr,
		"gmt_offset":   tool.Location.City.GMTOffset,
		"availability": grid,
	})
}

type ReserveRequest struct {
	ToolCode      string `json:"tool_code" binding:"required"`
	ApplicationID uint64 `json:"application_id" binding:"required"`
	Date          string `json:"date" binding:"required"` // YYYY-MM-DD
	StartHour     int    `json:"start_hour"`              // 0-23
	EndHour       int    `json:"end_hour"`                // 0-23
	Quantity      int    `json:"quantity"`                // for STOCK
}

func ReserveTool(c *gin.Context) {
	var req ReserveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, _ := time.Parse("2006-01-02", req.Date)
	username, _ := c.Get("username")
	var user models.User
	database.DB.Where("username = ?", username).First(&user)

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Check if tool exists
	var tool models.TestingTool
	if err := tx.Where("code = ?", req.ToolCode).First(&tool).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Tool not found"})
		return
	}

	avTableName := "testing_tool_availabilities_" + date.Format("200601")
	resTableName := "testing_tool_reservations_" + date.Format("200601")

	// 2. Check availability (Persistent table check)
	for h := req.StartHour; h <= req.EndHour; h++ {
		var existing models.TestingToolAvailability
		var err error
		if err = tx.Table(avTableName).Set("gorm:query_option", "FOR UPDATE").
			Where("tool_code = ? AND date = ? AND hour = ?", req.ToolCode, date, h).
			First(&existing).Error; err != nil {
			// Fallback to parent table if partition doesn't exist
			err = tx.Set("gorm:query_option", "FOR UPDATE").
				Where("tool_code = ? AND date = ? AND hour = ?", req.ToolCode, date, h).
				First(&existing).Error
		}

		if err == nil {
			// Already booked or maintenance
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("Alat sudah di-book pada jam %02d:00 oleh user lain.", h)})
			return
		}
	}

	// 3. Create persistent availability records
	for h := req.StartHour; h <= req.EndHour; h++ {
		av := models.TestingToolAvailability{
			ToolCode:  req.ToolCode,
			Date:      date,
			Hour:      h,
			Status:    "BOOKED",
			BookedBy:  user.ID,
			Quantity:  req.Quantity,
			CreatedAt: date, // Align with partition range constraint
		}
		if err := tx.Table(avTableName).Create(&av).Error; err != nil {
			// Fallback to parent table
			if errFallback := tx.Create(&av).Error; errFallback != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ketersediaan: " + errFallback.Error()})
				return
			}
		}
	}

	// 4. Create reservation activity record
	startTime := time.Date(date.Year(), date.Month(), date.Day(), req.StartHour, 0, 0, 0, time.Local)
	endTime := time.Date(date.Year(), date.Month(), date.Day(), req.EndHour, 59, 59, 0, time.Local)

	res := models.TestingToolReservation{
		ToolCode:      req.ToolCode,
		UserID:        user.ID,
		ApplicationID: req.ApplicationID,
		StartTime:     startTime,
		EndTime:       endTime,
		Quantity:      req.Quantity,
		Status:        "BOOKED",
		CreatedAt:     startTime, // Align with partition range constraint
	}
	if err := tx.Table(resTableName).Create(&res).Error; err != nil {
		// Fallback to parent table
		if errFallback := tx.Create(&res).Error; errFallback != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan reservasi: " + errFallback.Error()})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Booking berhasil disimpan", "reservation": res})
}

// --- Stock Management ---

func getCurrentToolTransactionTable() string {
	return "testing_tool_transactions_" + time.Now().Format("200601")
}

func AddToolStock(c *gin.Context) {
	var req struct {
		ToolCode string `json:"tool_code" binding:"required"`
		Quantity int    `json:"quantity" binding:"required"`
		Notes    string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := database.DB.Begin()

	// 1. Get Tool
	var tool models.TestingTool
	if err := tx.Where("code = ?", req.ToolCode).First(&tool).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Tool not found"})
		return
	}

	// 2. Update Stock
	stockBefore := tool.CurrentStock
	tool.CurrentStock += req.Quantity
	stockAfter := tool.CurrentStock

	if err := tx.Save(&tool).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update stok"})
		return
	}

	// 3. Create Transaction Record (to partitioned table)
	tableName := getCurrentToolTransactionTable()
	transaction := models.TestingToolTransaction{
		ToolCode:      req.ToolCode,
		Type:          "IN",
		Quantity:      req.Quantity,
		ReferenceType: "ADJUSTMENT",
		StockBefore:   stockBefore,
		StockAfter:    stockAfter,
		Notes:         req.Notes,
		CreatedAt:     time.Now(),
	}
	
	if err := tx.Table(tableName).Create(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencatat transaksi ke partisi: " + err.Error()})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Stok berhasil ditambahkan", "current_stock": tool.CurrentStock})
}

func GetToolTransactions(c *gin.Context) {
	code := c.Param("code")
	tableName := getCurrentToolTransactionTable()
	
	var transactions []models.TestingToolTransaction
	// Try current partition, fallback to parent if partition doesn't exist yet
	if err := database.DB.Table(tableName).Where("tool_code = ?", code).Order("created_at desc").Find(&transactions).Error; err != nil {
		// Fallback to parent table if partition is missing
		database.DB.Where("tool_code = ?", code).Order("created_at desc").Find(&transactions)
	}
	c.JSON(http.StatusOK, transactions)
}
