package controllers

import (
	"lim-system/database"
	"lim-system/models"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type SummaryReportResult struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

func GetSummaryReport(c *gin.Context) {
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	// Enforce single month query for performance
	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both start_date and end_date are required."})
		return
	}

	startDt, err1 := time.Parse("2006-01-02", startDateStr)
	endDt, err2 := time.Parse("2006-01-02", endDateStr)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	if startDt.Year() != endDt.Year() || startDt.Month() != endDt.Month() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query across multiple months is not allowed. Please filter within a single month."})
		return
	}

	sourceTable := "testing_applications"
	suffix := startDt.Format("200601")
	thresholdStr := database.GetGlobalParam("DATA_ARCHIVE_THRESHOLD_MONTHS", "3")
	threshold, _ := strconv.Atoi(thresholdStr)
	now := time.Now()
	currentMonthSerial := now.Year()*12 + int(now.Month())
	targetMonthSerial := startDt.Year()*12 + int(startDt.Month())

	if (currentMonthSerial - targetMonthSerial) >= threshold {
		sourceTable = fmt.Sprintf("testing_applications_arc_%s", suffix)
	} else {
		potentialTable := fmt.Sprintf("testing_applications_%s", suffix)
		var exists bool
		database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", potentialTable).Scan(&exists)
		if exists {
			sourceTable = potentialTable
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Data partition for %s not found.", suffix)})
			return
		}
	}

	query := database.DB.Table(sourceTable).Select("status, COUNT(*) as count")

	if startDateStr != "" && endDateStr != "" {
		startDt, _ := time.Parse("2006-01-02", startDateStr)
		endDt, _ := time.Parse("2006-01-02", endDateStr)
		query = query.Where("created_at >= ? AND created_at <= ?", startDt, endDt.Add(24*time.Hour).Add(-1*time.Second))
	} else if startDateStr != "" {
		startDt, err1 := time.Parse("2006-01-02", startDateStr)
		if err1 == nil {
			query = query.Where("created_at >= ?", startDt)
		}
	}

	query = query.Group("status")

	var results []SummaryReportResult
	if err := query.Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data summary"})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetDetailReport gives applications ordered by status for reporting purposes
func GetDetailReport(c *gin.Context) {
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	startDt, err1 := time.Parse("2006-01-02", startDateStr)
	endDt, err2 := time.Parse("2006-01-02", endDateStr)
	
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal tidak valid"})
		return
	}

	if startDt.Year() != endDt.Year() || startDt.Month() != endDt.Month() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query across multiple months is not allowed. Please filter within a single month."})
		return
	}

	sourceTable := "testing_applications"
	suffix := startDt.Format("200601")
	thresholdStr := database.GetGlobalParam("DATA_ARCHIVE_THRESHOLD_MONTHS", "3")
	threshold, _ := strconv.Atoi(thresholdStr)
	now := time.Now()
	currentMonthSerial := now.Year()*12 + int(now.Month())
	targetMonthSerial := startDt.Year()*12 + int(startDt.Month())

	if (currentMonthSerial - targetMonthSerial) >= threshold {
		sourceTable = fmt.Sprintf("testing_applications_arc_%s", suffix)
	} else {
		potentialTable := fmt.Sprintf("testing_applications_%s", suffix)
		var exists bool
		database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", potentialTable).Scan(&exists)
		if exists {
			sourceTable = potentialTable
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Data partition for %s not found.", suffix)})
			return
		}
	}

	query := database.DB.Model(&models.TestingApplication{}).Table(sourceTable).
		Preload("Partner").Preload("Equipment.Brand").Preload("Equipment.Model").Preload("Equipment.Variant").
		Order("status ASC, created_at DESC")

	query = query.Where(fmt.Sprintf("%s.created_at >= ? AND %s.created_at <= ?", sourceTable, sourceTable), startDt, endDt.Add(24*time.Hour).Add(-1*time.Second))
	
	// Optional filter by status if we want to filter to specific ones instead of ALL
	statusFilter := c.Query("status")
	if statusFilter != "" {
		query = query.Where("UPPER(status) = UPPER(?)", statusFilter)
	}

	var apps []models.TestingApplication
	if err := query.Find(&apps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data laporan detail"})
		return
	}

	c.JSON(http.StatusOK, apps)
}

func GetToolTransactionReport(c *gin.Context) {
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate time.Time

	if startDateStr != "" && endDateStr != "" {
		var err1, err2 error
		startDate, err1 = time.Parse("2006-01-02", startDateStr)
		endDate, err2 = time.Parse("2006-01-02", endDateStr)
		if err1 != nil || err2 != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal tidak valid (harus YYYY-MM-DD)"})
			return
		}
		// Adjust endDate to end of day
		endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	} else {
		// Fallback to legacy start_period / end_period (YYYYMM)
		startPeriod := c.Query("start_period")
		endPeriod := c.Query("end_period")

		if startPeriod == "" || endPeriod == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "start_date & end_date (atau start_period & end_period) diperlukan"})
			return
		}

		if len(startPeriod) < 6 || len(endPeriod) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format periode tidak valid (harus YYYYMM)"})
			return
		}

		startY, _ := strconv.Atoi(startPeriod[:4])
		startM, _ := strconv.Atoi(startPeriod[4:])
		endY, _ := strconv.Atoi(endPeriod[:4])
		endM, _ := strconv.Atoi(endPeriod[4:])

		startDate = time.Date(startY, time.Month(startM), 1, 0, 0, 0, 0, time.Local)
		endDate = time.Date(endY, time.Month(endM)+1, 1, 0, 0, 0, 0, time.Local).Add(-1 * time.Second)
	}

	if startDate.Year() != endDate.Year() || startDate.Month() != endDate.Month() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pencarian lintas bulan tidak diperbolehkan. Silakan pilih rentang tanggal dalam bulan yang sama."})
		return
	}

	suffix := startDate.Format("200601")
	partitionTable := fmt.Sprintf("testing_tool_transactions_%s", suffix)

	// Check if partition exists
	var exists bool
	database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", partitionTable).Scan(&exists)

	sourceTable := "testing_tool_transactions"
	if exists {
		sourceTable = partitionTable
	}

	var transactions []struct {
		models.TestingToolTransaction
		ToolName      string `json:"tool_name"`
		PartitionName string `json:"partition_name"`
	}

	// Join with testing_tools to get names
	err := database.DB.Table(sourceTable).
		Select(fmt.Sprintf("%s.*, testing_tools.name as tool_name, '%s' as partition_name", sourceTable, sourceTable)).
		Joins(fmt.Sprintf("left join testing_tools on testing_tools.code = %s.tool_code", sourceTable)).
		Where(fmt.Sprintf("%s.created_at >= ? AND %s.created_at <= ?", sourceTable, sourceTable), startDate, endDate).
		Order(fmt.Sprintf("%s.created_at desc", sourceTable)).
		Find(&transactions).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data laporan: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

type AssetListReportResult struct {
	AssetID           uint64     `json:"asset_id"`
	SerialNo          string     `json:"serial_no"`
	EquipmentName     string     `json:"equipment_name"`
	AssetStatusName   string     `json:"asset_status_name"`
	LocationName      string     `json:"location_name"`
	RegistrationNo    string     `json:"registration_no"`
	RegistrationDate  *time.Time `json:"registration_date"`
	ApplicationStatus string     `json:"application_status"`
}

type AssetHandoverReportResult struct {
	AssetID       uint64    `json:"asset_id"`
	SerialNo      string    `json:"serial_no"`
	EquipmentName string    `json:"equipment_name"`
	HandoverNo    string    `json:"handover_no"`
	HandoverDate  time.Time `json:"handover_date"`
	PartnerName   string    `json:"partner_name"`
	ReceiverName  string    `json:"receiver_name"`
	Notes         string    `json:"notes"`
}

func GetAssetListReport(c *gin.Context) {
	year := c.Query("year")
	month := c.Query("month")

	if year == "" || month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter year dan month diperlukan (format: YYYY dan MM)"})
		return
	}

	suffix := fmt.Sprintf("%s%s", year, month)
	sourceTable := "testing_equipments"
	appTable := "testing_applications"

	// 1. Tentukan tabel sumber (cek partisi atau arsip)
	thresholdStr := database.GetGlobalParam("DATA_ARCHIVE_THRESHOLD_MONTHS", "3")
	threshold, _ := strconv.Atoi(thresholdStr)
	now := time.Now()
	
	targetY, _ := strconv.Atoi(year)
	targetM, _ := strconv.Atoi(month)
	currentMonthSerial := now.Year()*12 + int(now.Month())
	targetMonthSerial := targetY*12 + targetM

	// Get current schema from ENV or default to public
	dbSchema := os.Getenv("DB_SCHEMA")
	if dbSchema == "" {
		dbSchema = "public"
	}

	if (currentMonthSerial - targetMonthSerial) >= threshold {
		sourceTable = fmt.Sprintf("testing_equipments_arc_%s", suffix)
		appTable = fmt.Sprintf("testing_applications_arc_%s", suffix)
	} else {
		potentialTable := fmt.Sprintf("testing_equipments_%s", suffix)
		var exists bool
		// Tambahkan pengecekan table_schema agar lebih akurat
		database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ? AND table_schema = ?)", potentialTable, dbSchema).Scan(&exists)
		if exists {
			sourceTable = potentialTable
			potentialAppTable := fmt.Sprintf("testing_applications_%s", suffix)
			var appExists bool
			database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ? AND table_schema = ?)", potentialAppTable, dbSchema).Scan(&appExists)
			if appExists {
				appTable = potentialAppTable
			}
		}
	}

	// 2. Eksekusi Query dengan Join
	var results []AssetListReportResult
	
	// Gunakan alias untuk tabel agar join lebih aman
	query := database.DB.Table(sourceTable + " as teq").
		Select(`
			teq.id as asset_id, 
			teq.serial_no, 
			teq.equipment_name, 
			mas.asset_status_name, 
			loc.name as location_name, 
			app.reg_number as registration_no, 
			app.created_at as registration_date, 
			app.status as application_status
		`).
		Joins(fmt.Sprintf("LEFT JOIN %s as app ON (app.id = teq.application_id OR app.equipment_id = teq.id)", appTable)).
		Joins("LEFT JOIN master_asset_statuses as mas ON mas.asset_status_code = teq.asset_status_code").
		Joins("LEFT JOIN locations as loc ON loc.code = teq.asset_location_code").
		Order("teq.id ASC")

	if err := query.Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database Error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

func GetAssetHandoverReport(c *gin.Context) {
	year := c.Query("year")
	month := c.Query("month")

	if year == "" || month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameter year dan month diperlukan"})
		return
	}

	suffix := fmt.Sprintf("%s%s", year, month)
	sourceTable := "asset_handovers"
	equipTable := "testing_equipments"

	dbSchema := os.Getenv("DB_SCHEMA")
	if dbSchema == "" {
		dbSchema = "public"
	}

	// Cek keberadaan tabel partisi
	potentialTable := fmt.Sprintf("asset_handovers_%s", suffix)
	var exists bool
	database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ? AND table_schema = ?)", potentialTable, dbSchema).Scan(&exists)
	if exists {
		sourceTable = potentialTable
		potentialEquipTable := fmt.Sprintf("testing_equipments_%s", suffix)
		var equipExists bool
		database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ? AND table_schema = ?)", potentialEquipTable, dbSchema).Scan(&equipExists)
		if equipExists {
			equipTable = potentialEquipTable
		}
	}

	var results []AssetHandoverReportResult
	query := database.DB.Table(sourceTable + " as hov").
		Select(`
			hov.asset_id,
			teq.serial_no,
			teq.equipment_name,
			hov.handover_no,
			hov.handover_date,
			p.name as partner_name,
			hov.receiver_name,
			hov.notes
		`).
		Joins(fmt.Sprintf("LEFT JOIN %s as teq ON teq.id = hov.asset_id", equipTable)).
		Joins("LEFT JOIN partners as p ON p.id = hov.partner_id").
		Order("hov.handover_date DESC, hov.handover_no ASC")

	if err := query.Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database Error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, results)
}

// GetGoAccessReport reads the GoAccess report.html from shared reports and proxies it to authorized clients
func GetGoAccessReport(c *gin.Context) {
	// 1. Ambil informasi dari JWT Session (yang otomatis memvalidasi password database aktif)
	username, existsUsername := c.Get("username")
	role, existsRole := c.Get("role")

	if !existsUsername || !existsRole {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Sesi tidak ditemukan"})
		return
	}

	// Membatasi akses KHUSUS untuk user 'nur' (karena password nur berubah maksimal 90 hari)
	// atau user yang memiliki Role ADMIN
	if username.(string) != "nur" && role.(string) != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Hanya user 'nur' atau role ADMIN yang diizinkan mengakses analitik."})
		return
	}

	// 2. Baca file report.html dari shared folder
	htmlPath := "/home/lims/shared_reports/report.html"
	htmlContent, err := os.ReadFile(htmlPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca berkas laporan analitik GoAccess"})
		return
	}

	// 3. Kirimkan konten sebagai berkas HTML murni
	c.Data(http.StatusOK, "text/html; charset=utf-8", htmlContent)
}

// CheckReportAccess is a lightweight endpoint used by Nginx's auth_request directive
func CheckReportAccess(c *gin.Context) {
	username, existsUsername := c.Get("username")
	role, existsRole := c.Get("role")

	if !existsUsername || !existsRole {
		c.Status(http.StatusUnauthorized)
		return
	}

	// Validasi apakah user adalah 'nur' atau memiliki role 'ADMIN'
	if username.(string) == "nur" || role.(string) == "ADMIN" {
		c.Status(http.StatusOK) // Autentikasi Berhasil
		return
	}

	c.Status(http.StatusForbidden) // Ditolak
}

