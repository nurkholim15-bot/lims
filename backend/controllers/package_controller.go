package controllers

import (
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// --- Testing Packages ---

func GetTestingPackages(c *gin.Context) {
	var packages []models.TestingPackage
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", models.GetGlobalParam("PAGINATION_LIMIT", "10")))
	offset := (page - 1) * limit
	search := c.Query("search")

	query := database.DB.Model(&models.TestingPackage{}).Preload("Methodologies").Preload("ActiveAspects").Preload("ActiveSubAspects")
	
	if search != "" {
		query = query.Where("name ILIKE ? OR package_code ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("id asc").Limit(limit).Offset(offset).Find(&packages).Error
	if err != nil { 
		views.Error(c, 500, "Failed to fetch packages", err.Error())
		return 
	}

	views.SuccessWithMeta(c, packages, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Packages retrieved")
}

func CreateTestingPackage(c *gin.Context) {
	var input struct {
		PackageCode          string   `json:"package_code"`
		Name                 string   `json:"name"`
		Description          string   `json:"description"`
		BasePrice            float64  `json:"base_price"`
		IsActive             bool     `json:"is_active"`
		MethodologyCodes     []string `json:"methodology_codes"`
		ActiveAspectCodes    []string `json:"active_aspect_codes"`
		ActiveSubAspectCodes []string `json:"active_sub_aspect_codes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}

	username := getCtxUsername(c)
	
	tx := database.DB.Begin()
	
	tp := models.TestingPackage{
		PackageCode: input.PackageCode,
		Name:        input.Name,
		Description: input.Description,
		BasePrice:   input.BasePrice,
		IsActive:    input.IsActive,
		CreatedUser: username,
		UpdatedUser: username,
	}

	if err := tx.Create(&tp).Error; err != nil {
		tx.Rollback()
		views.Error(c, 500, "Gagal membuat paket", err.Error())
		return
	}

	// Link methodologies
	if len(input.MethodologyCodes) > 0 {
		var methods []models.Methodology
		tx.Where("code IN ?", input.MethodologyCodes).Find(&methods)
		if err := tx.Model(&tp).Association("Methodologies").Replace(methods); err != nil {
			tx.Rollback()
			views.Error(c, 500, "Gagal menghubungkan metodologi", err.Error())
			return
		}
	}

	// Link active aspects (with audit + insert history log)
	for _, code := range input.ActiveAspectCodes {
		tx.Create(&models.HistPackageActiveAspect{
			PackageID:   tp.ID,
			AspectCode:  code,
			ActionType:  "INSERT",
			CreatedAt:   time.Now(),
			CreatedUser: username,
		})
		tx.Exec("INSERT INTO package_active_aspects (package_id, aspect_code, created_user, updated_user) VALUES (?, ?, ?, ?)", tp.ID, code, username, username)
	}

	// Link active sub-aspects (with audit + insert history log)
	for _, code := range input.ActiveSubAspectCodes {
		tx.Create(&models.HistPackageActiveSubAspect{
			PackageID:     tp.ID,
			SubAspectCode: code,
			ActionType:    "INSERT",
			CreatedAt:     time.Now(),
			CreatedUser:   username,
		})
		tx.Exec("INSERT INTO package_active_sub_aspects (package_id, sub_aspect_code, created_user, updated_user) VALUES (?, ?, ?, ?)", tp.ID, code, username, username)
	}

	tx.Commit()
	views.Created(c, tp, "Paket berhasil dibuat")
}

func UpdateTestingPackage(c *gin.Context) {
	id := c.Param("id")
	var tp models.TestingPackage
	if err := database.DB.Preload("Methodologies").First(&tp, id).Error; err != nil {
		views.NotFound(c, "Paket tidak ditemukan")
		return
	}

	// Capture history before update
	capturePackageHistory(tp, "UPDATE", getCtxUsername(c))

	var input struct {
		PackageCode          string   `json:"package_code"`
		Name                 string   `json:"name"`
		Description          string   `json:"description"`
		BasePrice            float64  `json:"base_price"`
		IsActive             bool     `json:"is_active"`
		MethodologyCodes     []string `json:"methodology_codes"`
		ActiveAspectCodes    []string `json:"active_aspect_codes"`
		ActiveSubAspectCodes []string `json:"active_sub_aspect_codes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}

	username := getCtxUsername(c)
	tx := database.DB.Begin()

	tp.PackageCode = input.PackageCode
	tp.Name = input.Name
	tp.Description = input.Description
	tp.BasePrice = input.BasePrice
	tp.IsActive = input.IsActive
	tp.UpdatedUser = username
	tp.UpdatedAt = time.Now()

	if err := tx.Save(&tp).Error; err != nil {
		tx.Rollback()
		views.Error(c, 500, "Gagal memperbarui paket", err.Error())
		return
	}

	// Update methodologies
	var methods []models.Methodology
	if len(input.MethodologyCodes) > 0 {
		tx.Where("code IN ?", input.MethodologyCodes).Find(&methods)
	}
	if err := tx.Model(&tp).Association("Methodologies").Replace(methods); err != nil {
		tx.Rollback()
		views.Error(c, 500, "Gagal memperbarui metodologi paket", err.Error())
		return
	}

	// Compare active aspects and record INSERT/DELETE history
	var oldAspects []string
	tx.Table("package_active_aspects").Where("package_id = ?", tp.ID).Pluck("aspect_code", &oldAspects)
	oldMap := make(map[string]bool)
	for _, c := range oldAspects { oldMap[c] = true }
	newMap := make(map[string]bool)
	for _, c := range input.ActiveAspectCodes { newMap[c] = true }

	for _, c := range oldAspects {
		if !newMap[c] {
			tx.Create(&models.HistPackageActiveAspect{
				PackageID:   tp.ID,
				AspectCode:  c,
				ActionType:  "DELETE",
				CreatedAt:   time.Now(),
				CreatedUser: username,
			})
			tx.Exec("DELETE FROM package_active_aspects WHERE package_id = ? AND aspect_code = ?", tp.ID, c)
		}
	}
	for _, c := range input.ActiveAspectCodes {
		if !oldMap[c] {
			tx.Create(&models.HistPackageActiveAspect{
				PackageID:   tp.ID,
				AspectCode:  c,
				ActionType:  "INSERT",
				CreatedAt:   time.Now(),
				CreatedUser: username,
			})
			tx.Exec("INSERT INTO package_active_aspects (package_id, aspect_code, created_user, updated_user) VALUES (?, ?, ?, ?)", tp.ID, c, username, username)
		}
	}

	// Compare active sub-aspects and record INSERT/DELETE history
	var oldSubAspects []string
	tx.Table("package_active_sub_aspects").Where("package_id = ?", tp.ID).Pluck("sub_aspect_code", &oldSubAspects)
	oldSubMap := make(map[string]bool)
	for _, c := range oldSubAspects { oldSubMap[c] = true }
	newSubMap := make(map[string]bool)
	for _, c := range input.ActiveSubAspectCodes { newSubMap[c] = true }

	for _, c := range oldSubAspects {
		if !newSubMap[c] {
			tx.Create(&models.HistPackageActiveSubAspect{
				PackageID:     tp.ID,
				SubAspectCode: c,
				ActionType:    "DELETE",
				CreatedAt:     time.Now(),
				CreatedUser:   username,
			})
			tx.Exec("DELETE FROM package_active_sub_aspects WHERE package_id = ? AND sub_aspect_code = ?", tp.ID, c)
		}
	}
	for _, c := range input.ActiveSubAspectCodes {
		if !oldSubMap[c] {
			tx.Create(&models.HistPackageActiveSubAspect{
				PackageID:     tp.ID,
				SubAspectCode: c,
				ActionType:    "INSERT",
				CreatedAt:     time.Now(),
				CreatedUser:   username,
			})
			tx.Exec("INSERT INTO package_active_sub_aspects (package_id, sub_aspect_code, created_user, updated_user) VALUES (?, ?, ?, ?)", tp.ID, c, username, username)
		}
	}

	tx.Commit()
	views.Success(c, tp, "Paket berhasil diperbarui")
}

func DeleteTestingPackage(c *gin.Context) {
	id := c.Param("id")
	var tp models.TestingPackage
	if err := database.DB.First(&tp, id).Error; err != nil {
		views.NotFound(c, "Paket tidak ditemukan")
		return
	}

	capturePackageHistory(tp, "DELETE", getCtxUsername(c))

	if err := database.DB.Delete(&tp).Error; err != nil {
		views.Error(c, 500, "Gagal menghapus paket", err.Error())
		return
	}

	views.Success(c, nil, "Paket berhasil dihapus")
}

func GetHistTestingPackages(c *gin.Context) {
	var items []models.HistTestingPackage
	tpID := c.Query("tp_id")
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistTestingPackage{}).Order("id desc")
	if tpID != "" {
		query = query.Where("tp_id = ?", tpID)
	}
	
	var total int64
	query.Count(&total)

	err := query.Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal mengambil riwayat", err.Error())
		return
	}

	views.SuccessWithMeta(c, items, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "History retrieved")
}

func capturePackageHistory(tp models.TestingPackage, action string, user string) {
	hist := models.HistTestingPackage{
		TpID:        tp.ID,
		PackageCode: tp.PackageCode,
		Name:        tp.Name,
		Description: tp.Description,
		BasePrice:   tp.BasePrice,
		ActionType:  action,
		CreatedAt:   time.Now(),
		CreatedUser: user,
	}
	database.DB.Create(&hist)
}

func GetHistPackageActiveAspects(c *gin.Context) {
	var items []models.HistPackageActiveAspect
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")))
	offset := (page - 1) * limit
	packageID := c.Query("package_id")

	query := database.DB.Model(&models.HistPackageActiveAspect{})
	if packageID != "" {
		query = query.Where("package_id = ?", packageID)
	}

	var total int64
	query.Count(&total)

	err := query.Order("id desc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Failed to fetch package aspects history", err.Error())
		return
	}

	views.SuccessWithMeta(c, items, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Package aspects history retrieved")
}

func GetHistPackageActiveSubAspects(c *gin.Context) {
	var items []models.HistPackageActiveSubAspect
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")))
	offset := (page - 1) * limit
	packageID := c.Query("package_id")

	query := database.DB.Model(&models.HistPackageActiveSubAspect{})
	if packageID != "" {
		query = query.Where("package_id = ?", packageID)
	}

	var total int64
	query.Count(&total)

	err := query.Order("id desc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Failed to fetch package sub aspects history", err.Error())
		return
	}

	views.SuccessWithMeta(c, items, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Package sub aspects history retrieved")
}
