package controllers

import (
	"fmt"
	"lim-system/database"
	"lim-system/models"
	"lim-system/views"
	"time"

	"github.com/gin-gonic/gin"
)

type SendChatReq struct {
	ReceiverName string `json:"receiver_name"`
	Message      string `json:"message" binding:"required"`
}


// SendAgentChatMessage stores a new chat message in the database.
func SendAgentChatMessage(c *gin.Context) {
	var req SendChatReq
	if err := c.ShouldBindJSON(&req); err != nil {
		views.BadRequest(c, "Invalid chat request format", err.Error())
		return
	}

	userIDVal, _ := c.Get("user_id")
	usernameVal, _ := c.Get("username")
	roleVal, _ := c.Get("role")

	senderID := uint(0)
	switch v := userIDVal.(type) {
	case uint:
		senderID = v
	case float64:
		senderID = uint(v)
	}

	senderName := usernameVal.(string)
	senderRole := roleVal.(string)

	receiverName := req.ReceiverName
	receiverID := uint(0)

	// If operator is sending, receiverName defaults to HELPDESK role
	if senderRole != "ADMIN" && senderRole != "HELPDESK" {
		receiverName = "HELPDESK"
	} else {
		// Helpdesk is sending to a specific operator. Let's find their userID
		if receiverName != "" {
			var recUser models.User
			if err := database.DB.Where("username = ?", receiverName).First(&recUser).Error; err == nil {
				receiverID = recUser.ID
			}
		}
	}

	msg := models.AgentChat{
		SenderID:     senderID,
		SenderName:   senderName,
		ReceiverID:   receiverID,
		ReceiverName: receiverName,
		Message:      req.Message,
		CreatedAt:    time.Now(),
		CreatedUser:  senderName,
	}

	if err := database.ChatBotDB.Create(&msg).Error; err != nil {
		views.InternalError(c, "Failed to save chat message", err.Error())
		return
	}

	// Forward to Telegram asynchronously
	go func(sRole, sName string, rID uint, rName string, text string) {
		if sRole != "ADMIN" && sRole != "HELPDESK" {
			// Operator sending to HELPDESK -> Send to all registered Helpdesk/Admin agents
			var helpdeskUsers []models.User
			err := database.DB.Preload("Role").
				Joins("JOIN roles ON users.role_id = roles.id").
				Where("roles.name IN ('ADMIN', 'HELPDESK')").
				Find(&helpdeskUsers).Error
			if err == nil && len(helpdeskUsers) > 0 {
				var userIDs []uint
				for _, u := range helpdeskUsers {
					userIDs = append(userIDs, u.ID)
				}
				
				type SocialRow struct {
					AccountID string `gorm:"column:account_id"`
				}
				var rows []SocialRow
				err = database.ChatBotDB.Table("chat_sch.user_social_accounts").
					Where("user_id IN ? AND channel_type = 'telegram'", userIDs).
					Find(&rows).Error
				if err == nil {
					for _, row := range rows {
						if row.AccountID != "" {
							SendTelegramMessage(row.AccountID, fmt.Sprintf("📢 *Pesan Operator*\nPengirim: %s\nPesan: %s", sName, text))
						}
					}
				}
			}
		} else {
			// Helpdesk/Admin sending to a specific Operator -> Send to that Operator's Telegram
			if rID != 0 {
				var accountID string
				err := database.ChatBotDB.Table("chat_sch.user_social_accounts").
					Select("account_id").
					Where("user_id = ? AND channel_type = 'telegram'", rID).
					Row().Scan(&accountID)
				if err == nil && accountID != "" {
					SendTelegramMessage(accountID, fmt.Sprintf("💬 *Pesan dari Helpdesk*\nPengirim: %s\nPesan: %s", sName, text))
				}
			}
		}
	}(senderRole, senderName, receiverID, receiverName, req.Message)

	views.Success(c, msg, "Message sent successfully")
}

// GetAgentChatHistory retrieves the message logs between the logged-in user and another user.
func GetAgentChatHistory(c *gin.Context) {
	otherUser := c.Query("username") // e.g. the operator name

	usernameVal, _ := c.Get("username")
	roleVal, _ := c.Get("role")

	username := usernameVal.(string)
	role := roleVal.(string)

	var messages []models.AgentChat

	if role == "ADMIN" || role == "HELPDESK" {
		// Helpdesk wants chat history with a specific operator
		if otherUser == "" {
			views.BadRequest(c, "Username query parameter is required for helpdesk", "")
			return
		}
		// Fetch messages where:
		// (sender is helpdesk AND receiver is operator) OR (sender is operator AND receiver is helpdesk/role)
		err := database.ChatBotDB.Where(
			"(sender_name = ? AND receiver_name = ?) OR (sender_name = ? AND (receiver_name = ? OR receiver_name = 'HELPDESK'))",
			username, otherUser, otherUser, username,
		).Order("created_at asc").Find(&messages).Error

		if err != nil {
			views.InternalError(c, "Failed to fetch chat logs", err.Error())
			return
		}
	} else {
		// Operator wants their own chat history with helpdesk
		// Fetch messages where:
		// (sender is operator AND receiver is helpdesk/role) OR (receiver is operator AND sender is helpdesk)
		err := database.ChatBotDB.Where(
			"(sender_name = ? AND (receiver_name = 'HELPDESK' OR receiver_name = 'ADMIN')) OR (receiver_name = ?)",
			username, username,
		).Order("created_at asc").Find(&messages).Error

		if err != nil {
			views.InternalError(c, "Failed to fetch chat logs", err.Error())
			return
		}
	}

	views.Success(c, messages, "Chat history retrieved successfully")
}

// GetActiveChatSessions returns a list of operators who have sent messages, for the helpdesk dashboard.
func GetActiveChatSessions(c *gin.Context) {
	roleVal, _ := c.Get("role")
	role := roleVal.(string)

	if role != "ADMIN" && role != "HELPDESK" {
		views.Forbidden(c, "Only helpdesk can view active chat sessions")
		return
	}

	type ChatSession struct {
		SenderName string    `json:"sender_name"`
		Message    string    `json:"message"`
		CreatedAt  time.Time `json:"created_at"`
	}

	var rawSessions []ChatSession
	// Query unique operators who sent messages to helpdesk/admin
	err := database.ChatBotDB.Raw(`
		SELECT DISTINCT ON (sender_name) sender_name, message, created_at
		FROM chat_sch.agent_chats
		WHERE receiver_name = 'HELPDESK' OR receiver_name = 'ADMIN'
		ORDER BY sender_name, created_at DESC
	`).Scan(&rawSessions).Error

	if err != nil {
		views.InternalError(c, "Failed to retrieve chat sessions", err.Error())
		return
	}

	views.Success(c, rawSessions, "Active chat sessions retrieved successfully")
}

