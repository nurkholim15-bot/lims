package middleware

import (
	"lim-system/models"
	"lim-system/database"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func RoleCheck(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found in context"})
			c.Abort()
			return
		}

		roleName := userRole.(string)

		// 1. Superuser Check: ADMIN always has access
		if roleName == "ADMIN" {
			c.Next()
			return
		}

		// 2. Common Endpoints Exemption
		// Allow common GET endpoints that are used by various menus/pages
		path := c.Request.URL.Path
		if c.Request.Method == "GET" && (path == "/api/applications" || path == "/api/config" || path == "/api/menus" || path == "/api/notifications") {
			c.Next()
			return
		}

		// 3. Explicit List Check (if any specific roles were passed to the middleware)
		for _, r := range roles {
			if r == roleName {
				c.Next()
				return
			}
		}

		// 3. Dynamic Cache Check: Check if role has access to the menu corresponding to this API
		// Map API path to Menu path
		path = c.Request.URL.Path
		menuPath := strings.Replace(path, "/api/management", "", 1)
		menuPath = strings.Replace(menuPath, "/api", "", 1)

		// Get User Role ID from context (set by AuthMiddleware)
		roleIDVal, exists := c.Get("role_id")
		if !exists {
			// Fallback: if role_id not in context, we might need one DB hit or fail
			c.JSON(http.StatusForbidden, gin.H{"error": "Role ID not found in context"})
			c.Abort()
			return
		}
		
		roleID := uint(0)
		switch v := roleIDVal.(type) {
		case uint:
			roleID = v
		case float64:
			roleID = uint(v)
		}

		// Use cached menus from models
		menuModel := &models.Menu{}
		menus, err := menuModel.GetByRoleID(database.DB, roleID)
		if err == nil {
			for _, m := range menus {
				// Check if menu path matches or is a parent of current path
				if m.Path != "" && (m.Path == menuPath || strings.HasPrefix(menuPath, m.Path+"/")) {
					c.Next()
					return
				}
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin untuk mengakses data/fitur ini"})
		c.Abort()
	}
}
