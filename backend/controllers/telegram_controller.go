package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"lim-system/database"
	"lim-system/models"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type TelegramUpdate struct {
	UpdateID int64            `json:"update_id"`
	Message  *TelegramMessage `json:"message"`
}

type TelegramMessage struct {
	MessageID      int64            `json:"message_id"`
	From           *TelegramUser    `json:"from"`
	Chat           *TelegramChat    `json:"chat"`
	Date           int64            `json:"date"`
	Text           string           `json:"text"`
	ReplyToMessage *TelegramMessage `json:"reply_to_message"`
}

type TelegramUser struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	Username  string `json:"username"`
}

type TelegramChat struct {
	ID   int64  `json:"id"`
	Type string `json:"type"`
}

// TelegramWebhookHandler processes incoming messages from Telegram Bot
func TelegramWebhookHandler(c *gin.Context) {
	var update TelegramUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		// Respond with 200 OK anyway so Telegram doesn't keep retrying bad payloads
		c.JSON(http.StatusOK, gin.H{"status": "ignored", "error": err.Error()})
		return
	}

	if update.Message == nil || update.Message.Chat == nil {
		c.JSON(http.StatusOK, gin.H{"status": "ignored", "message": "no message or chat"})
		return
	}

	chatIDStr := strconv.FormatInt(update.Message.Chat.ID, 10)
	msgText := update.Message.Text

	// Check if this chat ID is mapped to any LIMS user
	var userID uint
	err := database.ChatBotDB.Raw(`
		SELECT user_id FROM chat_sch.user_social_accounts 
		WHERE channel_type = 'telegram' AND account_id = ?
		LIMIT 1
	`, chatIDStr).Scan(&userID).Error

	// If the user is not registered or not found
	if err != nil || userID == 0 {
		// Send user-friendly helper message telling them their Chat ID
		replyText := fmt.Sprintf("Halo! Akun Telegram Anda belum terhubung ke sistem LIMS.\n\nChat ID Anda adalah: %s\n\nSilakan masukkan Chat ID ini di halaman Profil atau hubungi Administrator untuk mendaftarkannya pada menu User Management.", chatIDStr)
		SendTelegramMessage(chatIDStr, replyText)
		c.JSON(http.StatusOK, gin.H{"status": "unregistered", "chat_id": chatIDStr})
		return
	}

	// Fetch user details from LIMS DB
	var user models.User
	if err := database.DB.Preload("Role").First(&user, userID).Error; err != nil {
		replyText := fmt.Sprintf("Akun LIMS Anda (ID: %d) tidak ditemukan di database utama. Silakan hubungi Administrator.", userID)
		SendTelegramMessage(chatIDStr, replyText)
		c.JSON(http.StatusOK, gin.H{"status": "user_not_found", "user_id": userID})
		return
	}

	// Check if the message is a command for the AI Chatbot
	msgTextClean := strings.TrimSpace(msgText)
	if strings.HasPrefix(strings.ToLower(msgTextClean), "/ai") {
		var query string
		if len(msgTextClean) > 3 && strings.HasPrefix(strings.ToLower(msgTextClean), "/ai ") {
			query = strings.TrimSpace(msgTextClean[4:])
		} else if len(msgTextClean) == 3 || msgTextClean == "/ai" {
			SendTelegramMessage(chatIDStr, "Format bertanya ke AI: /ai <pertanyaan>\nContoh: /ai Lacak status LIMS-2026-00042")
			c.JSON(http.StatusOK, gin.H{"status": "usage"})
			return
		} else {
			query = strings.TrimSpace(msgTextClean[3:])
		}

		if query == "" {
			SendTelegramMessage(chatIDStr, "Pertanyaan tidak boleh kosong. Gunakan format: /ai <pertanyaan>")
			c.JSON(http.StatusOK, gin.H{"status": "usage"})
			return
		}

		// Process RAG Query
		answer, citations, err := ProcessRAGQuery(query, user.Username)
		if err != nil {
			log.Printf("[Telegram AI] RAG processing failed: %v", err)
			SendTelegramMessage(chatIDStr, "Maaf, AI Asisten Lab sedang mengalami gangguan saat memproses pertanyaan Anda.")
			c.JSON(http.StatusOK, gin.H{"status": "rag_error", "error": err.Error()})
			return
		}

		// Format output with citations
		var replyText strings.Builder
		replyText.WriteString(answer)
		if len(citations) > 0 {
			replyText.WriteString("\n\n*Sumber Rujukan SOP:*")
			for _, cite := range citations {
				replyText.WriteString(fmt.Sprintf("\n📄 %s (Hlm. %d)", cite.FileName, cite.PageNumber))
			}
		}

		// Send answer back to Telegram
		SendTelegramMessage(chatIDStr, replyText.String())
		c.JSON(http.StatusOK, gin.H{"status": "ai_response"})
		return
	}

	// Check if this is a reply to an operator message from a Helpdesk agent
	if (user.Role.Name == "ADMIN" || user.Role.Name == "HELPDESK") && update.Message.ReplyToMessage != nil {
		if update.Message.ReplyToMessage.Text != "" {
			var targetUsername string
			replyText := update.Message.ReplyToMessage.Text
			lines := strings.Split(replyText, "\n")
			for _, line := range lines {
				if strings.HasPrefix(strings.TrimSpace(line), "Pengirim:") {
					targetUsername = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(line), "Pengirim:"))
					break
				}
			}

			if targetUsername != "" {
				var targetUser models.User
				if err := database.DB.Where("username = ?", targetUsername).First(&targetUser).Error; err == nil {
					var targetChatID string
					err = database.ChatBotDB.Table("chat_sch.user_social_accounts").
						Select("account_id").
						Where("user_id = ? AND channel_type = 'telegram'", targetUser.ID).
						Row().Scan(&targetChatID)
					if err == nil && targetChatID != "" {
						// Save the chat message in database
						agentChat := models.AgentChat{
							SenderID:     user.ID,
							SenderName:   user.Username,
							ReceiverID:   targetUser.ID,
							ReceiverName: targetUser.Username,
							Message:      msgText,
							CreatedAt:    time.Now(),
							CreatedUser:  user.Username,
						}
						if err := database.ChatBotDB.Create(&agentChat).Error; err == nil {
							// Forward to target operator's Telegram
							SendTelegramMessage(targetChatID, fmt.Sprintf("💬 *Pesan dari Helpdesk*\nPengirim: %s\nPesan: %s", user.Username, msgText))
							c.JSON(http.StatusOK, gin.H{"status": "forwarded_reply", "to": targetUsername})
							return
						}
					}
				}
			}
		}
	}

	// Save incoming message to agent_chats partitioned table
	agentChat := models.AgentChat{
		SenderID:     user.ID,
		SenderName:   user.Username,
		ReceiverID:   0,
		ReceiverName: "HELPDESK",
		Message:      msgText,
		CreatedAt:    time.Now(),
		CreatedUser:  user.Username,
	}

	if err := database.ChatBotDB.Create(&agentChat).Error; err != nil {
		log.Printf("[Telegram Webhook] Failed to save chat: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save chat"})
		return
	}

	// Forward this operator's message to all registered Helpdesk/Admin agents' Telegram
	go func(sName string, text string) {
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
					// Don't send back to sender (in case sender is somehow in this list)
					if row.AccountID != "" && row.AccountID != chatIDStr {
						SendTelegramMessage(row.AccountID, fmt.Sprintf("📢 *Pesan Operator*\nPengirim: %s\nPesan: %s", sName, text))
					}
				}
			}
		}
	}(user.Username, msgText)

	c.JSON(http.StatusOK, gin.H{"status": "success", "message_id": agentChat.ID})
}

// SendTelegramMessage sends outbound messages from LIMS to Telegram
func SendTelegramMessage(chatID string, text string) error {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	if token == "" {
		// Default token fallback from user's active bot
		token = "8985135158:AAH_5evubEsgibXAyTd8FisoMso-p23DCx8"
	}

	apiURL := "https://api.telegram.org/bot" + token + "/sendMessage"

	payload := map[string]string{
		"chat_id": chatID,
		"text":    text,
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[Telegram Outbound] Request failed: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var responseBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&responseBody)
		log.Printf("[Telegram Outbound] Non-OK status %d. Response: %v", resp.StatusCode, responseBody)
		return fmt.Errorf("telegram returned status %d", resp.StatusCode)
	}

	return nil
}
