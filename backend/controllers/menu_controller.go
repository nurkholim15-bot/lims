package controllers

import (
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetMenus(c *gin.Context) {
	var menus []models.Menu
	
	nopaging := c.Query("nopaging")
	if nopaging == "1" {
		if err := database.DB.Order("\"order\" asc").Find(&menus).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch menus"})
			return
		}
		views.Success(c, menus, "Retrieved all menus")
		return
	}

	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	search := c.Query("search")
	query := database.DB.Model(&models.Menu{})
	
	if search != "" {
		if id, err := strconv.Atoi(search); err == nil {
			query = query.Where("id = ? OR title ILIKE ?", id, "%"+search+"%")
		} else {
			query = query.Where("title ILIKE ?", "%"+search+"%")
		}
	}

	var total int64
	query.Count(&total)

	err := query.Order("\"order\" asc").Limit(limit).Offset(offset).Find(&menus).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch menus"})
		return
	}

	views.SuccessWithPaging(c, menus, "Retrieved", total, page, limit)
}

func CreateMenu(c *gin.Context) {
	var menu models.Menu
	if err := c.ShouldBindJSON(&menu); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	menu.CreatedUser = username.(string)
	menu.UpdatedUser = username.(string)

	if err := database.DB.Create(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create menu"})
		return
	}
	models.RefreshRoleMenuCache(database.DB)

	c.JSON(http.StatusCreated, menu)
}

func UpdateMenu(c *gin.Context) {
	id := c.Param("id")
	var menu models.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu not found"})
		return
	}

	var input models.Menu
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	input.UpdatedUser = username.(string)

	// Use Updates with map to properly handle boolean fields
	updateMap := map[string]interface{}{
		"parent_id":    input.ParentID,
		"title":        input.Title,
		"icon":         input.Icon,
		"path":         input.Path,
		"order":        input.Order,
		"is_password":  input.IsPassword, // Explicitly include boolean field
		"updated_user": input.UpdatedUser,
	}
	
	// Execute the update and check for errors
	hist := models.HistMenu{
		MenuID:      menu.ID,
		ParentID:    menu.ParentID,
		Title:       menu.Title,
		Icon:        menu.Icon,
		Path:        menu.Path,
		Order:       menu.Order,
		IsPassword:  menu.IsPassword,
		CreatedAt:   menu.CreatedAt,
		UpdatedAt:   menu.UpdatedAt,
		CreatedUser: menu.CreatedUser,
		UpdatedUser: username.(string),
	}
	database.DB.Create(&hist)

	result := database.DB.Model(&menu).Updates(updateMap)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update menu: " + result.Error.Error()})
		return
	}

	// Fetch updated menu to return current state
	database.DB.First(&menu, id)
	models.RefreshRoleMenuCache(database.DB)
	c.JSON(http.StatusOK, menu)
}

func DeleteMenu(c *gin.Context) {
	id := c.Param("id")
	var menu models.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu not found"})
		return
	}

	username, _ := c.Get("username")
	usernameStr := ""
	if username != nil {
		usernameStr = username.(string)
	}

	hist := models.HistMenu{
		MenuID:      menu.ID,
		ParentID:    menu.ParentID,
		Title:       menu.Title,
		Icon:        menu.Icon,
		Path:        menu.Path,
		Order:       menu.Order,
		IsPassword:  menu.IsPassword,
		CreatedAt:   menu.CreatedAt,
		UpdatedAt:   menu.UpdatedAt,
		CreatedUser: menu.CreatedUser,
		UpdatedUser: menu.UpdatedUser,
		DeletedUser: usernameStr,
	}
	database.DB.Create(&hist)

	menu.DeletedUser = usernameStr
	database.DB.Save(&menu)

	if err := database.DB.Where("id = ?", id).Delete(&models.Menu{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete menu"})
		return
	}
	models.RefreshRoleMenuCache(database.DB)
	c.JSON(http.StatusOK, gin.H{"message": "Menu deleted successfully"})
}

func GetHistMenus(c *gin.Context) {
	var items []models.HistMenu
	menuID := c.Query("menu_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistMenu{}).Order("id desc")
	if menuID != "" {
		query = query.Where("menu_id = ?", menuID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}
