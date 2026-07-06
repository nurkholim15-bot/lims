package utils

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

func GenerateRandomString(n int) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "RANDOM"
	}
	return hex.EncodeToString(bytes)[:n]
}

func ValidatePassword(password string, minLength int) bool {
	if len(password) < minLength {
		return false
	}

	var (
		hasUpper   = false
		hasLower   = false
		hasNumber  = false
		hasSpecial = false
	)

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char) || regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(string(char)):
			hasSpecial = true
		}
	}

	return hasUpper && hasLower && hasNumber && hasSpecial
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func MaskSensitiveData(s string) string {
	if s == "" {
		return ""
	}

	// 1. Mask "password": "..." or "password": "..."
	rePass := regexp.MustCompile(`(?i)("password"\s*:\s*")[^"]+(")`)
	s = rePass.ReplaceAllString(s, `${1}***${2}`)

	// 2. Mask "token": "..." or "token": "..."
	reToken := regexp.MustCompile(`(?i)("token"\s*:\s*")[^"]+(")`)
	s = reToken.ReplaceAllString(s, `${1}***${2}`)

	// 3. Truncate if too long
	const maxLen = 256
	if len(s) > maxLen {
		return s[:maxLen] + "...(truncated)"
	}
	return s
}
