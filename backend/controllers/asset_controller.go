package controllers

import (
	"fmt"
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GetAssets fetches all equipment with asset tracking details
func GetAssets(c *gin.Context) {
	year := c.Query("year")
	month := c.Query("month")

	sourceTable := "testing_equipments"
	if year != "" && month != "" {
		potentialTable := fmt.Sprintf("testing_equipments_%s%s", year, month)
		var exists bool
		database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", potentialTable).Scan(&exists)
		if exists {
			sourceTable = potentialTable
		}
	}

	id := c.Query("id")
	search := c.Query("search")
	
	// Pagination Logic
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 { page = 1 }
	
	envLimit := os.Getenv("PAGINATION_LIMIT")
	if envLimit == "" { envLimit = "10" }
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", envLimit))
	if limit < 1 { limit = 10 }
	
	offset := (page - 1) * limit

	var total int64
	var assets []models.TestingEquipment
	
	baseQuery := database.DB.Table(sourceTable).
		Joins("LEFT JOIN testing_applications ON testing_applications.id = "+sourceTable+".application_id").
		Joins("LEFT JOIN partners ON partners.id = testing_applications.partner_id")

	if id != "" {
		baseQuery = baseQuery.Where(sourceTable+".id = ?", id)
	}

	if search != "" {
		searchPattern := "%" + search + "%"
		baseQuery = baseQuery.Where(sourceTable+".id::text ILIKE ? OR testing_applications.reg_number ILIKE ?", searchPattern, searchPattern)
	}

	// Count total records for pagination
	baseQuery.Count(&total)

	// Fetch data with limit/offset
	baseQuery.Select(sourceTable+".*", 
			"testing_applications.status as app_status",
			"testing_applications.final_status as app_final_status",
			"testing_applications.reg_number as app_reg_number",
			"testing_applications.created_at as app_reg_date",
			"testing_applications.partner_id as app_partner_id",
			"partners.name as app_partner_name").
		Order(sourceTable + ".id desc").
		Limit(limit).
		Offset(offset).
		Preload("Category").
		Preload("Brand.Origin").
		Preload("Model").
		Preload("AssetStatus").
		Preload("AssetLocation").
		Preload("Application").
		Find(&assets)

	views.SuccessWithMeta(c, assets, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Assets retrieved")
}

// LogAssetActivity handles Moving, Disposal, and Check-in
func LogAssetActivity(c *gin.Context) {
	var req struct {
		EquipmentID  uint64 `json:"equipment_id" binding:"required"`
		ActivityType string `json:"activity_type" binding:"required"` // MOVE, DISPO, CEKIN
		ToLocation   string `json:"to_location"`
		ToStatus     string `json:"to_status"`
		Notes        string `json:"notes"`
		PartnerID    *uint64 `json:"partner_id"`
		ReceiverName string `json:"receiver_name"`
		HandoverNo   string `json:"handover_no"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		views.BadRequest(c, "Invalid input", err.Error())
		return
	}

	// 1. Fetch current asset state (from parent table to ensure we find it if it moves across partitions)
	var equipment models.TestingEquipment
	if err := database.DB.Preload("Application").First(&equipment, req.EquipmentID).Error; err != nil {
		views.Error(c, 404, "Equipment not found", "")
		return
	}

	if req.ActivityType == "DISPO" {
		requiredStatus := database.GetGlobalParam("ASSET_STATUS_DISPOSAL", "Finalized")
		var appStatus string
		if equipment.Application != nil {
			appStatus = equipment.Application.Status
		} else {
			appStatus = "N/A"
		}

		if appStatus != requiredStatus {
			views.Error(c, 400, fmt.Sprintf("Disposal gagal karena status aplikasi %s tidak sesuai syarat disposal %s", appStatus, requiredStatus), "")
			return
		}
	}

	if req.ActivityType == "MOVE" {
		if req.ToStatus == "4" || req.ToStatus == "DISP" || req.ToStatus == "DISPOSAL" || req.ToStatus == "disp" || req.ToStatus == "disposal" {
			views.Error(c, 400, "Asset tidak boleh dipindah menjadi disposal", "")
			return
		}
	}

	username, _ := c.Get("username")
	now := time.Now()

	// 2. Create Log entry
	logEntry := models.AssetActivityLog{
		AssetID:      equipment.ID,
		ActivityType: req.ActivityType,
		FromLocation: equipment.AssetLocationCode,
		ToLocation:   req.ToLocation,
		FromStatus:   equipment.AssetStatusCode,
		ToStatus:     req.ToStatus,
		Notes:        req.Notes,
		CreatedAt:    now,
		CreatedUser:  username.(string),
	}

	// 3. Update Equipment state
	tx := database.DB.Begin()
	if err := tx.Create(&logEntry).Error; err != nil {
		tx.Rollback()
		views.InternalError(c, "Failed to create log", err.Error())
		return
	}

	updates := map[string]interface{}{
		"updated_at":   now,
		"updated_user": username.(string),
	}
	if req.ToLocation != "" {
		updates["asset_location_code"] = req.ToLocation
	}
	if req.ToStatus != "" {
		updates["asset_status_code"] = req.ToStatus
	}

	if err := tx.Model(&models.TestingEquipment{ID: equipment.ID}).Updates(updates).Error; err != nil {
		tx.Rollback()
		views.InternalError(c, "Failed to update equipment", err.Error())
		return
	}

	// 4. Create Handover entry if DISPO
	if req.ActivityType == "DISPO" {
		handoverNo := req.HandoverNo
		if handoverNo == "" {
			format := database.GetGlobalParam("HANDOVER_FORMAT", "BA-%d-%s")
			handoverNo = fmt.Sprintf(format, equipment.ID, now.Format("20060102"))
		}
		handover := models.AssetHandover{
			HandoverNo:   handoverNo,
			HandoverDate: now,
			PartnerID:    req.PartnerID,
			ReceiverName: req.ReceiverName,
			Notes:        req.Notes,
			AssetID:      equipment.ID,
			CreatedAt:    now,
			CreatedUser:  username.(string),
		}
		if err := tx.Create(&handover).Error; err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to create handover record", err.Error())
			return
		}
	}

	tx.Commit()
	views.Success(c, logEntry, "Activity logged successfully")
}

// GetAssetHandover retrieves handover details
func GetAssetHandover(c *gin.Context) {
	id := c.Param("id")
	var handover models.AssetHandover
	if err := database.DB.Preload("Partner").Preload("Asset.Brand.Origin").Preload("Asset.Model").Preload("Asset.Category").First(&handover, "asset_id = ?", id).Error; err != nil {
		views.Error(c, 404, "Handover record not found", err.Error())
		return
	}
	views.Success(c, handover, "Handover retrieved")
}

// GetAssetLogs fetches logs for a specific asset or all assets
func GetAssetLogs(c *gin.Context) {
	equipmentID := c.Query("equipment_id")
	year := c.Query("year")
	month := c.Query("month")

	sourceTable := "asset_activity_logs"
	if year != "" && month != "" {
		potentialTable := fmt.Sprintf("asset_activity_logs_%s%s", year, month)
		var exists bool
		database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", potentialTable).Scan(&exists)
		if exists {
			sourceTable = potentialTable
		}
	}

	var logs []models.AssetActivityLog
	query := database.DB.Table(sourceTable).Order("created_at desc")
	if equipmentID != "" {
		query = query.Where("asset_id = ?", equipmentID)
	}
	query.Find(&logs)
	views.Success(c, logs, "Logs retrieved")
}
