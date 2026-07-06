package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"lim-system/utils"
	"net/http"
	"os"
)

type CamundaVariable struct {
	Value interface{} `json:"value"`
	Type  string      `json:"type"`
}

type CamundaStartRequest struct {
	Variables   map[string]CamundaVariable `json:"variables"`
	BusinessKey string                     `json:"businessKey"`
}

type CamundaStartResponse struct {
	ID string `json:"id"`
}

// CamundaServiceInterface defines the methods for Camunda integration
type CamundaServiceInterface interface {
	TriggerTestingMilitary(registrationID uint64, registrationNumber string) (string, error)
}

// camundaServiceImpl is the real implementation that calls Camunda REST API
type camundaServiceImpl struct{}

func (s *camundaServiceImpl) TriggerTestingMilitary(registrationID uint64, registrationNumber string) (string, error) {
	camundaURL := os.Getenv("CAMUNDA_URL")
	processKey := "Process_Sertifikasi_Militer"
	endpoint := fmt.Sprintf("%s/process-definition/key/%s/start", camundaURL, processKey)

	body := CamundaStartRequest{
		BusinessKey: registrationNumber,
		Variables: map[string]CamundaVariable{
			"registrationID": {
				Value: registrationID,
				Type:  "Long",
			},
			"registrationNumber": {
				Value: registrationNumber,
				Type:  "String",
			},
			"status": {
				Value: "Registered",
				Type:  "String",
			},
		},
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")

	// Add basic auth if configured
	user := os.Getenv("CAMUNDA_USER")
	pwd := os.Getenv("CAMUNDA_PASSWORD")
	encryptedPwd := os.Getenv("CAMUNDA_PASSWORD_ENCRYPTED")
	if encryptedPwd != "" {
		decrypted, err := utils.DecryptAES(encryptedPwd, os.Getenv("JWT_SECRET"))
		if err == nil {
			pwd = decrypted
		} else {
			log.Printf("Warning: failed to decrypt CAMUNDA_PASSWORD_ENCRYPTED: %v", err)
		}
	}

	if user != "" && pwd != "" {
		req.SetBasicAuth(user, pwd)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusNoContent {
		return "", fmt.Errorf("camunda returned status: %s", resp.Status)
	}

	var camundaResp CamundaStartResponse
	if err := json.NewDecoder(resp.Body).Decode(&camundaResp); err != nil {
		return "", err
	}

	return camundaResp.ID, nil
}

// mockCamundaService is a mock implementation for development that doesn't require Camunda to be running
type mockCamundaService struct{}

func (s *mockCamundaService) TriggerTestingMilitary(registrationID uint64, registrationNumber string) (string, error) {
	fmt.Printf("[MOCK CAMUNDA] Triggering process for Reg: %s (ID: %d)\n", registrationNumber, registrationID)
	// Return a fake process ID
	return fmt.Sprintf("MOCK-PROC-%d", registrationID), nil
}

// Global Camunda service instance
var Camunda CamundaServiceInterface

func InitCamunda() {
	if os.Getenv("CAMUNDA_ENV") == "development" {
		Camunda = &mockCamundaService{}
		fmt.Println("Camunda Service: Using MOCK implementation (Development Mode)")
	} else {
		Camunda = &camundaServiceImpl{}
		fmt.Println("Camunda Service: Using REAL implementation")
	}
}

