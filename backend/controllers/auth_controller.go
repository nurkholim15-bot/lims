package controllers

import (
	"fmt"
	"lim-system/models"
	"lim-system/utils"
	"lim-system/views"
	"lim-system/database"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var BootTime time.Time

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username       string `json:"username" binding:"required"`
	Password       string `json:"password" binding:"required"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	RoleID         uint   `json:"role_id" binding:"required"`
	TelegramChatID string `json:"telegram_chat_id"`
	WhatsAppPhone  string `json:"whatsapp_phone"`
	TeamsUserID    string `json:"teams_user_id"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		views.BadRequest(c, "Invalid request format", err.Error())
		return
	}

	var user models.User
	if err := user.GetByUsername(database.DB, req.Username); err != nil {
		views.Unauthorized(c, "Invalid username or password")
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		views.Unauthorized(c, "Invalid username or password")
		return
	}

	// Check password rotation or forced change
	rotationDaysStr := models.GetGlobalParam("PWD_ROTATION_DAYS", "90")
	rotationDays, _ := strconv.Atoi(rotationDaysStr)
	if user.ForcePwdChange || time.Since(user.LastPwdChange).Hours() > float64(rotationDays*24) {
		c.JSON(http.StatusForbidden, gin.H{
			"status": http.StatusForbidden,
			"message": "Password expired or change required. Please change your password.",
			"code":    "PWD_EXPIRED",
		})
		return
	}

	// Generate JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		views.InternalError(c, "JWT_SECRET is not configured", "")
		return
	}
	
	expiryMinStr := models.GetGlobalParam("SESSION_EXPIRY_MINUTES", "120")
	expiryMin, _ := strconv.Atoi(expiryMinStr)
	
	expiresAt := time.Now().Add(time.Duration(expiryMin) * time.Minute)
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role.Name,
		"role_id":  user.RoleID,
		"exp":      expiresAt.Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		views.InternalError(c, "Failed to generate token", err.Error())
		return
	}

	// Save session using Model method
	session := models.UserSession{
		UserID:         user.ID,
		Token:          tokenString,
		ExpiresAt:      expiresAt,
		IPAddress:      strings.TrimPrefix(c.ClientIP(), "::ffff:"),
		ClientVersion:  c.GetHeader("X-App-Version"),
		ClientPlatform: c.GetHeader("X-App-Platform"),
	}
	if err := session.Create(database.DB); err != nil {
		views.InternalError(c, "Failed to save session", err.Error())
		return
	}

	// Set context agar Rate Limiter bisa mendeteksi siapa yang login untuk activity_logs
	c.Set("user_id", user.ID)
	c.Set("username", user.Username)

	// Set Secure HttpOnly Cookie
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", tokenString, expiryMin*60, "/", "", false, true)

	// Check if password will expire soon
	warningDaysStr := models.GetGlobalParam("PWD_EXPIRED_DAYS", "7")
	warningDays, _ := strconv.Atoi(warningDaysStr)
	if warningDays <= 0 {
		warningDays = 7
	}

	expirationTime := user.LastPwdChange.AddDate(0, 0, rotationDays)
	timeRemaining := time.Until(expirationTime)

	var pwdWarning gin.H
	if timeRemaining > 0 && timeRemaining <= time.Duration(warningDays)*24*time.Hour {
		pwdWarning = gin.H{
			"expiring_soon": true,
			"expiry_date":   expirationTime.Format("02-01-2006"),
			"expiry_time":   expirationTime.Format("15:04:05"),
		}
	} else {
		pwdWarning = gin.H{
			"expiring_soon": false,
		}
	}

	views.Success(c, gin.H{
		"token": tokenString, // Still return for legacy support if needed, but cookie is primary
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"role":     user.Role.Name,
			"role_id":  user.RoleID,
		},
		"pwd_warning": pwdWarning,
	}, "Login successful")
}

func GetSidebarMenus(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		views.Unauthorized(c, "User not authenticated")
		return
	}
	
	userID := uint(0)
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	var user models.User
	if err := user.GetByID(database.DB, userID); err != nil {
		views.Unauthorized(c, "User not found")
		return
	}

	var menuModel models.Menu
	menus, err := menuModel.GetByRoleID(database.DB, user.RoleID)
	if err != nil {
		views.InternalError(c, "Failed to fetch menus", err.Error())
		return
	}

	views.Success(c, menus, "Menus retrieved successfully")
}

func GetConfig(c *gin.Context) {
	var g models.GlobalParameter
	params, err := g.GetAll(database.DB)
	if err != nil {
		views.InternalError(c, "Failed to fetch config", err.Error())
		return
	}
	
	config := make(map[string]string)
	for _, p := range params {
		config[p.ParamKey] = p.ParamValue
	}
	
	// Environment Variable Overlays
	envKeys := []string{"COMPANY_NAME", "HEADER_TITLE", "APP_NAME", "APP_FOOTER", "APP_ADMIN_NAME", "MAX_UPLOAD_SIZE", "PAGINATION_LIMIT"}
	for _, key := range envKeys {
		if val := os.Getenv(key); val != "" {
			config[key] = val
		}
	}
	
	config["SYSTEM_BOOT_TIME"] = BootTime.Format(time.RFC3339)
	
	views.Success(c, config, "Config retrieved successfully")
}

func Logout(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		views.BadRequest(c, "Authorization header is required", "")
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		views.BadRequest(c, "Invalid authorization format", "")
		return
	}

	tokenString := parts[1]
	
	var session models.UserSession
	if err := session.Delete(database.DB, tokenString, userID); err != nil {
		views.InternalError(c, "Failed to logout", err.Error())
		return
	}

	// Pastikan user_id tetap ada di context untuk RateLimiter activity log
	c.Set("user_id", userID)

	// Clear Cookie
	c.SetCookie("auth_token", "", -1, "/", "", false, true)

	views.Success(c, nil, "Successfully logged out")
}

func VerifyPassword(c *gin.Context) {
	userIDVal, ok := c.Get("user_id")
	if !ok {
		views.Unauthorized(c, "User not authenticated")
		return
	}
	
	userID := uint(0)
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	var req struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		views.BadRequest(c, "Password is required", err.Error())
		return
	}

	var user models.User
	if err := user.GetByID(database.DB, userID); err != nil {
		views.Unauthorized(c, "User not found")
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		views.Forbidden(c, "Invalid password")
		return
	}

	views.Success(c, gin.H{"verified": true}, "Password verified")
}

type ChangeExpiredPasswordRequest struct {
	Username    string `json:"username" binding:"required"`
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

func ChangeExpiredPassword(c *gin.Context) {
	var req ChangeExpiredPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		views.BadRequest(c, "Invalid request format", err.Error())
		return
	}

	var user models.User
	if err := user.GetByUsername(database.DB, req.Username); err != nil {
		views.Unauthorized(c, "Invalid username or password")
		return
	}

	if !utils.CheckPasswordHash(req.OldPassword, user.Password) {
		views.Unauthorized(c, "Invalid username or password")
		return
	}

	// Validate new password strength
	minLenStr := database.GetGlobalParam("PWD_MIN_LENGTH", "9")
	minLen, _ := strconv.Atoi(minLenStr)
	if !utils.ValidatePassword(req.NewPassword, minLen) {
		views.BadRequest(c, fmt.Sprintf("Password must be at least %d characters and contain uppercase, lowercase, numbers, and special characters", minLen), "")
		return
	}

	// Check if new password is same as old password
	if req.OldPassword == req.NewPassword {
		views.BadRequest(c, "New password cannot be the same as old password", "")
		return
	}

	// Update user's password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		views.InternalError(c, "Failed to hash password", err.Error())
		return
	}

	// Save history before update
	usernameStr := user.Username
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
		UpdatedUser:    usernameStr,
		ForcePwdChange: user.ForcePwdChange,
	}
	if err := database.DB.Create(&hist).Error; err != nil {
		views.InternalError(c, "Failed to archive user history", err.Error())
		return
	}

	user.Password = hashedPassword
	user.LastPwdChange = time.Now()
	user.UpdatedUser = usernameStr
	user.ForcePwdChange = false

	if err := database.DB.Save(&user).Error; err != nil {
		views.InternalError(c, "Failed to update password", err.Error())
		return
	}

	views.Success(c, nil, "Password changed successfully. Please log in with your new password.")
}

func CheckPasswordExpiry(c *gin.Context) {
	username := strings.TrimSpace(c.Query("username"))
	if username == "" {
		c.JSON(http.StatusOK, gin.H{"expiring_soon": false})
		return
	}

	var user models.User
	if err := user.GetByUsername(database.DB, username); err != nil {
		c.JSON(http.StatusOK, gin.H{"expiring_soon": false})
		return
	}

	rotationDaysStr := models.GetGlobalParam("PWD_ROTATION_DAYS", "90")
	rotationDays, _ := strconv.Atoi(rotationDaysStr)

	warningDaysStr := models.GetGlobalParam("PWD_EXPIRED_DAYS", "7")
	warningDays, _ := strconv.Atoi(warningDaysStr)
	if warningDays <= 0 {
		warningDays = 7
	}

	expirationTime := user.LastPwdChange.AddDate(0, 0, rotationDays)
	timeRemaining := time.Until(expirationTime)

	if timeRemaining > 0 && timeRemaining <= time.Duration(warningDays)*24*time.Hour {
		expiryDateStr := expirationTime.Format("02-01-2006")
		expiryTimeStr := expirationTime.Format("15:04:05")
		c.JSON(http.StatusOK, gin.H{
			"expiring_soon": true,
			"expiry_date":   expiryDateStr,
			"expiry_time":   expiryTimeStr,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"expiring_soon": false})
}

func CheckAppVersion(c *gin.Context) {
	clientVersion := strings.TrimSpace(c.Query("version"))
	clientPlatform := strings.TrimSpace(c.Query("platform"))

	minVersion := models.GetGlobalParam("MIN_ANDROID_VERSION", "1.1")
	downloadURL := models.GetGlobalParam("ANDROID_DOWNLOAD_URL", "https://lims.perusahaan.com/downloads/lims-v1.1.apk")

	if clientVersion == "" {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
		return
	}

	// We only enforce update for Android platform by default, or if platform is empty
	if clientPlatform == "" || strings.ToLower(clientPlatform) == "android" {
		if isVersionOutdated(clientVersion, minVersion) {
			c.JSON(http.StatusOK, gin.H{
				"status":          "FORCE_UPGRADE",
				"minimum_version": minVersion,
				"download_url":    downloadURL,
				"message":         fmt.Sprintf("Versi aplikasi Anda (%s) sudah tidak didukung. Harap perbarui ke versi %s atau yang lebih baru untuk melanjutkan.", clientVersion, minVersion),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "OK"})
}

func isVersionOutdated(clientVer, minVer string) bool {
	clientParts := strings.Split(clientVer, ".")
	minParts := strings.Split(minVer, ".")

	for i := 0; i < len(minParts); i++ {
		if i >= len(clientParts) {
			// clientVer has fewer parts, e.g. "1" vs "1.1" -> client is outdated
			return true
		}
		cVal, _ := strconv.Atoi(clientParts[i])
		mVal, _ := strconv.Atoi(minParts[i])
		if cVal < mVal {
			return true
		} else if cVal > mVal {
			return false
		}
	}
	return false
}


