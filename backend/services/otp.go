package services

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"lim-system/models"
	"log"
	"math/big"
	"net/http"
	"os"
	"time"
)

// GenerateRandomOTP generates a random numeric string of specified length
func GenerateRandomOTP(length int) string {
	const digits = "0123456789"
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			result[i] = digits[0]
		} else {
			result[i] = digits[num.Int64()]
		}
	}
	return string(result)
}

// SendTelegramMessage sends a message to Telegram using Bot API
func SendTelegramMessage(chatID string, text string) error {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	if token == "" {
		token = models.GetGlobalParam("TELEGRAM_BOT_TOKEN", "")
	}

	if token == "" {
		log.Printf("[MOCK TELEGRAM] Token not configured. Sent to %s: %s", chatID, text)
		return nil
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	payload := map[string]interface{}{
		"chat_id": chatID,
		"text":    text,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Printf("Failed to send Telegram message: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram bot api returned status %s", resp.Status)
	}

	return nil
}

// SendWhatsAppMessage sends a message via WhatsApp Gateway
func SendWhatsAppMessage(phone string, text string) error {
	gatewayURL := os.Getenv("WHATSAPP_GATEWAY_URL")
	if gatewayURL == "" {
		gatewayURL = models.GetGlobalParam("WHATSAPP_GATEWAY_URL", "")
	}

	apiKey := os.Getenv("WHATSAPP_API_KEY")
	if apiKey == "" {
		apiKey = models.GetGlobalParam("WHATSAPP_API_KEY", "")
	}

	if gatewayURL == "" {
		log.Printf("[MOCK WHATSAPP] Gateway not configured. Sent to %s: %s", phone, text)
		return nil
	}

	payload := map[string]interface{}{
		"phone":   phone,
		"message": text,
		"key":     apiKey,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(gatewayURL, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Printf("Failed to send WhatsApp message: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("whatsapp gateway returned status %s", resp.Status)
	}

	return nil
}
