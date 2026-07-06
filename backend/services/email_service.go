package services

import (
	"fmt"
	"lim-system/models"
	"lim-system/database"
	"net/smtp"
	"os"
	"strings"
)

// SendEmailToRole sends an email notification to all users matching the role name
func SendEmailToRole(roleName string, subject string, message string) {
	fmt.Printf("[EMAIL SERVICE] Preparing email to role: %s\n", roleName)
	fmt.Printf("[EMAIL SERVICE] Subject: %s\n", subject)

	var users []models.User
	var role models.Role
	
	database.DB.Where("name = ?", roleName).First(&role)
	if role.ID == 0 {
		fmt.Printf("[EMAIL SERVICE] Role %s not found. Skipping email.\n", roleName)
		return
	}

	database.DB.Where("role_id = ?", role.ID).Find(&users)

	var emails []string
	for _, u := range users {
		if u.Email != "" {
			emails = append(emails, u.Email)
		}
	}

	if len(emails) == 0 {
		fmt.Printf("[EMAIL SERVICE] No valid email addresses found for role: %s\n", roleName)
		return
	}

	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	from := os.Getenv("SMTP_USER")
	password := os.Getenv("SMTP_PASSWORD")

	if host == "" || from == "" {
		fmt.Printf("[EMAIL SERVICE] SMTP not configured. Mock sending to: %v\n", emails)
		fmt.Printf("[EMAIL SERVICE] Body: %s\n", message)
		return
	}

	auth := smtp.PlainAuth("", from, password, host)
	to := emails
	
	msg := []byte(fmt.Sprintf("To: %s\r\n"+
		"Subject: [MEC System] %s\r\n"+
		"\r\n"+
		"%s\r\n", strings.Join(to, ","), subject, message))

	err := smtp.SendMail(fmt.Sprintf("%s:%s", host, port), auth, from, to, msg)
	if err != nil {
		fmt.Printf("[EMAIL SERVICE] Failed to send email: %v\n", err)
	} else {
		fmt.Printf("[EMAIL SERVICE] Successfully sent email to %v\n", to)
	}
}

// SendEmailToAddress sends an email notification to a specific email address
func SendEmailToAddress(email string, subject string, message string) {
	if email == "" {
		return
	}

	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	from := os.Getenv("SMTP_USER")
	password := os.Getenv("SMTP_PASSWORD")

	if host == "" || from == "" {
		fmt.Printf("[EMAIL SERVICE] SMTP not configured. Mock sending to: %v\n", email)
		fmt.Printf("[EMAIL SERVICE] Body: %s\n", message)
		return
	}

	auth := smtp.PlainAuth("", from, password, host)
	to := []string{email}

	msg := []byte(fmt.Sprintf("To: %s\r\n"+
		"Subject: [MEC System] %s\r\n"+
		"\r\n"+
		"%s\r\n", email, subject, message))

	err := smtp.SendMail(fmt.Sprintf("%s:%s", host, port), auth, from, to, msg)
	if err != nil {
		fmt.Printf("[EMAIL SERVICE] Failed to send email to %s: %v\n", email, err)
	} else {
		fmt.Printf("[EMAIL SERVICE] Successfully sent email to %s\n", email)
	}
}
