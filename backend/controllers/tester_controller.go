package controllers

import (
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetMasterTesters(c *gin.Context) {
	var testers []models.MasterTester
	query := database.DB.Model(&models.MasterTester{}).Preload("Methodology")

	if methodologyCode := c.Query("methodology_code"); methodologyCode != "" {
		query = query.Where("methodology_code = ?", methodologyCode)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("tester_id ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if c.Query("nopaging") == "1" || c.Query("all") == "1" {
		if err := query.Order("tester_id asc").Find(&testers).Error; err != nil {
			views.Error(c, http.StatusInternalServerError, "Gagal mengambil data", err.Error())
			return
		}
		views.Success(c, testers, "Data tim penguji retrieved")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	if c.Query("dropdown") == "1" {
		defaultLimit = models.GetGlobalParam("PAGINATION_DROPDOWN_LIMIT", "50")
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	err := query.Order("tester_id asc").Limit(limit).Offset(offset).Find(&testers).Error
	if err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal mengambil data", err.Error())
		return
	}

	views.SuccessWithPaging(c, testers, "Data tim penguji retrieved", total, page, limit)
}

func GetMasterTester(c *gin.Context) {
	id := c.Param("id")
	var tester models.MasterTester
	if err := database.DB.Preload("Methodology").First(&tester, id).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Data tidak ditemukan", err.Error())
		return
	}
	views.Success(c, tester, "Data tim penguji retrieved")
}

func CreateMasterTester(c *gin.Context) {
	var tester models.MasterTester
	if err := c.ShouldBindJSON(&tester); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}

	username, _ := c.Get("username")
	usernameStr := username.(string)
	tester.CreatedUser = usernameStr
	tester.UpdatedUser = usernameStr
	tester.CreatedAt = time.Now()
	tester.UpdatedAt = time.Now()

	if err := database.DB.Create(&tester).Error; err != nil {
		views.InternalError(c, "Gagal menambah data", err.Error())
		return
	}
	views.Created(c, tester, "Data tim penguji berhasil ditambahkan")
}

func UpdateMasterTester(c *gin.Context) {
	testerID := c.Param("id") // Param name is 'id' but it contains tester_id
	var tester models.MasterTester
	if err := database.DB.Where("tester_id = ?", testerID).First(&tester).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Data tidak ditemukan", err.Error())
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Input tidak valid", err.Error())
		return
	}

	username, _ := c.Get("username")
	usernameStr := username.(string)

	// Create History Snapshot
	hist := models.HistMasterTester{
		TesterIDRef:     tester.TesterID,
		TesterID:        tester.TesterID,
		Name:            tester.Name,
		Position:        tester.Position,
		MethodologyCode: tester.MethodologyCode,
		CreatedAt:       tester.CreatedAt,
		UpdatedAt:       tester.UpdatedAt,
		CreatedUser:     tester.CreatedUser,
		UpdatedUser:     usernameStr,
	}
	database.DB.Create(&hist)

	input["updated_user"] = usernameStr
	input["updated_at"] = time.Now()

	if err := database.DB.Model(&tester).Updates(input).Error; err != nil {
		views.InternalError(c, "Gagal mengupdate data", err.Error())
		return
	}
	views.Success(c, tester, "Data tim penguji berhasil diupdate")
}


func DeleteMasterTester(c *gin.Context) {
	testerID := c.Param("id")
	var tester models.MasterTester
	if err := database.DB.Where("tester_id = ?", testerID).First(&tester).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Data tidak ditemukan", err.Error())
		return
	}

	username, _ := c.Get("username")
	usernameStr := username.(string)

	// Create History Snapshot
	hist := models.HistMasterTester{
		TesterIDRef:     tester.TesterID,
		TesterID:        tester.TesterID,
		Name:            tester.Name,
		Position:        tester.Position,
		MethodologyCode: tester.MethodologyCode,
		CreatedAt:       tester.CreatedAt,
		UpdatedAt:       tester.UpdatedAt,
		CreatedUser:     tester.CreatedUser,
		UpdatedUser:     tester.UpdatedUser,
		DeletedAt:       time.Now(),
		DeletedUser:     usernameStr,
	}
	database.DB.Create(&hist)

	tester.DeletedUser = usernameStr
	database.DB.Save(&tester)

	if err := database.DB.Delete(&tester).Error; err != nil {
		views.InternalError(c, "Gagal menghapus data", err.Error())
		return
	}
	views.Success(c, nil, "Data tim penguji berhasil dihapus")
}


func GetHistMasterTesters(c *gin.Context) {
	var items []models.HistMasterTester
	testerID := c.Query("tester_id")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistMasterTester{}).Order("id desc")
	if testerID != "" {
		query = query.Where("tester_id_ref = ?", testerID)
	}

	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

