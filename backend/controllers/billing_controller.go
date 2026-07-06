package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"lim-system/models"
	"lim-system/database"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetInvoices retrieves invoices with pagination and filters
func GetInvoices(c *gin.Context) {
	year := c.Query("year")
	month := c.Query("month")
	if year == "" {
		year = fmt.Sprintf("%d", time.Now().Year())
	}
	if month == "" {
		month = fmt.Sprintf("%02d", time.Now().Month())
	}

	if len(month) == 1 {
		month = "0" + month
	}

	sourceTable := "invoices"
	if year != "" && month != "" {
		potentialTable := fmt.Sprintf("invoices_%s%s", year, month)
		var count int64
		database.DB.Raw("SELECT count(*) FROM pg_tables WHERE tablename = ?", potentialTable).Scan(&count)
		if count > 0 {
			sourceTable = potentialTable
		}
	}

	var results []struct {
		models.Invoice
		RegNumber string `json:"reg_number"`
	}

	db := database.DB.Table(sourceTable)

	if appID := c.Query("application_id"); appID != "" {
		db = db.Where(fmt.Sprintf("%s.application_id = ?", sourceTable), appID)
	}
	if partnerID := c.Query("partner_id"); partnerID != "" {
		db = db.Where(fmt.Sprintf("%s.application_id IN (SELECT id FROM testing_applications WHERE partner_id = ?)", sourceTable), partnerID)
	}
	if regNumber := c.Query("reg_number"); regNumber != "" {
		db = db.Where("a.reg_number = ?", regNumber)
	}
	if search := c.Query("search"); search != "" {
		searchTerm := "%" + search + "%"
		db = db.Where(fmt.Sprintf("%s.invoice_number ILIKE ? OR %s.application_id IN (SELECT id FROM testing_applications WHERE reg_number ILIKE ?)", sourceTable, sourceTable), searchTerm, searchTerm)
	}
	if status := c.Query("status"); status != "" {
		statusList := strings.Split(status, ",")
		db = db.Where(fmt.Sprintf("%s.status IN ?", sourceTable), statusList)
	}

	// Pagination - clone db to avoid affecting main query
	var total int64
	db.Count(&total)

	// Apply Select and Joins AFTER Count
	db = db.Select(fmt.Sprintf("%s.*, a.reg_number", sourceTable)).
		Joins(fmt.Sprintf("LEFT JOIN testing_applications a ON a.id = %s.application_id", sourceTable))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	if err := db.Limit(limit).Offset(offset).Order(sourceTable + ".created_at DESC").Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": results,
		"metadata": gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

// GenerateInvoice manually or automatically
func GenerateInvoice(c *gin.Context) {
	appID := c.Param("appId")
	var app models.TestingApplication
	if err := database.DB.Preload("Package").Preload("Methodology").First(&app, "id = ?", appID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	// Check if invoice already exists
	var existing models.Invoice
	if err := database.DB.Where("application_id = ?", app.ID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Invoice already exists for this application"})
		return
	}

	// Calculate Total Price
	var totalPrice float64
	if app.PackageID != nil && app.Package != nil {
		totalPrice = app.Package.BasePrice
	} else if app.MethodologyCode != nil {
		totalPrice = app.Methodology.Price
	} else {
		// Fallback to methodology price if loaded
		totalPrice = 0 
	}

	// Generate Invoice Number based on configurable format
	format := models.GetGlobalParam("INVOICE_NUMBER_FORMAT", "INV/{REG}/{UNIX}")
	invoiceNumber := strings.Replace(format, "{REG}", app.RegNumber, -1)
	invoiceNumber = strings.Replace(invoiceNumber, "{UNIX}", fmt.Sprintf("%d", time.Now().Unix()), -1)
	invoiceNumber = strings.Replace(invoiceNumber, "{YYYY}", fmt.Sprintf("%d", time.Now().Year()), -1)

	invoice := models.Invoice{
		InvoiceNumber: invoiceNumber,
		ApplicationID: app.ID,
		TotalAmount:   totalPrice,
		FinalAmount:   totalPrice,
		Status:        "UNPAID",
		CreatedAt:     time.Now(),
	}

	if err := database.DB.Create(&invoice).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, invoice)
}

// CreatePayment records a payment for an invoice
func CreatePayment(c *gin.Context) {
	var input struct {
		InvoiceID     uint64  `json:"invoice_id" binding:"required"`
		AmountPaid    float64 `json:"amount_paid" binding:"required"`
		PaymentMethod string  `json:"payment_method"`
		ReferenceNo   string  `json:"reference_no"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var invoice models.Invoice
	if err := database.DB.First(&invoice, input.InvoiceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
		return
	}

	username, _ := c.Get("username")
	payment := models.Payment{
		InvoiceID:     input.InvoiceID,
		Amount:        input.AmountPaid,
		PaymentDate:   time.Now(),
		PaymentMethod: input.PaymentMethod,
		Notes:         input.ReferenceNo,
		CreatedUser:   username.(string),
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&payment).Error; err != nil {
			return err
		}

		// Check if fully paid
		var totalPaid float64
		tx.Model(&models.Payment{}).Where("invoice_id = ?", invoice.ID).Select("sum(amount)").Scan(&totalPaid)

		if totalPaid >= invoice.FinalAmount {
			if err := tx.Model(&invoice).Update("status", "PAID").Error; err != nil {
				return err
			}
		} else if totalPaid > 0 {
			if err := tx.Model(&invoice).Update("status", "PARTIAL").Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, payment)
}

// GetPayments retrieves all payment records
func GetPayments(c *gin.Context) {
	year := c.Query("year")
	month := c.Query("month")
	if year == "" {
		year = fmt.Sprintf("%d", time.Now().Year())
	}
	if month == "" {
		month = fmt.Sprintf("%02d", time.Now().Month())
	}

	if len(month) == 1 {
		month = "0" + month
	}

	sourceTable := "payments"
	if year != "" && month != "" {
		potentialTable := fmt.Sprintf("payments_%s%s", year, month)
		var count int64
		database.DB.Raw("SELECT count(*) FROM pg_tables WHERE tablename = ?", potentialTable).Scan(&count)
		if count > 0 {
			sourceTable = potentialTable
		}
	}

	var results []struct {
		models.Payment
		InvoiceNumber string `json:"invoice_number"`
		RegNumber     string `json:"reg_number"`
	}

	db := database.DB.Table(sourceTable)

	if invoiceID := c.Query("invoice_id"); invoiceID != "" {
		db = db.Where(fmt.Sprintf("%s.invoice_id = ?", sourceTable), invoiceID)
	}

	var total int64
	db.Count(&total)

	// Apply Select and Joins AFTER Count
	db = db.Select(fmt.Sprintf("%s.*, i.invoice_number, a.reg_number", sourceTable)).
		Joins(fmt.Sprintf("LEFT JOIN invoices i ON %s.invoice_id = i.id", sourceTable)).
		Joins("LEFT JOIN testing_applications a ON i.application_id = a.id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	if err := db.Limit(limit).Offset(offset).Order(fmt.Sprintf("%s.payment_date DESC", sourceTable)).Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":         results,
		"total":        total,
		"source_table": sourceTable,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
		},
	})
}
