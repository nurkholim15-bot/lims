package controllers

import (
	"fmt"
	"lim-system/database"
	"lim-system/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type FinanceReportResponse struct {
	Month          string                 `json:"month"`
	Year           string                 `json:"year"`
	Summary        FinanceSummary         `json:"summary"`
	TravelRequests []models.TravelRequest `json:"travel_requests"`
	CashAdvances   []models.CashAdvance   `json:"cash_advances"`
	Reimbursements []models.Reimbursement `json:"reimbursements"`
}

type FinanceSummary struct {
	TotalTravelRequests int     `json:"total_travel_requests"`
	TotalCashAdvances   int     `json:"total_cash_advances"`
	TotalCashAmount     float64 `json:"total_cash_amount"`
	TotalReimbursements int     `json:"total_reimbursements"`
	TotalReimburseAmt   float64 `json:"total_reimburse_amount"`
}

func GetMonthlyFinanceReport(c *gin.Context) {
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	if monthStr == "" || yearStr == "" {
		now := time.Now()
		monthStr = fmt.Sprintf("%02d", now.Month())
		yearStr = fmt.Sprintf("%d", now.Year())
	}

	// Calculate bounds for partition pruning
	startDateStr := fmt.Sprintf("%s-%s-01", yearStr, monthStr)
	parsedStart, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}
	parsedEnd := parsedStart.AddDate(0, 1, 0)

	reportType := c.Query("type")
	if reportType == "" {
		reportType = "all"
	}

	suffix := fmt.Sprintf("%s%s", yearStr, monthStr)

	var travelRequests []models.TravelRequest
	var cashAdvances []models.CashAdvance
	var reimbursements []models.Reimbursement

	// Fetch Travel Requests
	if reportType == "all" || reportType == "spd" {
		trTable := fmt.Sprintf("travel_requests_%s", suffix)
		if err := database.DB.Table(trTable).Preload("User").Preload("Location").
			Where("created_at >= ? AND created_at < ?", parsedStart, parsedEnd).
			Order("created_at DESC").
			Find(&travelRequests).Error; err != nil {
			// Fallback to parent table if partition not found
			database.DB.Model(&models.TravelRequest{}).Preload("User").Preload("Location").
				Where("created_at >= ? AND created_at < ?", parsedStart, parsedEnd).
				Order("created_at DESC").
				Find(&travelRequests)
		}
	}

	// Fetch Cash Advances
	if reportType == "all" || reportType == "cash_advance" {
		caTable := fmt.Sprintf("cash_advances_%s", suffix)
		if err := database.DB.Table(caTable).Preload("User").Preload("TravelRequest").
			Where("created_at >= ? AND created_at < ?", parsedStart, parsedEnd).
			Order("created_at DESC").
			Find(&cashAdvances).Error; err != nil {
			database.DB.Model(&models.CashAdvance{}).Preload("User").Preload("TravelRequest").
				Where("created_at >= ? AND created_at < ?", parsedStart, parsedEnd).
				Order("created_at DESC").
				Find(&cashAdvances)
		}
	}

	// Fetch Reimbursements
	if reportType == "all" || reportType == "reimbursement" {
		rmTable := fmt.Sprintf("reimbursements_%s", suffix)
		if err := database.DB.Table(rmTable).Preload("User").Preload("TravelRequest").Preload("CashAdvance").
			Where("created_at >= ? AND created_at < ?", parsedStart, parsedEnd).
			Order("created_at DESC").
			Find(&reimbursements).Error; err != nil {
			database.DB.Model(&models.Reimbursement{}).Preload("User").Preload("TravelRequest").Preload("CashAdvance").
				Where("created_at >= ? AND created_at < ?", parsedStart, parsedEnd).
				Order("created_at DESC").
				Find(&reimbursements)
		}
	}

	// Calculate Summaries
	summary := FinanceSummary{
		TotalTravelRequests: len(travelRequests),
		TotalCashAdvances:   len(cashAdvances),
		TotalReimbursements: len(reimbursements),
	}

	for _, ca := range cashAdvances {
		if ca.Status != "REJECTED" && ca.Status != "CANCELED" {
			summary.TotalCashAmount += ca.Amount
		}
	}

	for _, r := range reimbursements {
		if r.Status != "REJECTED" && r.Status != "CANCELED" {
			summary.TotalReimburseAmt += r.Amount
		}
	}

	response := FinanceReportResponse{
		Month:          monthStr,
		Year:           yearStr,
		Summary:        summary,
		TravelRequests: travelRequests,
		CashAdvances:   cashAdvances,
		Reimbursements: reimbursements,
	}

	c.JSON(http.StatusOK, response)
}
