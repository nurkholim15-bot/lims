package middleware

import (
	"fmt"
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		tokenString := ""

		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}

		// Fallback to Cookie if header is missing
		if tokenString == "" {
			if cookie, err := c.Cookie("auth_token"); err == nil {
				tokenString = cookie
			}
		}

		// Fallback to Query Parameter if header and cookie are missing
		if tokenString == "" {
			tokenString = c.Query("token")
		}

		if tokenString == "" {
			views.Unauthorized(c, "Authorization header is required")
			c.Abort()
			return
		}

		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT_SECRET is not configured"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			views.Unauthorized(c, "Invalid or expired token")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		userIDVal, okUser := claims["user_id"].(float64)
		username, _ := claims["username"].(string)
		roleName, okRole := claims["role"].(string)
		roleIDVal, okID := claims["role_id"].(float64)

		if !okUser || !okRole || !okID {
			// Fallback: If claims are missing (old token), force user to re-login
			views.Unauthorized(c, "Struktur token lama atau tidak valid. Silakan login kembali.")
			c.Abort()
			return
		}

		userID := uint(userIDVal)
		roleID := uint(roleIDVal)

		// Verification Session (Optional: could be cached for better performance)
		var session models.UserSession
		result := database.DB.Where("token = ? AND user_id = ?", tokenString, userID).First(&session)
		if result.Error != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Session not found or revoked"})
			c.Abort()
			return
		}

		// Set user context
		c.Set("user_id", userID)
		c.Set("role_id", roleID)
		c.Set("role", roleName)
		c.Set("username", username)
		
		c.Next()
	}
}

func VersionCheckMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.Contains(path, "/check-version") || strings.Contains(path, "/login") || strings.Contains(path, "/change-expired-password") {
			c.Next()
			return
		}

		clientVersion := strings.TrimSpace(c.GetHeader("X-App-Version"))
		clientPlatform := strings.TrimSpace(c.GetHeader("X-App-Platform"))

		minVersion := models.GetGlobalParam("MIN_ANDROID_VERSION", "1.1")

		if clientVersion != "" && (clientPlatform == "" || strings.ToLower(clientPlatform) == "android") {
			if isVersionOutdated(clientVersion, minVersion) {
				c.JSON(http.StatusUpgradeRequired, gin.H{
					"error": "UPGRADE_REQUIRED",
					"message": fmt.Sprintf("Versi aplikasi LIMS Android Anda (%s) sudah tidak didukung. Harap perbarui ke versi %s atau yang lebih baru.", clientVersion, minVersion),
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

func isVersionOutdated(clientVer, minVer string) bool {
	clientParts := strings.Split(clientVer, ".")
	minParts := strings.Split(minVer, ".")

	for i := 0; i < len(minParts); i++ {
		if i >= len(clientParts) {
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
