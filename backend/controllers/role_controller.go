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
)

func GetRoles(c *gin.Context) {
	var roles []models.Role
	
	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Role{})

	search := c.Query("search")
	if search != "" {
		if id, err := strconv.Atoi(search); err == nil {
			query = query.Where("id = ? OR name ILIKE ?", id, "%"+search+"%")
		} else {
			query = query.Where("name ILIKE ?", "%"+search+"%")
		}
	}

	var total int64
	query.Count(&total)

	err := query.Order("id desc").Limit(limit).Offset(offset).Find(&roles).Error
	if err != nil {
		views.InternalError(c, "Failed to fetch roles", err.Error())
		return
	}

	views.SuccessWithPaging(c, roles, "Roles retrieved", total, page, limit)
}

func GetRole(c *gin.Context) {
	id := c.Param("id")
	var role models.Role
	if err := database.DB.Preload("Menus").First(&role, id).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Role not found", err.Error())
		return
	}
	views.Success(c, role, "Role retrieved")
}

func CreateRole(c *gin.Context) {
	var role models.Role
	if err := c.ShouldBindJSON(&role); err != nil {
		views.BadRequest(c, "Invalid input", err.Error())
		return
	}

	username, _ := c.Get("username")
	role.CreatedUser = username.(string)
	role.UpdatedUser = username.(string)

	database.DB.Create(&role)
	models.RefreshRoleMenuCache(database.DB)

	views.Created(c, role, "Role created successfully")
}

func UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var role models.Role
	if err := database.DB.First(&role, id).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Role not found", err.Error())
		return
	}

	var input models.Role
	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Invalid input", err.Error())
		return
	}

	username, _ := c.Get("username")
	input.UpdatedUser = username.(string)

	hist := models.HistRole{
		RoleID:      role.ID,
		Name:        role.Name,
		Description: role.Description,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
		CreatedUser: role.CreatedUser,
		UpdatedUser: username.(string),
	}
	database.DB.Create(&hist)

	if err := database.DB.Model(&role).Updates(input).Error; err != nil {
		views.InternalError(c, "Failed to update role", err.Error())
		return
	}
	models.RefreshRoleMenuCache(database.DB)
	views.Success(c, role, "Role updated successfully")
}

func DeleteRole(c *gin.Context) {
	id := c.Param("id")
	var role models.Role
	if err := database.DB.First(&role, id).Error; err != nil {
		views.Error(c, http.StatusNotFound, "Role not found", err.Error())
		return
	}

	username, _ := c.Get("username")
	usernameStr := ""
	if username != nil {
		usernameStr = username.(string)
	}

	hist := models.HistRole{
		RoleID:      role.ID,
		Name:        role.Name,
		Description: role.Description,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
		CreatedUser: role.CreatedUser,
		UpdatedUser: role.UpdatedUser,
		DeletedUser: usernameStr,
	}
	database.DB.Create(&hist)

	role.DeletedUser = usernameStr
	database.DB.Save(&role)

	if err := database.DB.Delete(&models.Role{}, id).Error; err != nil {
		views.InternalError(c, "Failed to delete role", err.Error())
		return
	}
	models.RefreshRoleMenuCache(database.DB)
	views.Success(c, nil, "Role deleted successfully")
}

func GetHistRoles(c *gin.Context) {
	var items []models.HistRole
	roleID := c.Query("role_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistRole{}).Order("id desc")
	if roleID != "" {
		query = query.Where("role_id = ?", roleID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func AssignMenusToRole(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		MenuIDs []uint `json:"menu_ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Menu IDs are required", err.Error())
		return
	}

	username, _ := c.Get("username")
	usernameStr := username.(string)

	tx := database.DB.Begin()
	
	// Capture existing menus for history before deleting
	var existingMenus []models.RoleMenu
	if err := tx.Where("role_id = ?", id).Find(&existingMenus).Error; err != nil {
		tx.Rollback()
		views.InternalError(c, "Failed to fetch existing menus", err.Error())
		return
	}

	if len(existingMenus) > 0 {
		var historyRecords []models.HistRoleMenu
		for _, em := range existingMenus {
			historyRecords = append(historyRecords, models.HistRoleMenu{
				RoleID:      em.RoleID,
				MenuID:      em.MenuID,
				CreatedAt:   em.CreatedAt,
				CreatedUser: em.CreatedUser,
				DeletedAt:   time.Now(),
				DeletedUser: usernameStr,
			})
		}
		if err := tx.Create(&historyRecords).Error; err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to create history records", err.Error())
			return
		}
	}

	if err := tx.Where("role_id = ?", id).Delete(&models.RoleMenu{}).Error; err != nil {
		tx.Rollback()
		views.InternalError(c, "Failed to clear existing menus", err.Error())
		return
	}

	roleID := parseID(id)
	for _, menuID := range input.MenuIDs {
		if err := tx.Create(&models.RoleMenu{
			RoleID:      roleID,
			MenuID:      menuID,
			CreatedUser: usernameStr,
		}).Error; err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to assign menu", err.Error())
			return
		}
	}

	tx.Commit()
	models.RefreshRoleMenuCache(database.DB)
	views.Success(c, nil, "Menus assigned successfully")
}

func GetHistRoleMenus(c *gin.Context) {
	type HistRoleMenuResponse struct {
		models.HistRoleMenu
		RoleName  string `json:"role_name"`
		MenuTitle string `json:"menu_title"`
	}

	var items []HistRoleMenuResponse
	roleID := c.Query("role_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Table("hist_role_menus hrm").
		Select("hrm.*, r.name as role_name, m.title as menu_title").
		Joins("LEFT JOIN roles r ON hrm.role_id = r.id").
		Joins("LEFT JOIN menus m ON hrm.menu_id = m.id").
		Order("hrm.id desc")

	if roleID != "" {
		query = query.Where("hrm.role_id = ?", roleID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

func parseID(s string) uint {
	var id uint
	fmt.Sscanf(s, "%d", &id)
	return id
}
