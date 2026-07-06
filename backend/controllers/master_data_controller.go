package controllers

import (
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Helper to get username from context
func getCtxUsername(c *gin.Context) string {
	if username, exists := c.Get("username"); exists {
		if u, ok := username.(string); ok {
			return u
		}
	}
	return "system"
}

// --- Partners ---
func GetPartners(c *gin.Context) {
	var partners []models.Partner
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit
	search := c.Query("search")
	if search == "" {
		search = c.Query("name")
	}

	query := database.DB.Model(&models.Partner{}).Preload("Type").Preload("City")
	
	if search != "" {
		if _, err := strconv.Atoi(search); err == nil {
			query = query.Where("id = ? OR name ILIKE ?", search, "%"+search+"%")
		} else {
			query = query.Where("name ILIKE ?", "%"+search+"%")
		}
	}

	var total int64
	query.Count(&total)

	err := query.Order("id asc").Limit(limit).Offset(offset).Find(&partners).Error
	if err != nil { 
		views.Error(c, 500, "Failed to fetch partners", err.Error())
		return 
	}

	views.SuccessWithMeta(c, partners, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Partners retrieved")
}

func CreatePartner(c *gin.Context) {
	var item models.Partner
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := item.Create(database.DB); err != nil {
		views.BadRequest(c, "Failed to create", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func GetHistPartners(c *gin.Context) {
	var items []models.HistPartner
	partnerID := c.Query("partner_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistPartner{}).Order("id desc")
	if partnerID != "" {
		query = query.Where("partner_id = ?", partnerID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func UpdatePartner(c *gin.Context) {
	id := c.Param("id")
	var item models.Partner
	if err := database.DB.First(&item, id).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistPartner{
		PartnerID:    item.ID,
		Name:         item.Name,
		TypeCode:     item.TypeCode,
		Alamat:       item.Alamat,
		CityCode:     item.CityCode,
		PicName:      item.PicName,
		PicEmail:     item.PicEmail,
		PicPhone:     item.PicPhone,
		CreatedAt:    item.CreatedAt,
		UpdatedAt:    item.UpdatedAt,
		CreatedUser:  item.CreatedUser,
		UpdatedUser:  getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	if err := item.Update(database.DB); err != nil {
		views.Error(c, 500, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeletePartner(c *gin.Context) {
	id := c.Param("id")
	var item models.Partner
	if err := database.DB.First(&item, id).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	username := getCtxUsername(c)
	
	// Record history before delete
	hist := models.HistPartner{
		PartnerID:    item.ID,
		Name:         item.Name,
		TypeCode:     item.TypeCode,
		Alamat:       item.Alamat,
		CityCode:     item.CityCode,
		PicName:      item.PicName,
		PicEmail:     item.PicEmail,
		PicPhone:     item.PicPhone,
		CreatedAt:    item.CreatedAt,
		UpdatedAt:    item.UpdatedAt,
		CreatedUser:  item.CreatedUser,
		UpdatedUser:  item.UpdatedUser,
		DeletedUser:  username,
	}
	database.DB.Create(&hist)

	item.DeletedUser = username
	database.DB.Save(&item)

	if err := database.DB.Delete(&item).Error; err != nil {
		views.Error(c, 500, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

// --- Material Categories ---
func GetMaterialCategories(c *gin.Context) {
	var items []models.MaterialCategory
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.MaterialCategory{})

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateMaterialCategory(c *gin.Context) {
	var item models.MaterialCategory
	c.ShouldBindJSON(&item)
	item.CreatedUser = getCtxUsername(c)
	item.Create(database.DB)
	views.Created(c, item, "Created")
}

func UpdateMaterialCategory(c *gin.Context) {
	id := c.Param("id")
	var item models.MaterialCategory
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Not found", "")
		return
	}

	// Record history before update
	hist := models.HistMaterialCategory{
		McCodeRef:   item.Code,
		Code:        item.Code,
		Name:        item.Name,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	c.ShouldBindJSON(&item)
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeleteMaterialCategory(c *gin.Context) {
	id := c.Param("id")
	var item models.MaterialCategory
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Not found", "")
		return
	}

	// Record history before delete
	hist := models.HistMaterialCategory{
		McCodeRef:   item.Code,
		Code:        item.Code,
		Name:        item.Name,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: item.UpdatedUser,
		DeletedAt:   time.Now(),
		DeletedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&item)
	views.Success(c, nil, "Deleted")
}

func GetHistMaterialCategories(c *gin.Context) {
	var items []models.HistMaterialCategory
	mcCode := c.Query("mc_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistMaterialCategory{}).Order("id desc")
	if mcCode != "" {
		query = query.Where("mc_code_ref = ?", mcCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}











// --- Origins, Brands, Models, Variants ---
func GetOrigins(c *gin.Context) {
	var items []models.Origin
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Origin{})
	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateOrigin(c *gin.Context) {
	var item models.Origin
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil {
		views.Error(c, 500, "Gagal menyimpan data", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func GetHistOrigins(c *gin.Context) {
	var items []models.HistOrigin
	originCode := c.Query("origin_code")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistOrigin{}).Order("id desc")
	if originCode != "" {
		query = query.Where("origin_code = ?", originCode)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func GetBrands(c *gin.Context) {
	var items []models.Brand
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Brand{}).Preload("Origin").Preload("MaterialCategory")

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateBrand(c *gin.Context) {
	var item models.Brand
	c.ShouldBindJSON(&item); item.CreatedUser = getCtxUsername(c)
	item.Create(database.DB)
	views.Created(c, item, "Created")
}

func GetModels(c *gin.Context) {
	var items []models.Model
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Model{}).Preload("Brand")
	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateModel(c *gin.Context) {
	var item models.Model
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil {
		views.Error(c, 500, "Gagal menyimpan data", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func GetHistModels(c *gin.Context) {
	var items []models.HistModel
	modelCode := c.Query("model_code")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistModel{}).Order("id desc")
	if modelCode != "" {
		query = query.Where("model_code = ?", modelCode)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func GetVariants(c *gin.Context) {
	var items []models.Variant
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Variant{}).Preload("Model")

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateVariant(c *gin.Context) {
	var item models.Variant
	c.ShouldBindJSON(&item); item.CreatedUser = getCtxUsername(c)
	item.Create(database.DB)
	views.Created(c, item, "Created")
}

// --- Test Types, Locations, Methodologies ---
func GetTestTypes(c *gin.Context) {
	var items []models.TestType
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.TestType{})
	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateTestType(c *gin.Context) {
	var item models.TestType
	c.ShouldBindJSON(&item); item.CreatedUser = getCtxUsername(c)
	database.DB.Create(&item)
	views.Created(c, item, "Created")
}

func GetLocations(c *gin.Context) {
	testTypeCode := c.Query("test_type_code")
	var items []models.Location
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Location{}).Preload("TestType").Preload("City.Province")
	if testTypeCode != "" {
		query = query.Where("test_type_code = ?", testTypeCode)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateLocation(c *gin.Context) {
	var item models.Location
	c.ShouldBindJSON(&item); item.CreatedUser = getCtxUsername(c)
	database.DB.Create(&item)
	views.Created(c, item, "Created")
}

func GetMethodologies(c *gin.Context) {
	testTypeCode := c.Query("test_type_code")
	var items []models.Methodology
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Methodology{}).Preload("TestType")
	if testTypeCode != "" {
		query = query.Where("test_type_code = ?", testTypeCode)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateMethodology(c *gin.Context) {
	var item models.Methodology
	c.ShouldBindJSON(&item); item.CreatedUser = getCtxUsername(c)
	database.DB.Create(&item)
	views.Created(c, item, "Created")
}

// --- Provinces & Cities ---
func GetProvinces(c *gin.Context) {
	var items []models.Province
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Province{})
	search := c.Query("search")
	if search != "" {
		query = query.Where("province_code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateProvince(c *gin.Context) {
	var item models.Province
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil {
		views.Error(c, 500, "Gagal menyimpan data", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func GetHistProvinces(c *gin.Context) {
	var items []models.HistProvince
	provinceCode := c.Query("province_code")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistProvince{}).Order("id desc")
	if provinceCode != "" {
		query = query.Where("province_code_ref = ?", provinceCode)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func GetCities(c *gin.Context) {
	var items []models.City
	
	// Check for nopaging
	if c.Query("nopaging") == "1" {
		if err := database.DB.Model(&models.City{}).Preload("Province").Order("name asc").Find(&items).Error; err != nil {
			views.Error(c, 500, "Gagal memproses data", err.Error())
			return
		}
		views.Success(c, items, "Retrieved")
		return
	}

	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.City{}).Preload("Province")

	search := c.Query("search")
	if search != "" {
		query = query.Where("city_code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateCity(c *gin.Context) {
	var item models.City
	c.ShouldBindJSON(&item); item.CreatedUser = getCtxUsername(c)
	database.DB.Create(&item)
	views.Created(c, item, "Created")
}

// --- Global Parameters CRUD ---
func GetGlobalParametersCRUD(c *gin.Context) {
	var items []models.GlobalParameter

	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit
	search := c.Query("search")

	query := database.DB.Model(&models.GlobalParameter{})
	if search != "" {
		query = query.Where("param_key ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	err := query.Order("param_key asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreateGlobalParameter(c *gin.Context) {
	var item models.GlobalParameter
	c.ShouldBindJSON(&item)
	item.CreatedUser = getCtxUsername(c)
	database.DB.Create(&item)
	models.RefreshParamCache(database.DB)
	views.Created(c, item, "Created")
}

func UpdateGlobalParameter(c *gin.Context) {
	var item models.GlobalParameter
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	hist := models.HistGlobalParameter{
		GpID:        item.ID,
		ParamKey:    item.ParamKey,
		ParamValue:  item.ParamValue,
		Description: item.Description,
		CreatedUser: item.CreatedUser,
		UpdatedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	c.ShouldBindJSON(&item)
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	models.RefreshParamCache(database.DB)
	views.Success(c, item, "Updated")
}

// --- Application Status ---
func GetStatusApplications(c *gin.Context) {
	var items []models.ApplicationStatus
	database.DB.Order("status_code asc").Find(&items)
	views.Success(c, items, "Retrieved")
}

func CreateStatusApplication(c *gin.Context) {
	var item models.ApplicationStatus
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := item.Create(database.DB); err != nil {
		views.Error(c, 500, "Gagal menyimpan data", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func UpdateStatusApplication(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	var item models.ApplicationStatus
	if err := item.GetByCode(database.DB, id); err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Snapshot for history
	hist := models.HistApplicationStatus{
		StatusCode:  strings.TrimSpace(item.StatusCode),
		Description: item.Description,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   time.Now(),
		CreatedUser: item.CreatedUser,
		UpdatedUser: getCtxUsername(c),
	}
	if hist.CreatedAt.IsZero() {
		hist.CreatedAt = time.Now()
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	item.UpdatedAt = time.Now()
	if err := item.Update(database.DB); err != nil {
		views.Error(c, 500, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteStatusApplication(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	var item models.ApplicationStatus
	if err := item.GetByCode(database.DB, id); err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	username := getCtxUsername(c)
	now := time.Now()
	// Snapshot for history before deletion
	hist := models.HistApplicationStatus{
		StatusCode:  strings.TrimSpace(item.StatusCode),
		Description: item.Description,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: item.UpdatedUser,
		DeletedAt:   &now,
		DeletedUser: username,
	}
	if hist.CreatedAt.IsZero() {
		hist.CreatedAt = now
	}
	database.DB.Create(&hist)

	if err := item.Delete(database.DB, id); err != nil {
		views.Error(c, 500, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func GetHistStatusApplications(c *gin.Context) {
	var items []models.HistApplicationStatus
	statusCode := strings.TrimSpace(c.Query("status_code"))

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistApplicationStatus{}).Order("id desc")
	if statusCode != "" {
		query = query.Where("status_code = ?", statusCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func DeleteGlobalParameter(c *gin.Context) {
	var item models.GlobalParameter
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	hist := models.HistGlobalParameter{
		GpID:        item.ID,
		ParamKey:    item.ParamKey,
		ParamValue:  item.ParamValue,
		Description: item.Description,
		CreatedUser: item.CreatedUser,
		UpdatedUser: item.UpdatedUser,
		DeletedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&models.GlobalParameter{}, c.Param("id"))
	models.RefreshParamCache(database.DB)
	views.Success(c, nil, "Deleted")
}

func GetHistGlobalParameters(c *gin.Context) {
	var items []models.HistGlobalParameter
	gpID := c.Query("gp_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistGlobalParameter{}).Order("id desc")
	if gpID != "" {
		query = query.Where("gp_id = ?", gpID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

// --- Master Asset Statuses ---
func GetAssetStatuses(c *gin.Context) {
	var items []models.MasterAssetStatus
	query := database.DB.Model(&models.MasterAssetStatus{})

	search := c.Query("search")
	if search != "" {
		query = query.Where("asset_status_code ILIKE ? OR asset_status_name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Find(&items)
	views.Success(c, items, "Retrieved")
}

func CreateAssetStatus(c *gin.Context) {
	var item models.MasterAssetStatus
	if err := c.ShouldBindJSON(&item); err != nil { views.BadRequest(c, "Input tidak valid", err.Error()); return }
	item.CreatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil { views.BadRequest(c, "Failed to create", err.Error()); return }
	views.Created(c, item, "Created")
}

func UpdateAssetStatus(c *gin.Context) {
	var item models.MasterAssetStatus
	if err := database.DB.Where("asset_status_code = ?", c.Param("id")).First(&item).Error; err != nil {
		views.Error(c, 404, "Not found", "")
		return
	}

	// Record history before update
	hist := models.HistMasterAssetStatus{
		AssetStatusCode: item.AssetStatusCode,
		AssetStatusName: item.AssetStatusName,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     getCtxUsername(c),
	}
	database.DB.Create(&hist)

	c.ShouldBindJSON(&item)
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeleteAssetStatus(c *gin.Context) {
	var item models.MasterAssetStatus
	if err := database.DB.Where("asset_status_code = ?", c.Param("id")).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before delete
	hist := models.HistMasterAssetStatus{
		AssetStatusCode: item.AssetStatusCode,
		AssetStatusName: item.AssetStatusName,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     item.UpdatedUser,
		DeletedAt:       time.Now(),
		DeletedUser:     getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item) // Update deleted_user before soft delete
	database.DB.Delete(&item)
	views.Success(c, nil, "Deleted")
}

func GetHistAssetStatuses(c *gin.Context) {
	var items []models.HistMasterAssetStatus
	masID := c.Query("mas_id")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistMasterAssetStatus{}).Order("id desc")
	if masID != "" {
		query = query.Where("mas_id = ?", masID)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

// --- Remaining placeholders to ensure routes don't break ---
func UpdateOrigin(c *gin.Context) {
	id := c.Param("id")
	var item models.Origin
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistOrigin{
		OriginCode:  item.Code,
		Code:        item.Code,
		Name:        item.Name,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Save(&item).Error; err != nil {
		views.Error(c, 500, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteOrigin(c *gin.Context) {
	id := c.Param("id")
	var item models.Origin
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	username := getCtxUsername(c)
	
	// Record history before delete
	hist := models.HistOrigin{
		OriginCode:  item.Code,
		Code:        item.Code,
		Name:        item.Name,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: item.UpdatedUser,
		DeletedUser: username,
	}
	database.DB.Create(&hist)

	item.DeletedUser = username
	database.DB.Save(&item)

	if err := database.DB.Delete(&item).Error; err != nil {
		views.Error(c, 500, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func UpdateBrand(c *gin.Context) {
	id := c.Param("id")
	var item models.Brand
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistBrand{
		BrandCodeRef:         item.Code,
		Code:                 item.Code,
		Name:                 item.Name,
		MaterialCategoryCode: item.MaterialCategoryCode,
		OriginCode:           item.OriginCode,
		CreatedAt:            item.CreatedAt,
		UpdatedAt:            item.UpdatedAt,
		CreatedUser:          item.CreatedUser,
		UpdatedUser:          getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeleteBrand(c *gin.Context) {
	id := c.Param("id")
	var item models.Brand
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before delete
	hist := models.HistBrand{
		BrandCodeRef:         item.Code,
		Code:                 item.Code,
		Name:                 item.Name,
		MaterialCategoryCode: item.MaterialCategoryCode,
		OriginCode:           item.OriginCode,
		CreatedAt:            item.CreatedAt,
		UpdatedAt:            item.UpdatedAt,
		CreatedUser:          item.CreatedUser,
		UpdatedUser:          item.UpdatedUser,
		DeletedAt:            time.Now(),
		DeletedUser:          getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&item)
	views.Success(c, nil, "Deleted")
}

func GetHistBrands(c *gin.Context) {
	var items []models.HistBrand
	brandCode := c.Query("brand_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistBrand{}).Order("id desc")
	if brandCode != "" {
		query = query.Where("brand_code_ref = ?", brandCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}


func UpdateModel(c *gin.Context) {
	id := c.Param("id")
	var item models.Model
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistModel{
		ModelCode:   item.Code,
		Code:        item.Code,
		Name:        item.Name,
		BrandCode:   item.BrandCode,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Save(&item).Error; err != nil {
		views.Error(c, 500, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteModel(c *gin.Context) {
	id := c.Param("id")
	var item models.Model
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	username := getCtxUsername(c)
	
	// Record history before delete
	hist := models.HistModel{
		ModelCode:   item.Code,
		Code:        item.Code,
		Name:        item.Name,
		BrandCode:   item.BrandCode,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: item.UpdatedUser,
		DeletedUser: username,
	}
	database.DB.Create(&hist)

	item.DeletedUser = username
	database.DB.Save(&item)

	if err := database.DB.Delete(&item).Error; err != nil {
		views.Error(c, 500, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func UpdateVariant(c *gin.Context) {
	id := c.Param("id")
	var item models.Variant
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistVariant{
		VariantCodeRef: item.Code,
		Code:           item.Code,
		Name:           item.Name,
		ModelCode:      item.ModelCode,
		CreatedAt:      item.CreatedAt,
		UpdatedAt:      item.UpdatedAt,
		CreatedUser:    item.CreatedUser,
		UpdatedUser:    getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeleteVariant(c *gin.Context) {
	id := c.Param("id")
	var item models.Variant
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before delete
	hist := models.HistVariant{
		VariantCodeRef: item.Code,
		Code:           item.Code,
		Name:           item.Name,
		ModelCode:      item.ModelCode,
		CreatedAt:      item.CreatedAt,
		UpdatedAt:      item.UpdatedAt,
		CreatedUser:    item.CreatedUser,
		UpdatedUser:    item.UpdatedUser,
		DeletedAt:      time.Now(),
		DeletedUser:    getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&item)
	views.Success(c, nil, "Deleted")
}

func GetHistVariants(c *gin.Context) {
	var items []models.HistVariant
	variantCode := c.Query("variant_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistVariant{}).Order("id desc")
	if variantCode != "" {
		query = query.Where("variant_code_ref = ?", variantCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func UpdateTestType(c *gin.Context) {
	code := c.Param("id") // The route parameter :id actually holds the code
	var item models.TestType
	if err := database.DB.Where("code = ?", code).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistTestType{
		TestTypeCode: item.Code,
		Code:         item.Code,
		Name:         item.Name,
		CreatedAt:    item.CreatedAt,
		UpdatedAt:    item.UpdatedAt,
		CreatedUser:  item.CreatedUser,
		UpdatedUser:  getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeleteTestType(c *gin.Context) {
	code := c.Param("id")
	var item models.TestType
	if err := database.DB.Where("code = ?", code).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before delete
	hist := models.HistTestType{
		TestTypeCode: item.Code,
		Code:         item.Code,
		Name:         item.Name,
		CreatedAt:    item.CreatedAt,
		UpdatedAt:    item.UpdatedAt,
		CreatedUser:  item.CreatedUser,
		UpdatedUser:  item.UpdatedUser,
		DeletedAt:    time.Now(),
		DeletedUser:  getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&item)
	views.Success(c, nil, "Deleted")
}

func GetHistTestTypes(c *gin.Context) {
	var items []models.HistTestType
	ttCode := c.Query("tt_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistTestType{}).Order("id desc")
	if ttCode != "" {
		query = query.Where("test_type_code = ?", ttCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}



func UpdateLocation(c *gin.Context) {
	id := c.Param("id")
	var item models.Location
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistLocation{
		LocationCodeRef: item.Code,
		Code:            item.Code,
		Name:            item.Name,
		TestTypeCode:    item.TestTypeCode,
		CityCode:        item.CityCode,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeleteLocation(c *gin.Context) {
	id := c.Param("id")
	var item models.Location
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before delete
	hist := models.HistLocation{
		LocationCodeRef: item.Code,
		Code:            item.Code,
		Name:            item.Name,
		TestTypeCode:    item.TestTypeCode,
		CityCode:        item.CityCode,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     item.UpdatedUser,
		DeletedAt:       time.Now(),
		DeletedUser:     getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&models.Location{}, "code = ?", id)
	views.Success(c, nil, "Deleted")
}

func GetHistLocations(c *gin.Context) {
	var items []models.HistLocation
	locationCode := c.Query("location_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistLocation{}).Order("id desc")
	if locationCode != "" {
		query = query.Where("location_code_ref = ?", locationCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}


func UpdateMethodology(c *gin.Context) {
	code := c.Param("id")
	var item models.Methodology
	if err := item.GetByCode(database.DB, code); err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistMethodology{
		MethodCodeRef:    item.Code,
		Code:             item.Code,
		Name:             item.Name,
		TestTypeCode:     item.TestTypeCode,
		ScoringLevelCode: item.ScoringLevelCode,
		CreatedAt:        item.CreatedAt,
		UpdatedAt:        item.UpdatedAt,
		CreatedUser:      item.CreatedUser,
		UpdatedUser:      getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	item.Update(database.DB)
	views.Success(c, item, "Updated")
}

func DeleteMethodology(c *gin.Context) {
	code := c.Param("id")
	var item models.Methodology
	if err := item.GetByCode(database.DB, code); err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before delete
	hist := models.HistMethodology{
		MethodCodeRef:    item.Code,
		Code:             item.Code,
		Name:             item.Name,
		TestTypeCode:     item.TestTypeCode,
		ScoringLevelCode: item.ScoringLevelCode,
		CreatedAt:        item.CreatedAt,
		UpdatedAt:        item.UpdatedAt,
		CreatedUser:      item.CreatedUser,
		UpdatedUser:      item.UpdatedUser,
		DeletedAt:        time.Now(),
		DeletedUser:      getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	if err := item.Delete(database.DB, code); err != nil {
		views.Error(c, 500, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func GetHistMethodologies(c *gin.Context) {
	var items []models.HistMethodology
	methodCode := c.Query("method_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistMethodology{}).Order("id desc")
	if methodCode != "" {
		query = query.Where("method_code_ref = ?", methodCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func UpdateProvince(c *gin.Context) {
	id := c.Param("id")
	var item models.Province
	if err := database.DB.Where("province_code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistProvince{
		ProvinceCodeRef: item.ProvinceCode,
		ProvinceCode:    item.ProvinceCode,
		ProvinceName:    item.Name,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Save(&item).Error; err != nil {
		views.Error(c, 500, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteProvince(c *gin.Context) {
	id := c.Param("id")
	var item models.Province
	if err := database.DB.Where("province_code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	username := getCtxUsername(c)
	
	// Record history before delete
	hist := models.HistProvince{
		ProvinceCodeRef: item.ProvinceCode,
		ProvinceCode:    item.ProvinceCode,
		ProvinceName:    item.Name,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     item.UpdatedUser,
		DeletedUser:     username,
	}
	database.DB.Create(&hist)

	item.DeletedUser = username
	database.DB.Save(&item)

	if err := database.DB.Delete(&item).Error; err != nil {
		views.Error(c, 500, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func UpdateCity(c *gin.Context) {
	id := c.Param("id")
	var item models.City
	if err := database.DB.Where("city_code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before update
	hist := models.HistCity{
		CityCodeRef:  item.CityCode,
		CityCode:     item.CityCode,
		CityName:     item.Name,
		ProvinceCode: item.ProvinceCode,
		GMTOffset:    item.GMTOffset,
		CreatedAt:    item.CreatedAt,
		UpdatedAt:    item.UpdatedAt,
		CreatedUser:  item.CreatedUser,
		UpdatedUser:  getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeleteCity(c *gin.Context) {
	id := c.Param("id")
	var item models.City
	if err := database.DB.Where("city_code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	// Record history before delete
	hist := models.HistCity{
		CityCodeRef:  item.CityCode,
		CityCode:     item.CityCode,
		CityName:     item.Name,
		ProvinceCode: item.ProvinceCode,
		GMTOffset:    item.GMTOffset,
		CreatedAt:    item.CreatedAt,
		UpdatedAt:    item.UpdatedAt,
		CreatedUser:  item.CreatedUser,
		UpdatedUser:  item.UpdatedUser,
		DeletedAt:    time.Now(),
		DeletedUser:  getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&models.City{}, "city_code = ?", id)
	views.Success(c, nil, "Deleted")
}

func GetHistCities(c *gin.Context) {
	var items []models.HistCity
	cityCode := c.Query("city_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistCity{}).Order("id desc")
	if cityCode != "" {
		query = query.Where("city_code_ref = ?", cityCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func GetPartnerTypes(c *gin.Context) {
	var items []models.PartnerType
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.PartnerType{})

	var total int64
	query.Count(&total)

	err := query.Order("name asc").Limit(limit).Offset(offset).Find(&items).Error
	if err != nil {
		views.Error(c, 500, "Gagal memproses data", err.Error())
		return
	}

	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func CreatePartnerType(c *gin.Context) {
	var item models.PartnerType
	c.ShouldBindJSON(&item); item.CreatedUser = getCtxUsername(c)
	database.DB.Create(&item)
	views.Created(c, item, "Created")
}

func UpdatePartnerType(c *gin.Context) {
	id := c.Param("id")
	var item models.PartnerType
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Not found", "")
		return
	}

	// Record history before update
	hist := models.HistPartnerType{
		PtCodeRef:   item.Code,
		Code:        item.Code,
		Name:        item.Name,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	c.ShouldBindJSON(&item)
	item.UpdatedUser = getCtxUsername(c)
	database.DB.Save(&item)
	views.Success(c, item, "Updated")
}

func DeletePartnerType(c *gin.Context) {
	id := c.Param("id")
	var item models.PartnerType
	if err := database.DB.Where("code = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Not found", "")
		return
	}

	// Record history before delete
	hist := models.HistPartnerType{
		PtCodeRef:   item.Code,
		Code:        item.Code,
		Name:        item.Name,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: item.UpdatedUser,
		DeletedAt:   time.Now(),
		DeletedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)
	database.DB.Delete(&item)
	views.Success(c, nil, "Deleted")
}

func GetHistPartnerTypes(c *gin.Context) {
	var items []models.HistPartnerType
	ptCode := c.Query("pt_code")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistPartnerType{}).Order("id desc")
	if ptCode != "" {
		query = query.Where("pt_code_ref = ?", ptCode)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}



func GetScoringAspects(c *gin.Context) {
	methodologyCode := c.Query("methodology_code")
	packageIDStr := c.Query("package_id")
	var aspects []models.ScoringAspect
	
	query := database.DB.Preload("Methodology").Preload("TestType").Preload("SubAspects")
	if methodologyCode != "" {
		query = query.Where("methodology_code = ?", methodologyCode)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Find(&aspects).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}

	// Filter aspects and sub-aspects by package active configuration if package_id is provided
	if packageIDStr != "" && packageIDStr != "0" {
		packageID, err := strconv.ParseUint(packageIDStr, 10, 64)
		if err == nil {
			var activeAspectCodes []string
			database.DB.Table("package_active_aspects").
				Where("package_id = ?", packageID).
				Pluck("aspect_code", &activeAspectCodes)

			var activeSubCodes []string
			database.DB.Table("package_active_sub_aspects").
				Where("package_id = ?", packageID).
				Pluck("sub_aspect_code", &activeSubCodes)

			// If activeAspectCodes is not empty, filter aspects
			if len(activeAspectCodes) > 0 {
				aspectMap := make(map[string]bool)
				for _, code := range activeAspectCodes {
					aspectMap[code] = true
				}
				var filteredAspects []models.ScoringAspect
				for _, aspect := range aspects {
					if aspectMap[aspect.Code] {
						// Filter sub-aspects inside the aspect
						if len(activeSubCodes) > 0 {
							subMap := make(map[string]bool)
							for _, sCode := range activeSubCodes {
								subMap[sCode] = true
							}
							var filteredSubs []models.ScoringSubAspect
							for _, sub := range aspect.SubAspects {
								if subMap[sub.Code] {
									filteredSubs = append(filteredSubs, sub)
								}
							}
							aspect.SubAspects = filteredSubs
						}
						filteredAspects = append(filteredAspects, aspect)
					}
				}
				aspects = filteredAspects
			}
		}
	}
	
	views.Success(c, aspects, "Retrieved")
}

func CreateScoringAspect(c *gin.Context) {
	var item models.ScoringAspect
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal menambahkan data", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func UpdateScoringAspect(c *gin.Context) {
	code := c.Param("id")
	var item models.ScoringAspect
	if err := database.DB.Where("code = ?", code).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)

	hist := models.HistScoringAspect{
		SaID:            item.Code,
		Code:            item.Code,
		Name:            item.Name,
		Description:     item.Description,
		Weight:          item.Weight,
		Threshold:       item.Threshold,
		MethodologyCode: item.MethodologyCode,
		TestTypeCode:    item.TestTypeCode,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     getCtxUsername(c),
		IsActive:        item.IsActive,
		IsUsed:          item.IsUsed,
	}
	database.DB.Create(&hist)

	if err := database.DB.Save(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteScoringAspect(c *gin.Context) {
	code := c.Param("id")
	var item models.ScoringAspect
	if err := database.DB.Where("code = ?", code).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	hist := models.HistScoringAspect{
		SaID:            item.Code,
		Code:            item.Code,
		Name:            item.Name,
		Description:     item.Description,
		Weight:          item.Weight,
		Threshold:       item.Threshold,
		MethodologyCode: item.MethodologyCode,
		TestTypeCode:    item.TestTypeCode,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
		CreatedUser:     item.CreatedUser,
		UpdatedUser:     item.UpdatedUser,
		DeletedUser:     getCtxUsername(c),
		IsActive:        item.IsActive,
		IsUsed:          item.IsUsed,
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)

	if err := database.DB.Where("code = ?", code).Delete(&models.ScoringAspect{}).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func GetHistScoringAspects(c *gin.Context) {
	var items []models.HistScoringAspect
	saID := c.Query("sa_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistScoringAspect{}).Order("id desc")
	if saID != "" {
		query = query.Where("sa_id = ?", saID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func GetScoringSubAspects(c *gin.Context) {
	aspectCode := c.Query("aspect_code")
	var items []models.ScoringSubAspect
	
	query := database.DB
	if aspectCode != "" {
		query = query.Where("aspect_code = ?", aspectCode)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.Success(c, items, "Retrieved")
}

func CreateScoringSubAspect(c *gin.Context) {
	var item models.ScoringSubAspect
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal menambahkan data", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func UpdateScoringSubAspect(c *gin.Context) {
	code := c.Param("id")
	var item models.ScoringSubAspect
	if err := database.DB.Where("code = ?", code).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)

	hist := models.HistScoringSubAspect{
		SsaID:       item.Code,
		Code:        item.Code,
		Name:        item.Name,
		AspectCode:  item.AspectCode,
		Description: item.Description,
		Weight:      item.Weight,
		IsSimulator: item.IsSimulator,
		IsActive:    item.IsActive,
		OCRKeywords: item.OCRKeywords,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := database.DB.Save(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteScoringSubAspect(c *gin.Context) {
	code := c.Param("id")
	var item models.ScoringSubAspect
	if err := database.DB.Where("code = ?", code).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	hist := models.HistScoringSubAspect{
		SsaID:       item.Code,
		Code:        item.Code,
		Name:        item.Name,
		AspectCode:  item.AspectCode,
		Description: item.Description,
		Weight:      item.Weight,
		IsSimulator: item.IsSimulator,
		IsActive:    item.IsActive,
		OCRKeywords: item.OCRKeywords,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
		CreatedUser: item.CreatedUser,
		UpdatedUser: item.UpdatedUser,
		DeletedUser: getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	database.DB.Save(&item)

	if err := database.DB.Where("code = ?", code).Delete(&models.ScoringSubAspect{}).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func GetHistScoringSubAspects(c *gin.Context) {
	var items []models.HistScoringSubAspect
	ssaID := c.Query("ssa_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistScoringSubAspect{}).Order("id desc")
	if ssaID != "" {
		query = query.Where("ssa_id = ?", ssaID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}
func GetScoringSubAspectItems(c *gin.Context) {
	var items []models.ScoringSubAspectItem
	q := database.DB.Preload("SubAspect")

	if subCodes := c.Query("sub_aspect_codes"); subCodes != "" {
		codes := strings.Split(subCodes, ",")
		q = q.Where("sub_aspect_code IN ?", codes)
	} else if subCode := c.Query("sub_aspect_code"); subCode != "" {
		q = q.Where("sub_aspect_code = ?", subCode)
	}

	search := c.Query("search")
	if search != "" {
		q = q.Where("sub_aspect_code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := q.Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Failed to fetch items", err.Error())
		return
	}
	views.Success(c, items, "Success")
}

func CreateScoringSubAspectItem(c *gin.Context) {
	var item models.ScoringSubAspectItem
	if err := c.ShouldBindJSON(&item); err != nil {
		views.Error(c, http.StatusBadRequest, "Invalid input", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Failed to create item", err.Error())
		return
	}
	views.Success(c, item, "Created")
}

func UpdateScoringSubAspectItem(c *gin.Context) {
	id := c.Param("id")
	var item models.ScoringSubAspectItem
	if err := database.DB.Where("id = ?", id).First(&item).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Item not found", err.Error())
		return
	}
	
	hist := models.HistScoringSubAspectItem{
		SaiID:         item.ID,
		SubAspectCode: item.SubAspectCode,
		Name:          item.Name,
		Score:         item.Score,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
		CreatedUser:   item.CreatedUser,
		UpdatedUser:   item.UpdatedUser,
		DeletedAt:     item.DeletedAt,
		DeletedUser:   item.DeletedUser,
	}
	database.DB.Create(&hist)

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		views.Error(c, http.StatusBadRequest, "Invalid input", err.Error())
		return
	}
	
	input["updated_user"] = getCtxUsername(c)
	if err := database.DB.Model(&item).Updates(input).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Failed to update item", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteScoringSubAspectItem(c *gin.Context) {
	id := c.Param("id")
	var item models.ScoringSubAspectItem
	if err := database.DB.Where("id = ?", id).First(&item).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Item not found", err.Error())
		return
	}
	
	now := time.Now()
	
	hist := models.HistScoringSubAspectItem{
		SaiID:         item.ID,
		SubAspectCode: item.SubAspectCode,
		Name:          item.Name,
		Score:         item.Score,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
		DeletedAt:     &now,
		DeletedUser:   getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	item.DeletedAt = &now
	database.DB.Save(&item)

	if err := database.DB.Delete(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Failed to delete item", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func GetHistScoringSubAspectItems(c *gin.Context) {
	var items []models.HistScoringSubAspectItem
	saiID := c.Query("sai_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistScoringSubAspectItem{}).Order("id desc")
	if saiID != "" {
		query = query.Where("sai_id = ?", saiID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}
func GetScoringLevels(c *gin.Context) {
	var items []models.ScoringLevel
	db := database.DB

	if groupCode := c.Query("level_group_code"); groupCode != "" {
		db = db.Where("level_group_code = ?", groupCode)
	}

	search := c.Query("search")
	if search != "" {
		db = db.Where("level_group_code ILIKE ? OR label ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := db.Order("min_score desc").Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.Success(c, items, "Retrieved")
}

func CreateScoringLevel(c *gin.Context) {
	var item models.ScoringLevel
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.CreatedUser = getCtxUsername(c)
	item.UpdatedUser = getCtxUsername(c)
	if err := database.DB.Create(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal menambahkan data", err.Error())
		return
	}
	views.Created(c, item, "Created")
}

func UpdateScoringLevel(c *gin.Context) {
	id := c.Param("id")
	var item models.ScoringLevel
	if err := database.DB.Where("id = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}
	item.UpdatedUser = getCtxUsername(c)

	hist := models.HistScoringLevel{
		SlID:           item.ID,
		LevelGroupCode: item.LevelGroupCode,
		MinScore:       item.MinScore,
		MaxScore:       item.MaxScore,
		Label:          item.Label,
		Description:    item.Description,
		CreatedAt:      item.CreatedAt,
		UpdatedAt:      item.UpdatedAt,
		CreatedUser:    item.CreatedUser,
		UpdatedUser:    getCtxUsername(c),
	}
	database.DB.Create(&hist)

	if err := database.DB.Save(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memperbarui data", err.Error())
		return
	}
	views.Success(c, item, "Updated")
}

func DeleteScoringLevel(c *gin.Context) {
	id := c.Param("id")
	var item models.ScoringLevel
	if err := database.DB.Where("id = ?", id).First(&item).Error; err != nil {
		views.Error(c, 404, "Data tidak ditemukan", "")
		return
	}

	hist := models.HistScoringLevel{
		SlID:           item.ID,
		LevelGroupCode: item.LevelGroupCode,
		MinScore:       item.MinScore,
		MaxScore:       item.MaxScore,
		Label:          item.Label,
		Description:    item.Description,
		CreatedAt:      item.CreatedAt,
		UpdatedAt:      item.UpdatedAt,
		CreatedUser:    item.CreatedUser,
		UpdatedUser:    item.UpdatedUser,
		DeletedUser:    getCtxUsername(c),
	}
	database.DB.Create(&hist)

	item.DeletedUser = getCtxUsername(c)
	now := time.Now()
	item.DeletedAt = &now
	database.DB.Save(&item)

	if err := database.DB.Delete(&item).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Deleted")
}

func GetHistScoringLevels(c *gin.Context) {
	var items []models.HistScoringLevel
	slID := c.Query("sl_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistScoringLevel{}).Order("id desc")
	if slID != "" {
		query = query.Where("sl_id = ?", slID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}
