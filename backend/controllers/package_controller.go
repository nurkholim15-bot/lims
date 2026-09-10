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

// --- Active Aspects & Sub-Aspects Management ---

func GetPackageActiveAspects(c *gin.Context) {
	var items []models.PackageActiveAspect
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", models.GetGlobalParam("PAGINATION_LIMIT", "10")))
	offset := (page - 1) * limit
	packageID := c.Query("package_id")
	aspectCode := c.Query("aspect_code")
	search := c.Query("search")

	query := database.DB.Model(&models.PackageActiveAspect{}).
		Preload("Package").
		Preload("Aspect").
		Preload("Aspect.Methodology")

	if packageID != "" {
		query = query.Where("package_active_aspects.package_id = ?", packageID)
	}
	if aspectCode != "" {
		query = query.Where("package_active_aspects.aspect_code = ?", aspectCode)
	}
	if search != "" {
		query = query.Joins("LEFT JOIN testing_packages tp ON tp.id = package_active_aspects.package_id").
			Joins("LEFT JOIN scoring_aspects sa ON sa.code = package_active_aspects.aspect_code").
			Where("tp.package_code ILIKE ? OR tp.name ILIKE ? OR sa.code ILIKE ? OR sa.name ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	if c.Query("dropdown") == "1" || c.Query("all") == "1" {
		if err := query.Order("package_active_aspects.package_id asc, package_active_aspects.aspect_code asc").Find(&items).Error; err != nil {
			views.Error(c, 500, "Gagal mengambil data aspek aktif paket", err.Error())
			return
		}
		views.Success(c, items, "Package aspects retrieved")
		return
	}

	err := query.Order("package_active_aspects.package_id asc, package_active_aspects.aspect_code asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal mengambil data aspek aktif paket", err.Error())
		return
	}

	views.SuccessWithMeta(c, items, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Package aspects retrieved")
}

func CreatePackageActiveAspect(c *gin.Context) {
	var input struct {
		PackageID   uint     `json:"package_id"`
		AspectCode  string   `json:"aspect_code"`
		AspectCodes []string `json:"aspect_codes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}

	if input.PackageID == 0 {
		views.BadRequest(c, "package_id wajib diisi", "")
		return
	}

	codesToInsert := input.AspectCodes
	if input.AspectCode != "" {
		codesToInsert = append(codesToInsert, input.AspectCode)
	}
	if len(codesToInsert) == 0 {
		views.BadRequest(c, "aspect_code atau aspect_codes wajib diisi", "")
		return
	}

	username := getCtxUsername(c)
	tx := database.DB.Begin()

	for _, code := range codesToInsert {
		if code == "" {
			continue
		}
		var count int64
		tx.Table("package_active_aspects").Where("package_id = ? AND aspect_code = ?", input.PackageID, code).Count(&count)
		if count == 0 {
			tx.Create(&models.HistPackageActiveAspect{
				PackageID:   input.PackageID,
				AspectCode:  code,
				ActionType:  "INSERT",
				CreatedAt:   time.Now(),
				CreatedUser: username,
			})
			if err := tx.Exec("INSERT INTO package_active_aspects (package_id, aspect_code, created_user, updated_user) VALUES (?, ?, ?, ?)", input.PackageID, code, username, username).Error; err != nil {
				tx.Rollback()
				views.Error(c, 500, "Gagal menambahkan aspek aktif ke paket", err.Error())
				return
			}
		}
	}

	tx.Commit()
	views.Created(c, nil, "Aspek aktif berhasil ditambahkan ke paket")
}

func DeletePackageActiveAspect(c *gin.Context) {
	pkgIDStr := c.Param("package_id")
	if pkgIDStr == "" {
		pkgIDStr = c.Query("package_id")
	}
	aspectCode := c.Param("aspect_code")
	if aspectCode == "" {
		aspectCode = c.Query("aspect_code")
	}

	if pkgIDStr == "" || aspectCode == "" {
		var req struct {
			PackageID  uint   `json:"package_id"`
			AspectCode string `json:"aspect_code"`
		}
		if err := c.ShouldBindJSON(&req); err == nil {
			if req.PackageID != 0 {
				pkgIDStr = strconv.Itoa(int(req.PackageID))
			}
			if req.AspectCode != "" {
				aspectCode = req.AspectCode
			}
		}
	}

	if pkgIDStr == "" || aspectCode == "" {
		views.BadRequest(c, "package_id dan aspect_code diperlukan", "")
		return
	}

	packageID, err := strconv.ParseUint(pkgIDStr, 10, 64)
	if err != nil {
		views.BadRequest(c, "ID paket tidak valid", err.Error())
		return
	}

	username := getCtxUsername(c)
	tx := database.DB.Begin()

	tx.Create(&models.HistPackageActiveAspect{
		PackageID:   uint(packageID),
		AspectCode:  aspectCode,
		ActionType:  "DELETE",
		CreatedAt:   time.Now(),
		CreatedUser: username,
	})

	if err := tx.Exec("DELETE FROM package_active_aspects WHERE package_id = ? AND aspect_code = ?", packageID, aspectCode).Error; err != nil {
		tx.Rollback()
		views.Error(c, 500, "Gagal menghapus aspek aktif dari paket", err.Error())
		return
	}

	tx.Commit()
	views.Success(c, nil, "Aspek aktif paket berhasil dihapus")
}

func GetPackageActiveSubAspects(c *gin.Context) {
	var items []models.PackageActiveSubAspect
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", models.GetGlobalParam("PAGINATION_LIMIT", "10")))
	offset := (page - 1) * limit
	packageID := c.Query("package_id")
	subAspectCode := c.Query("sub_aspect_code")
	aspectCode := c.Query("aspect_code")
	search := c.Query("search")

	query := database.DB.Model(&models.PackageActiveSubAspect{}).
		Preload("Package").
		Preload("SubAspect")

	if packageID != "" {
		query = query.Where("package_active_sub_aspects.package_id = ?", packageID)
	}
	if subAspectCode != "" {
		query = query.Where("package_active_sub_aspects.sub_aspect_code = ?", subAspectCode)
	}
	if aspectCode != "" {
		query = query.Joins("LEFT JOIN scoring_sub_aspects ssa ON ssa.code = package_active_sub_aspects.sub_aspect_code").
			Where("ssa.aspect_code = ?", aspectCode)
	}
	if search != "" {
		query = query.Joins("LEFT JOIN testing_packages tp ON tp.id = package_active_sub_aspects.package_id").
			Joins("LEFT JOIN scoring_sub_aspects ssa2 ON ssa2.code = package_active_sub_aspects.sub_aspect_code").
			Where("tp.package_code ILIKE ? OR tp.name ILIKE ? OR ssa2.code ILIKE ? OR ssa2.name ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	if c.Query("dropdown") == "1" || c.Query("all") == "1" {
		if err := query.Order("package_active_sub_aspects.package_id asc, package_active_sub_aspects.sub_aspect_code asc").Find(&items).Error; err != nil {
			views.Error(c, 500, "Gagal mengambil data sub-aspek aktif paket", err.Error())
			return
		}
		views.Success(c, items, "Package sub aspects retrieved")
		return
	}

	err := query.Order("package_active_sub_aspects.package_id asc, package_active_sub_aspects.sub_aspect_code asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal mengambil data sub-aspek aktif paket", err.Error())
		return
	}

	views.SuccessWithMeta(c, items, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Package sub aspects retrieved")
}

func CreatePackageActiveSubAspect(c *gin.Context) {
	var input struct {
		PackageID      uint     `json:"package_id"`
		SubAspectCode  string   `json:"sub_aspect_code"`
		SubAspectCodes []string `json:"sub_aspect_codes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}

	if input.PackageID == 0 {
		views.BadRequest(c, "package_id wajib diisi", "")
		return
	}

	codesToInsert := input.SubAspectCodes
	if input.SubAspectCode != "" {
		codesToInsert = append(codesToInsert, input.SubAspectCode)
	}
	if len(codesToInsert) == 0 {
		views.BadRequest(c, "sub_aspect_code atau sub_aspect_codes wajib diisi", "")
		return
	}

	username := getCtxUsername(c)
	tx := database.DB.Begin()

	for _, code := range codesToInsert {
		if code == "" {
			continue
		}
		var count int64
		tx.Table("package_active_sub_aspects").Where("package_id = ? AND sub_aspect_code = ?", input.PackageID, code).Count(&count)
		if count == 0 {
			tx.Create(&models.HistPackageActiveSubAspect{
				PackageID:     input.PackageID,
				SubAspectCode: code,
				ActionType:    "INSERT",
				CreatedAt:     time.Now(),
				CreatedUser:   username,
			})
			if err := tx.Exec("INSERT INTO package_active_sub_aspects (package_id, sub_aspect_code, created_user, updated_user) VALUES (?, ?, ?, ?)", input.PackageID, code, username, username).Error; err != nil {
				tx.Rollback()
				views.Error(c, 500, "Gagal menambahkan sub-aspek aktif ke paket", err.Error())
				return
			}
		}
	}

	tx.Commit()
	views.Created(c, nil, "Sub-aspek aktif berhasil ditambahkan ke paket")
}

func DeletePackageActiveSubAspect(c *gin.Context) {
	pkgIDStr := c.Param("package_id")
	if pkgIDStr == "" {
		pkgIDStr = c.Query("package_id")
	}
	subAspectCode := c.Param("sub_aspect_code")
	if subAspectCode == "" {
		subAspectCode = c.Query("sub_aspect_code")
	}

	if pkgIDStr == "" || subAspectCode == "" {
		var req struct {
			PackageID     uint   `json:"package_id"`
			SubAspectCode string `json:"sub_aspect_code"`
		}
		if err := c.ShouldBindJSON(&req); err == nil {
			if req.PackageID != 0 {
				pkgIDStr = strconv.Itoa(int(req.PackageID))
			}
			if req.SubAspectCode != "" {
				subAspectCode = req.SubAspectCode
			}
		}
	}

	if pkgIDStr == "" || subAspectCode == "" {
		views.BadRequest(c, "package_id dan sub_aspect_code diperlukan", "")
		return
	}

	packageID, err := strconv.ParseUint(pkgIDStr, 10, 64)
	if err != nil {
		views.BadRequest(c, "ID paket tidak valid", err.Error())
		return
	}

	username := getCtxUsername(c)
	tx := database.DB.Begin()

	tx.Create(&models.HistPackageActiveSubAspect{
		PackageID:     uint(packageID),
		SubAspectCode: subAspectCode,
		ActionType:    "DELETE",
		CreatedAt:     time.Now(),
		CreatedUser:   username,
	})

	if err := tx.Exec("DELETE FROM package_active_sub_aspects WHERE package_id = ? AND sub_aspect_code = ?", packageID, subAspectCode).Error; err != nil {
		tx.Rollback()
		views.Error(c, 500, "Gagal menghapus sub-aspek aktif dari paket", err.Error())
		return
	}

	tx.Commit()
	views.Success(c, nil, "Sub-aspek aktif paket berhasil dihapus")
}
