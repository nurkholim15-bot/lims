package controllers

import (
	"fmt"
	"lim-system/models"
	"lim-system/utils"
	"lim-system/views"
	"lim-system/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"strings"
)

func LoadUserSocialAccounts(user *models.User) {
	type SocialRow struct {
		ChannelType string
		AccountID   string
	}
	var rows []SocialRow
	err := database.ChatBotDB.Raw(`
		SELECT channel_type, account_id 
		FROM chat_sch.user_social_accounts 
		WHERE user_id = ?
	`, user.ID).Scan(&rows).Error
	if err == nil {
		for _, row := range rows {
			switch row.ChannelType {
			case "telegram":
				user.TelegramChatID = row.AccountID
			case "whatsapp":
				user.WhatsAppPhone = row.AccountID
			case "teams":
				user.TeamsUserID = row.AccountID
			}
		}
	}
}

func SaveUserSocialAccounts(userID uint, telegramChatID, whatsappPhone, teamsUserID string) {
	upsertAccount := func(channelType, accountID string) {
		accountID = strings.TrimSpace(accountID)
		if accountID == "" {
			database.ChatBotDB.Exec(`
				DELETE FROM chat_sch.user_social_accounts 
				WHERE user_id = ? AND channel_type = ?
			`, userID, channelType)
			return
		}
		
		var count int64
		database.ChatBotDB.Raw(`
			SELECT COUNT(*) FROM chat_sch.user_social_accounts 
			WHERE user_id = ? AND channel_type = ?
		`, userID, channelType).Scan(&count)
		
		if count > 0 {
			database.ChatBotDB.Exec(`
				UPDATE chat_sch.user_social_accounts 
				SET account_id = ? 
				WHERE user_id = ? AND channel_type = ?
			`, accountID, userID, channelType)
		} else {
			database.ChatBotDB.Exec(`
				INSERT INTO chat_sch.user_social_accounts (user_id, channel_type, account_id) 
				VALUES (?, ?, ?)
			`, userID, channelType, accountID)
		}
	}
	
	upsertAccount("telegram", telegramChatID)
	upsertAccount("whatsapp", whatsappPhone)
	upsertAccount("teams", teamsUserID)
}

func GetUsers(c *gin.Context) {
	var users []models.User
	var total int64
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit
	search := c.Query("search")

	query := database.DB.Model(&models.User{}).Preload("Role")
	if search != "" {
		if idVal, err := strconv.Atoi(search); err == nil {
			query = query.Where("id = ? OR username ILIKE ?", idVal, "%"+search+"%")
		} else {
			query = query.Where("username ILIKE ?", "%"+search+"%")
		}
	}

	query.Count(&total)
	query.Limit(limit).Offset(offset).Find(&users)
	for i := range users {
		LoadUserSocialAccounts(&users[i])
	}
	
	views.SuccessWithMeta(c, users, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Users retrieved")
}

func GetUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := database.DB.Preload("Role").First(&user, id).Error; err != nil {
		views.Error(c, http.StatusNotFound, "User not found", err.Error())
		return
	}
	LoadUserSocialAccounts(&user)
	views.Success(c, user, "User retrieved")
}

type RegisterRequest struct {
	Username           string `json:"username" binding:"required"`
	Password           string `json:"password" binding:"required"`
	Email              string `json:"email"`
	Phone              string `json:"phone"`
	RoleID             uint   `json:"role_id" binding:"required"`
	TelegramChatID     string `json:"telegram_chat_id"`
	WhatsAppPhone      string `json:"whatsapp_phone"`
	TeamsUserID        string `json:"teams_user_id"`
	IsActive           *bool  `json:"is_active"`
}

func CreateUser(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		views.BadRequest(c, "Invalid input", err.Error())
		return
	}

	// Validate Password
	minLenStr := database.GetGlobalParam("PWD_MIN_LENGTH", "9")
	minLen, _ := strconv.Atoi(minLenStr)
	if !utils.ValidatePassword(req.Password, minLen) {
		views.BadRequest(c, fmt.Sprintf("Password must be at least %d characters and contain uppercase, lowercase, numbers, and special characters", minLen), "")
		return
	}

	hashedPassword, _ := utils.HashPassword(req.Password)

	username, _ := c.Get("username")
	usernameStr := "SYSTEM"
	if username != nil {
		usernameStr = username.(string)
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	user := models.User{
		Username:           req.Username,
		Password:           hashedPassword,
		Email:              req.Email,
		Phone:              req.Phone,
		RoleID:             req.RoleID,
		LastPwdChange:      time.Now(),
		CreatedUser:        usernameStr,
		UpdatedUser:        usernameStr,
		ForcePwdChange:     true,
		IsActive:           isActive,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		views.InternalError(c, "Failed to create user", err.Error())
		return
	}

	SaveUserSocialAccounts(user.ID, req.TelegramChatID, req.WhatsAppPhone, req.TeamsUserID)
	LoadUserSocialAccounts(&user)

	views.Created(c, user, "User created successfully")
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		views.Error(c, http.StatusNotFound, "User not found", err.Error())
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Invalid input", err.Error())
		return
	}

	telegramChatID, _ := input["telegram_chat_id"].(string)
	whatsappPhone, _ := input["whatsapp_phone"].(string)
	teamsUserID, _ := input["teams_user_id"].(string)

	delete(input, "telegram_chat_id")
	delete(input, "whatsapp_phone")
	delete(input, "teams_user_id")

	// Handle password update separately if provided
	if pwd, ok := input["password"].(string); ok && pwd != "" {
		minLenStr := database.GetGlobalParam("PWD_MIN_LENGTH", "9")
		minLen, _ := strconv.Atoi(minLenStr)
		if !utils.ValidatePassword(pwd, minLen) {
			views.BadRequest(c, "Invalid password format", "")
			return
		}
		hashed, _ := utils.HashPassword(pwd)
		input["password"] = hashed
		input["last_pwd_change"] = time.Now()
		input["force_pwd_change"] = true
	} else {
		delete(input, "password")
	}

	username, _ := c.Get("username")
	input["updated_user"] = username.(string)

	hist := models.HistUser{
		UserID:             user.ID,
		Username:           user.Username,
		Password:           user.Password,
		Email:              user.Email,
		Phone:              user.Phone,
		RoleID:             user.RoleID,
		LastPwdChange:      user.LastPwdChange,
		CreatedAt:          user.CreatedAt,
		UpdatedAt:          user.UpdatedAt,
		CreatedUser:        user.CreatedUser,
		UpdatedUser:        username.(string),
		ForcePwdChange:     user.ForcePwdChange,
		IsActive:           user.IsActive,
	}
	database.DB.Create(&hist)

	database.DB.Model(&user).Updates(input)
	SaveUserSocialAccounts(user.ID, telegramChatID, whatsappPhone, teamsUserID)
	LoadUserSocialAccounts(&user)
	views.Success(c, user, "User updated successfully")
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		views.Error(c, http.StatusNotFound, "User not found", err.Error())
		return
	}

	username, _ := c.Get("username")
	usernameStr := ""
	if username != nil {
		usernameStr = username.(string)
	}

	hist := models.HistUser{
		UserID:         user.ID,
		Username:       user.Username,
		Password:       user.Password,
		Email:          user.Email,
		Phone:          user.Phone,
		RoleID:         user.RoleID,
		LastPwdChange:  user.LastPwdChange,
		CreatedAt:      user.CreatedAt,
		UpdatedAt:      user.UpdatedAt,
		CreatedUser:    user.CreatedUser,
		UpdatedUser:    user.UpdatedUser,
		DeletedUser:    usernameStr,
		ForcePwdChange: user.ForcePwdChange,
	}
	database.DB.Create(&hist)

	user.DeletedUser = usernameStr
	database.DB.Save(&user)

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		views.InternalError(c, "Failed to delete user", err.Error())
		return
	}
	views.Success(c, nil, "User deleted successfully")
}

func GetHistUsers(c *gin.Context) {
	var items []models.HistUser
	userID := c.Query("user_id")
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitParam := models.GetGlobalParam("HISTORY_PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", limitParam))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.HistUser{}).Order("id desc")
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	
	var total int64
	query.Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		views.Error(c, http.StatusInternalServerError, "Gagal memproses data", err.Error())
		return
	}
	views.SuccessWithPaging(c, items, "Retrieved", total, page, limit)
}

// --- User Sessions ---
func GetUserSessions(c *gin.Context) {
	var sessions []models.UserSession
	var total int64
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	defaultLimit := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimit))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.UserSession{})
	query.Count(&total)
	query.Order("created_at desc").Limit(limit).Offset(offset).Find(&sessions)
	
	// Clean IP addresses before sending to UI
	for i := range sessions {
		sessions[i].IPAddress = strings.TrimPrefix(sessions[i].IPAddress, "::ffff:")
	}
	
	views.SuccessWithMeta(c, sessions, gin.H{
		"total": total,
		"page":  page,
		"limit": limit,
	}, "Sessions retrieved")
}

func CreateUserSession(c *gin.Context) {
	views.BadRequest(c, "Session cannot be created manually", "")
}

func UpdateUserSession(c *gin.Context) {
	views.BadRequest(c, "Session cannot be updated manually", "")
}

func DeleteUserSession(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.UserSession{}, id).Error; err != nil {
		views.InternalError(c, "Failed to delete session", err.Error())
		return
	}
	views.Success(c, nil, "Session deleted")
}

func CleanupExpiredSessions(c *gin.Context) {
	// Get cleanup hours from global parameters (default 1 hour)
	var param models.GlobalParameter
	cleanupHours := 1 // default
	
	if err := database.DB.Where("param_key = ?", "SESSION_CLEANUP_HOURS").First(&param).Error; err == nil {
		if hours, err := strconv.Atoi(param.ParamValue); err == nil {
			cleanupHours = hours
		}
	}
	
	// Calculate the cutoff time (now - X hours)
	cutoffTime := time.Now().Add(-time.Duration(cleanupHours) * time.Hour)
	
	// Delete sessions that expired before cutoff time
	result := database.DB.Where("expires_at < ?", cutoffTime).Delete(&models.UserSession{})
	
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Session cleanup completed",
		"deleted_count": result.RowsAffected,
		"cleanup_hours": cleanupHours,
	})
}
