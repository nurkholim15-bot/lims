package controllers

import (
	"encoding/json"
	"fmt"
	"html"
	"io"
	"log"
	"lim-system/models"
	"lim-system/services"
	"lim-system/utils"
	"lim-system/database"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Helper to handle file uploads to MinIO
func uploadDoc(c *gin.Context, fieldName string) (string, error) {
	file, header, err := c.Request.FormFile(fieldName)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 1. Size Restriction
	maxSizeStr := os.Getenv("MAX_UPLOAD_SIZE")
	if maxSizeStr == "" {
		maxSizeStr = "2048" // Default 2MB
	}
	maxSizeKB, _ := strconv.ParseInt(maxSizeStr, 10, 64)
	if header.Size > maxSizeKB*1024 {
		return "", fmt.Errorf("file too large (max %s KB)", maxSizeStr)
	}

	// 2. Unique Filename (OriginalName_HHMMSSSSS.ext)
	ext := filepath.Ext(header.Filename)
	baseName := strings.TrimSuffix(header.Filename, ext)
	timestamp := time.Now().Format("150405.000") // HHMMSS.ms
	timestamp = strings.ReplaceAll(timestamp, ".", "")
	uniqueName := fmt.Sprintf("%s_%s%s", baseName, timestamp, ext)

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	return services.Minio.UploadGenericFile(c.Request.Context(), uniqueName, file, header.Size, contentType)
}


func DownloadDocument(c *gin.Context) {
	objectPath := c.Query("path")
	if objectPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Path is required"})
		return
	}

	// SECURITY RULE: Restrict SOP PDF downloads to ADMIN or user with can_manage_sop permission
	if strings.Contains(strings.ToLower(objectPath), "sop") {
		userIDVal, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak terautentikasi"})
			return
		}
		userID := uint(0)
		switch v := userIDVal.(type) {
		case uint:
			userID = v
		case float64:
			userID = uint(v)
		}
		var currentUser models.User
		if err := database.DB.Preload("Role").First(&currentUser, userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak ditemukan"})
			return
		}
		if currentUser.Role.Name != "ADMIN" && currentUser.Role.Name != "SUPERVISOR_LABORATORY" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses Ditolak: Hanya administrator atau supervisor laboratorium yang diperbolehkan mengunduh berkas SOP/RAG"})
			return
		}
	}

	reader, err := services.Minio.DownloadPDF(c.Request.Context(), objectPath)
	
	// Check if file exists in MinIO by calling Stat()
	var minioErr error
	var stat minio.ObjectInfo
	
	// CRITICAL FIX: Ensure reader is not nil before calling Stat()
	if err == nil && reader != nil {
		stat, minioErr = reader.Stat()
	} else if err != nil {
		minioErr = err
	}

	if minioErr != nil {
		log.Printf("[MINIO INFO] File %s not available in MinIO (%v). Trying local fallback...", objectPath, minioErr)

		// LOCAL FALLBACK
		localFilePath := filepath.Join("./public/uploads", objectPath)
		if _, err := os.Stat(localFilePath); err == nil {
			filename := filepath.Base(localFilePath)
			contentType := mime.TypeByExtension(filepath.Ext(filename))
			if contentType == "" {
				contentType = "application/octet-stream"
			}
			c.Header("Content-Disposition", "inline; filename=\""+filename+"\"")
			c.Header("Content-Type", contentType)
			c.File(localFilePath)
			return
		}

		log.Printf("[ERROR] File not found in MinIO nor Local: %s", objectPath)
		c.JSON(http.StatusNotFound, gin.H{"error": "File tidak ditemukan di server maupun penyimpanan lokal"})
		return
	}
	
	if reader == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reader is nil"})
		return
	}
	defer reader.Close()

	c.Header("Content-Length", strconv.FormatInt(stat.Size, 10))

	filename := objectPath
	if idx := strings.LastIndex(objectPath, "/"); idx != -1 {
		filename = objectPath[idx+1:]
	}
	contentType := mime.TypeByExtension(filepath.Ext(filename))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	c.Header("Content-Disposition", "inline; filename=\""+filename+"\"")
	c.Header("Content-Type", contentType)
	io.Copy(c.Writer, reader)
}

func GetMasterData(c *gin.Context) {
	var categories []models.MaterialCategory
	var origins []models.Origin
	var brands []models.Brand
	var modelsList []models.Model
	var variants []models.Variant
	var locations []models.Location
	var assetStatuses []models.MasterAssetStatus

	database.DB.Find(&categories)
	database.DB.Find(&origins)
	database.DB.Find(&brands)
	database.DB.Find(&modelsList)
	database.DB.Find(&variants)
	database.DB.Find(&locations)
	database.DB.Find(&assetStatuses)

	c.JSON(http.StatusOK, gin.H{
		"material_categories": categories,
		"origins":             origins,
		"brands":              brands,
		"models":              modelsList,
		"variants":            variants,
		"locations":           locations,
		"asset_statuses":      assetStatuses,
	})
}

func UpdateApplication(c *gin.Context) {
	id := c.Param("id")
	var app models.TestingApplication
	if err := database.DB.First(&app, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	if strings.ToUpper(app.Status) != "REVISI" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hanya pengajuan dengan status REVISI yang dapat diubah"})
		return
	}

	username, _ := c.Get("username")
	usernameStr := username.(string)

	// Update fields (simplified for brevity, should include all relevant fields)
	partnerIDStr := c.PostForm("partner_id")
	app.PartnerID, _ = strconv.ParseUint(partnerIDStr, 10, 64)
	// equipment values from path/form
	equipmentName := c.PostForm("equipment_name")
	categoryCode := c.PostForm("category_code")
	brandCode := c.PostForm("brand_code")
	modelCode := c.PostForm("model_code")
	variantCode := c.PostForm("variant_code")
	batchNumber := c.PostForm("batch_number")
	technicalSpec := c.PostForm("technical_spec")

	// Update associated equipment
	var equipment models.TestingEquipment
	if err := database.DB.First(&equipment, app.EquipmentID).Error; err == nil {
		equipment.EquipmentName = html.EscapeString(equipmentName)
		equipment.CategoryCode = categoryCode
		equipment.BrandCode = brandCode
		equipment.ModelCode = modelCode
		equipment.VariantCode = variantCode
		equipment.BatchNumber = html.EscapeString(batchNumber)
		equipment.TechnicalSpec = html.EscapeString(technicalSpec)
		// Asset tracking fields
		equipment.SerialNo = html.EscapeString(c.PostForm("serial_no"))
		equipment.AssetStatusCode = c.PostForm("asset_status_code")
		equipment.AssetLocationCode = c.PostForm("asset_location_code")
		equipment.UpdatedUser = usernameStr
		// Don't save yet, will save once after potential file updates
	}



	// Optional file updates
	if path, err := uploadDoc(c, "request_letter"); err == nil {
		app.RequestLetterPath = path
	}
	if path, err := uploadDoc(c, "factory_spec"); err == nil {
		equipment.FactorySpecPath = path
	}
	if path, err := uploadDoc(c, "quality_doc"); err == nil {
		equipment.QualityDocPath = path
	}

	// Save equipment again if files were updated
	database.DB.Save(&equipment)

	// Update status back to REGISTERED if it was REVISI/REJECTED
	app.Status = "REGISTERED"
	app.UpdatedUser = usernameStr

	// Save application with Omit to prevent redundant equipment updates
	if err := database.DB.Omit(clause.Associations).Save(&app).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update pengajuan: " + err.Error()})
		return
	}

	// Re-assign equipment for audit and response
	app.Equipment = equipment


	// Create Audit
	createAudit(c, app)

	c.Set("process", "UpdateApplication")
	c.JSON(http.StatusOK, app)
}

func CreateApplication(c *gin.Context) {
	username, _ := c.Get("username")
	usernameStr := username.(string)

	// Set custom context for RateLimiter log (Nomor 2 solution)
	c.Set("activity_status", "REGISTERED")

	// 1. Applicant Info (Shared)
	partnerIDStr := c.PostForm("partner_id")
	partnerID, _ := strconv.ParseUint(partnerIDStr, 10, 64)


	// 2. Shared File Uploads
	letterPath, err1 := uploadDoc(c, "request_letter")
	if err1 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Surat Permohonan: " + err1.Error()})
		return
	}

	// 3. Equipment Count
	totalStr := c.PostForm("equipment_total")
	equipmentTotal, _ := strconv.Atoi(totalStr)
	if equipmentTotal <= 0 {
		equipmentTotal = 1
	}

	// 4. Generate ONE Registration Number for the whole batch
	format := database.GetGlobalParam("REG_NUMBER_FORMAT", "MEC-%Y-%05d")
	now := time.Now()
	var currentVal int
	txErr := database.DB.Transaction(func(tx *gorm.DB) error {
		var counter models.RegistrationCounter
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("year = ?", now.Year()).First(&counter).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				counter = models.RegistrationCounter{Year: now.Year(), CurrentVal: 1}
				if createErr := tx.Create(&counter).Error; createErr != nil {
					return createErr
				}
				currentVal = counter.CurrentVal
				return nil
			}
			return err
		}
		counter.CurrentVal += 1
		if saveErr := tx.Save(&counter).Error; saveErr != nil {
			return saveErr
		}
		currentVal = counter.CurrentVal
		return nil
	})
	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan nomor registrasi: " + txErr.Error()})
		return
	}
	regNumber := strings.Replace(format, "%Y", fmt.Sprintf("%d", now.Year()), 1)
	regNumber = strings.Replace(regNumber, "%05d", fmt.Sprintf("%05d", currentVal), 1)

	var createdApps []models.TestingApplication

	// 5. Loop through equipments
	for i := 0; i < equipmentTotal; i++ {
		suffix := ""
		if equipmentTotal > 1 || totalStr != "" {
			suffix = fmt.Sprintf("_%d", i)
		}

		// Read specific equipment fields (supports both single and multi-indexed format)
		eqName := c.PostForm("equipment_name" + suffix)
		if eqName == "" && i == 0 {
			eqName = c.PostForm("equipment_name") // Fallback to non-indexed for single/legacy
		}
		if eqName == "" {
			continue // Skip if no name provided for this index
		}

		catCode := c.PostForm("category_code" + suffix)
		if catCode == "" && i == 0 { catCode = c.PostForm("category_code") }
		brndCode := c.PostForm("brand_code" + suffix)
		if brndCode == "" && i == 0 { brndCode = c.PostForm("brand_code") }
		mdlCode := c.PostForm("model_code" + suffix)
		if mdlCode == "" && i == 0 { mdlCode = c.PostForm("model_code") }
		vrntCode := c.PostForm("variant_code" + suffix)
		if vrntCode == "" && i == 0 { vrntCode = c.PostForm("variant_code") }
		btchNum := c.PostForm("batch_number" + suffix)
		if btchNum == "" && i == 0 { btchNum = c.PostForm("batch_number") }
		tSpec := c.PostForm("technical_spec" + suffix)
		if tSpec == "" && i == 0 { tSpec = c.PostForm("technical_spec") }
		sNo := c.PostForm("serial_no" + suffix)
		if sNo == "" && i == 0 { sNo = c.PostForm("serial_no") }
		statCode := c.PostForm("asset_status_code" + suffix)
		if statCode == "" && i == 0 { statCode = c.PostForm("asset_status_code") }
		locCode := c.PostForm("asset_location_code" + suffix)
		if locCode == "" && i == 0 { locCode = c.PostForm("asset_location_code") }

		// Specific File Uploads
		specPath, _ := uploadDoc(c, "factory_spec"+suffix)
		if specPath == "" && i == 0 { specPath, _ = uploadDoc(c, "factory_spec") }
		qDocPath, _ := uploadDoc(c, "quality_doc"+suffix)
		if qDocPath == "" && i == 0 { qDocPath, _ = uploadDoc(c, "quality_doc") }

		// Create Equipment
		equipment := models.TestingEquipment{
			EquipmentName:   html.EscapeString(eqName),
			CategoryCode:    catCode,
			BrandCode:       brndCode,
			ModelCode:       mdlCode,
			VariantCode:     vrntCode,
			BatchNumber:     html.EscapeString(btchNum),
			TechnicalSpec:   html.EscapeString(tSpec),
			FactorySpecPath: specPath,
			QualityDocPath:  qDocPath,
			SerialNo:        html.EscapeString(sNo),
			AssetStatusCode:   statCode,
			AssetLocationCode: locCode,
			CreatedAt:         now,
			CreatedUser:       usernameStr,
		}

		if err := database.DB.Create(&equipment).Error; err != nil {
			utils.LogError(c.ClientIP(), usernameStr, "CreateEquipment", eqName, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data peralatan: " + err.Error()})
			return
		}

		// Read Package ID if any
		pkgIDStr := c.PostForm("package_id")
		var pkgID *uint
		if pkgIDStr != "" {
			if idVal, err := strconv.ParseUint(pkgIDStr, 10, 32); err == nil {
				uintVal := uint(idVal)
				pkgID = &uintVal
			}
		}

		// Create Application
		app := models.TestingApplication{
			RegNumber:             regNumber,
			Status:                "REGISTERED",
			PartnerID:             partnerID,
			RequestLetterPath:     letterPath,
			EquipmentID:           &equipment.ID,
			PackageID:             pkgID,

			EquipmentNo:           i + 1,
			EquipmentTotal:        equipmentTotal,
			CreatedUser:           usernameStr,
			UpdatedUser:           usernameStr,
		}
		// 5. Save Application (Use Omit to prevent GORM from re-inserting/upserting the already created equipment)
		if err := database.DB.Omit(clause.Associations).Create(&app).Error; err != nil {
			utils.LogError(c.ClientIP(), usernameStr, "CreateApplication", fmt.Sprintf("RegNumber: %s | Index: %d", regNumber, i), err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data pengajuan: " + err.Error()})
			return
		}

		// Update Equipment with ApplicationID for reverse link
		database.DB.Model(&equipment).Update("application_id", app.ID)
		
		// Manually assign equipment back for the response without triggering DB side-effects
		app.Equipment = equipment 
		createAudit(c, app)

		// Auto-Invoice Generation for Packages
		if app.PackageID != nil {
			var pkg models.TestingPackage
			if err := database.DB.First(&pkg, app.PackageID).Error; err == nil {
				invoice := models.Invoice{
					InvoiceNumber: fmt.Sprintf("INV/%s/%d", app.RegNumber, time.Now().Unix()),
					ApplicationID: app.ID,
					TotalAmount:   pkg.BasePrice,
					FinalAmount:   pkg.BasePrice,
					Status:        "UNPAID",
					CreatedAt:     time.Now(),
				}
				database.DB.Create(&invoice)
			}
		}

		// Trigger Camunda for each equipment
		procID, err := services.Camunda.TriggerTestingMilitary(app.ID, app.RegNumber)
		if err == nil {
			database.DB.Model(&app).Omit(clause.Associations).Update("camunda_process_id", procID)
		}
		createdApps = append(createdApps, app)
	}

	c.Set("process", "CreateApplicationBatch")
	c.JSON(http.StatusCreated, createdApps)
}

func GetApplications(c *gin.Context) {
	defaultLimitStr := models.GetGlobalParam("PAGINATION_LIMIT", "10")
	defaultLimit, _ := strconv.Atoi(defaultLimitStr)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", defaultLimitStr))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = defaultLimit
	}
	offset := (page - 1) * limit

	var apps []models.TestingApplication
	var total int64

	// Direct Partition Routing (Strict 1-Month Limit)
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	// Default to current month if dates are missing
	if startDate == "" && endDate == "" {
		now := time.Now()
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local).Format("2006-01-02")
		endDate = now.Format("2006-01-02")
	}

	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both start_date and end_date are required."})
		return
	}

	sTime, errS := time.Parse("2006-01-02", startDate)
	eTime, errE := time.Parse("2006-01-02", endDate)

	if errS != nil || errE != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Validate same month and year to ensure single partition targeting
	if sTime.Year() != eTime.Year() || sTime.Month() != eTime.Month() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query across multiple months is not allowed. Please filter within a single month."})
		return
	}

	sourceTable := "testing_applications"
	targetEqTable := "testing_equipments"
	suffix := sTime.Format("200601")

	// Get threshold from cache (very fast)
	thresholdStr := database.GetGlobalParam("DATA_ARCHIVE_THRESHOLD_MONTHS", "3")
	threshold, _ := strconv.Atoi(thresholdStr)

	// Calculate if archived
	now := time.Now()
	currentMonthSerial := now.Year()*12 + int(now.Month())
	targetMonthSerial := sTime.Year()*12 + int(sTime.Month())

	if (currentMonthSerial - targetMonthSerial) >= threshold {
		sourceTable = fmt.Sprintf("testing_applications_arc_%s", suffix)
		targetEqTable = fmt.Sprintf("testing_equipments_arc_%s", suffix)
	} else {
		// Check if partition exists before routing to it
		schema := os.Getenv("DB_SCHEMA")
		if schema == "" {
			schema = "public"
		}

		potentialTable := fmt.Sprintf("testing_applications_%s", suffix)
		var exists bool
		database.DB.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ? AND table_schema = ?)", potentialTable, schema).Scan(&exists)

		if exists {
			sourceTable = potentialTable
			targetEqTable = fmt.Sprintf("testing_equipments_%s", suffix)
			fmt.Printf("[DIRECT] Routing to specific partition: %s\n", sourceTable)
		} else {
			// If partition missing, we still don't want to hit parent if it's potentially huge
			// But for safety during transitions, we can either error or use parent.
			// The user said "LIMS hanya mengijinkan data dalam 1 partisi", so let's enforce it.
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Data partition for %s not found.", suffix)})
			return
		}
	}

	query := database.DB.Model(&models.TestingApplication{}).Table(sourceTable).
		Preload("Partner").Preload("Partner.Type").Preload("Partner.City").
		Preload("Methodology").Preload("LabMethodology").Preload("FieldMethodology").
		Preload("Package").Preload("Package.Methodologies")

	
	// Filter by Registration Number or Equipment Name
	if q := c.Query("reg_number"); q != "" {
		query = query.Joins(fmt.Sprintf("JOIN %s as teq ON teq.id = %s.equipment_id", targetEqTable, sourceTable)).
			Where(fmt.Sprintf("%s.reg_number ILIKE ? OR teq.equipment_name ILIKE ?", sourceTable), "%"+q+"%", "%"+q+"%")
	}

	// Filter by Partner
	if partnerID := c.Query("partner_id"); partnerID != "" {
		query = query.Where("partner_id = ?", partnerID)
	}

	// Filter by Status
	if status := c.Query("status"); status != "" && strings.ToLower(status) != "all" {
		statusList := strings.Split(status, ",")
		var upperStatusList []string
		for _, s := range statusList {
			upperStatusList = append(upperStatusList, strings.ToUpper(s))
		}
		query = query.Where("UPPER(status) IN ?", upperStatusList)
	}

	// Filter by Period
	if startDate != "" {
		query = query.Where(fmt.Sprintf("%s.created_at >= ?", sourceTable), startDate+" 00:00:00")
	}
	if endDate != "" {
		query = query.Where(fmt.Sprintf("%s.created_at <= ?", sourceTable), endDate+" 23:59:59")
	}

	// Count total records for pagination
	query.Count(&total)

	// Apply pagination and fetch data
	query.Order(fmt.Sprintf("%s.created_at desc", sourceTable)).Offset(offset).Limit(limit).Find(&apps)

	// --- Dynamic Relation Loading (Equipment & Tester Teams) ---
	if len(apps) > 0 {
		applicationIDs := make([]uint64, 0)
		equipmentIDs := make([]uint64, 0)
		for _, app := range apps {
			applicationIDs = append(applicationIDs, app.ID)
			if app.EquipmentID != nil && *app.EquipmentID != 0 {
				equipmentIDs = append(equipmentIDs, *app.EquipmentID)
			}
		}

		// 1. Resolve Equipment
		if len(equipmentIDs) > 0 {
			var equipments []models.TestingEquipment
			// Fetch from target equipment table (could be archive)
			database.DB.Model(&models.TestingEquipment{}).Table(targetEqTable).Preload("Category").Preload("Brand").Preload("Model").Preload("Variant").Preload("Brand.Origin").Where("id IN ?", equipmentIDs).Find(&equipments)
			
			eqMap := make(map[uint64]models.TestingEquipment)
			for _, eq := range equipments {
				eqMap[eq.ID] = eq
			}

			// Fallback check for missing equipment in production parent
			missingEqIDs := make([]uint64, 0)
			for _, id := range equipmentIDs {
				if _, ok := eqMap[id]; !ok {
					missingEqIDs = append(missingEqIDs, id)
				}
			}
			if len(missingEqIDs) > 0 {
				var fallbackEquipments []models.TestingEquipment
				database.DB.Model(&models.TestingEquipment{}).Table("testing_equipments").Preload("Category").Preload("Brand").Preload("Model").Preload("Variant").Preload("Brand.Origin").Where("id IN ?", missingEqIDs).Find(&fallbackEquipments)
				for _, eq := range fallbackEquipments {
					eqMap[eq.ID] = eq
				}
			}

			// Map equipment back to apps
			for i := range apps {
				if apps[i].EquipmentID != nil {
					if eq, ok := eqMap[*apps[i].EquipmentID]; ok {
						apps[i].Equipment = eq
					}
				}
			}
		}

		// 2. Resolve Tester Applications (Teams)
		if len(applicationIDs) > 0 {
			// Determine target tester table (Parent Table Only)
			targetTesterTable := "tester_applications"
			if startDate != "" && endDate != "" {
				sTime, errS := time.Parse("2006-01-02", startDate)
				if errS == nil {
					thresholdStr := database.GetGlobalParam("DATA_ARCHIVE_THRESHOLD_MONTHS", "3")
					threshold, _ := strconv.Atoi(thresholdStr)
					now := time.Now()
					currentMonthSerial := now.Year()*12 + int(now.Month())
					targetMonthSerial := sTime.Year()*12 + int(sTime.Month())
					isArchived := (currentMonthSerial - targetMonthSerial) >= threshold
					if isArchived {
						targetTesterTable = "tester_applications_arc"
					}
				}
			}

			var testers []models.TesterApplication
			database.DB.Table(targetTesterTable).Preload("Tester").Where("application_id IN ?", applicationIDs).Find(&testers)
			
			testerMap := make(map[uint64][]models.TesterApplication)
			for _, t := range testers {
				testerMap[t.ApplicationID] = append(testerMap[t.ApplicationID], t)
			}

			// Map teams back to apps
			for i := range apps {
				if teams, ok := testerMap[apps[i].ID]; ok {
					var filteredLab []models.TesterApplication
					var filteredField []models.TesterApplication
					for _, t := range teams {
						if t.TeamType == "LAB" {
							filteredLab = append(filteredLab, t)
						} else if t.TeamType == "FIELD" {
							filteredField = append(filteredField, t)
						}
					}
					apps[i].LabTeams = filteredLab
					apps[i].FieldTeams = filteredField
				}
			}
		}

		// 3. Resolve Packages (Manually to ensure it works across partitions)
		pkgIDs := make([]uint, 0)
		for _, app := range apps {
			if app.PackageID != nil && *app.PackageID != 0 {
				pkgIDs = append(pkgIDs, *app.PackageID)
			}
		}
		if len(pkgIDs) > 0 {
			var packages []models.TestingPackage
			database.DB.Preload("Methodologies").Where("id IN ?", pkgIDs).Find(&packages)
			pkgMap := make(map[uint]models.TestingPackage)
			for _, p := range packages {
				pkgMap[p.ID] = p
			}
			for i := range apps {
				if apps[i].PackageID != nil {
					if p, ok := pkgMap[*apps[i].PackageID]; ok {
						apps[i].Package = &p
					}
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":         apps,
		"total":        total,
		"page":         page,
		"limit":        limit,
		"source_table": sourceTable, // Explicitly return the table queried for verification
	})
}

func SearchApplicationByReg(c *gin.Context) {
	regNumber := c.Query("reg_number")
	if regNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nomor Registrasi harus diisi"})
		return
	}

	var apps []models.TestingApplication
	sourceTable := "testing_applications"
	
	// 1. Try Production Parent
	query := database.DB.Table("testing_applications").
		Preload("Partner").Preload("Partner.Type").Preload("Partner.City").
		Preload("Equipment").Preload("Equipment.Category").Preload("Equipment.Brand").
		Preload("Equipment.Model").Preload("Equipment.Variant").Preload("Equipment.Brand.Origin").
		Preload("Package").Preload("Package.Methodologies").
		Preload("Invoice").
		Where("reg_number = ?", regNumber).
		Order("id DESC").Limit(100)

	if err := query.Find(&apps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 2. Fallback to Archive if empty
	if len(apps) == 0 {
		fmt.Printf("SearchApplicationByReg: %s not found in production, checking archive...\n", regNumber)
		sourceTable = "testing_applications_arc"
		if err := database.DB.Table("testing_applications_arc").
			Preload("Partner").Preload("Partner.Type").Preload("Partner.City").
			Preload("Equipment").Preload("Equipment.Category").Preload("Equipment.Brand").
			Preload("Equipment.Model").Preload("Equipment.Variant").Preload("Equipment.Brand.Origin").
			Preload("Package").Preload("Package.Methodologies").
			Preload("Invoice").
			Where("reg_number = ?", regNumber).
			Order("id DESC").Limit(100).
			Find(&apps).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	resolvePackageManually(apps)

	c.JSON(http.StatusOK, gin.H{
		"applications": apps,
		"source_table": sourceTable,
	})
}

// Manual Package Resolution Helper (for cross-partition safety)
func resolvePackageManually(apps []models.TestingApplication) {
	if len(apps) == 0 {
		return
	}
	pkgIDs := make([]uint, 0)
	for _, app := range apps {
		if app.PackageID != nil && *app.PackageID != 0 && app.Package == nil {
			pkgIDs = append(pkgIDs, *app.PackageID)
		}
	}
	if len(pkgIDs) > 0 {
		var packages []models.TestingPackage
		database.DB.Preload("Methodologies").Where("id IN ?", pkgIDs).Find(&packages)
		pkgMap := make(map[uint]models.TestingPackage)
		for _, p := range packages {
			pkgMap[p.ID] = p
		}
		for i := range apps {
			if apps[i].PackageID != nil && apps[i].Package == nil {
				if p, ok := pkgMap[*apps[i].PackageID]; ok {
					apps[i].Package = &p
				}
			}
		}
	}
}

func CancelApplication(c *gin.Context) {
	id := c.Param("id")
	var app models.TestingApplication
	if err := database.DB.First(&app, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	if app.Status != "REGISTERED" && app.Status != "REVISI" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hanya pengajuan dengan status REGISTERED atau REVISI yang dapat dibatalkan"})
		return
	}

	database.DB.Model(&app).Update("status", "CANCELED")
	
	// Fetch again to have updated status for audit
	database.DB.First(&app, id)
	createAudit(c, app)

	c.JSON(http.StatusOK, gin.H{"message": "Pengajuan berhasil dibatalkan"})
}

func GetApplication(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var app models.TestingApplication
	
	// 1. Try Production Parent
	query := database.DB.Table("testing_applications").Model(&models.TestingApplication{}).
		Preload("Partner").Preload("Partner.Type").Preload("Partner.City").
		Preload("Methodology").
		Preload("LabMethodology").Preload("FieldMethodology").
		Preload("TesterApplications.Tester").Preload("LabTeams.Tester").Preload("FieldTeams.Tester").
		Preload("Package").Preload("Package.Methodologies").
		Preload("Invoice").Preload("TestingReportAi").Preload("PqcAiAnomaly")

	// Preload relations from production by default
	query = query.Preload("Equipment").Preload("Equipment.Category").Preload("Equipment.Brand").
		Preload("Equipment.Model").Preload("Equipment.Variant").Preload("Equipment.Brand.Origin").
		Preload("Equipment.AssetLocation").Preload("Equipment.AssetStatus")

	if err := query.First(&app, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// 2. Fallback to ARCHIVE Parent
			fmt.Printf("GetApplication: ID %d not found in production, checking archive...\n", id)
			
			// We use Table() explicitly to target archive parent
			if errArc := database.DB.Table("testing_applications_arc").Where("id = ?", id).First(&app).Error; errArc != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Application not found in production or archive"})
				return
			}

			// resolve relations from archives manually for this archived app
			resolveArchivedRelations(&app)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Found in production, also load results/plans
		database.DB.Model(&app).Association("ExecutionResults").Find(&app.ExecutionResults)
		database.DB.Model(&app).Association("AspectScores").Find(&app.AspectScores)
		database.DB.Model(&app).Association("TestingPlans").Find(&app.TestingPlans)

		// Manual Package Resolution if preload failed
		if app.PackageID != nil && *app.PackageID != 0 && app.Package == nil {
			database.DB.Preload("Methodologies").First(&app.Package, *app.PackageID)
		}
	}

	// Manual Cleanup Teams
	var filteredLab []models.TesterApplication
	var filteredField []models.TesterApplication
	for _, t := range app.LabTeams {
		if t.TeamType == "LAB" {
			filteredLab = append(filteredLab, t)
		}
	}
	for _, t := range app.FieldTeams {
		if t.TeamType == "FIELD" {
			filteredField = append(filteredField, t)
		}
	}
	app.LabTeams = filteredLab
	app.FieldTeams = filteredField

	c.JSON(http.StatusOK, app)
}

// resolveArchivedRelations helper to fill in data for archived application
func resolveArchivedRelations(app *models.TestingApplication) {
	// Simple lookup for basic master data (usually not archived)
	database.DB.Preload("Type").Preload("City").First(&app.Partner, app.PartnerID)

	database.DB.Model(app).Association("Methodology").Find(&app.Methodology)
	database.DB.Model(app).Association("LabMethodology").Find(&app.LabMethodology)
	database.DB.Model(app).Association("FieldMethodology").Find(&app.FieldMethodology)

	// Resolve Package
	if app.PackageID != nil {
		var pkg models.TestingPackage
		if err := database.DB.Preload("Methodologies").First(&pkg, *app.PackageID).Error; err == nil {
			app.Package = &pkg
		}
	}

	// Resolve AI Report
	var reportAi models.TestingReportAi
	if err := database.DB.Table("testing_report_ais").Where("application_id = ?", app.ID).First(&reportAi).Error; err == nil {
		app.TestingReportAi = &reportAi
	} else if err := database.DB.Table("testing_report_ais_arc").Where("application_id = ?", app.ID).First(&reportAi).Error; err == nil {
		app.TestingReportAi = &reportAi
	}

	// Resolve PQC AI Anomaly
	var pqcAnomaly models.TestingPqcAiAnomaly
	if err := database.DB.Table("testing_pqc_ai_anomalies").Where("application_id = ?", app.ID).First(&pqcAnomaly).Error; err == nil {
		app.PqcAiAnomaly = &pqcAnomaly
	} else if err := database.DB.Table("testing_pqc_ai_anomalies_arc").Where("application_id = ?", app.ID).First(&pqcAnomaly).Error; err == nil {
		app.PqcAiAnomaly = &pqcAnomaly
	}

	// 1. Resolve Equipment from ARCHIVE
	if app.EquipmentID != nil && *app.EquipmentID != 0 {
		var eq models.TestingEquipment
		// Try archive parent first
		if err := database.DB.Table("testing_equipments_arc").Model(&models.TestingEquipment{}).Preload("Category").Preload("Brand").Preload("Model").Preload("Variant").Preload("Brand.Origin").Preload("AssetLocation").Preload("AssetStatus").Where("id = ?", *app.EquipmentID).First(&eq).Error; err == nil {
			app.Equipment = eq
		} else {
			// Try production parent as fallback
			database.DB.Preload("Category").Preload("Brand").Preload("Model").Preload("Variant").Preload("Brand.Origin").Preload("AssetLocation").Preload("AssetStatus").First(&app.Equipment, *app.EquipmentID)
		}
	}

	// 2. Resolve Teams from ARCHIVE
	database.DB.Table("tester_applications_arc").Preload("Tester").Where("application_id = ?", app.ID).Find(&app.TesterApplications)
	// Split into Lab/Field
	app.LabTeams = []models.TesterApplication{}
	app.FieldTeams = []models.TesterApplication{}
	for _, t := range app.TesterApplications {
		if t.TeamType == "LAB" {
			app.LabTeams = append(app.LabTeams, t)
		} else if t.TeamType == "FIELD" {
			app.FieldTeams = append(app.FieldTeams, t)
		}
	}
	
	if len(app.TesterApplications) == 0 {
		database.DB.Preload("Tester").Where("application_id = ? AND team_type = 'LAB'", app.ID).Find(&app.LabTeams)
		database.DB.Preload("Tester").Where("application_id = ? AND team_type = 'FIELD'", app.ID).Find(&app.FieldTeams)
	}

	// 3. Resolve Results from ARCHIVE
	database.DB.Table("testing_results_arc").Preload("Aspect").Preload("SubAspect").Where("application_id = ?", app.ID).Find(&app.ExecutionResults)
	if len(app.ExecutionResults) == 0 {
		database.DB.Preload("Aspect").Preload("SubAspect").Where("application_id = ?", app.ID).Find(&app.ExecutionResults)
	}

	database.DB.Table("testing_aspect_scores_arc").Where("application_id = ?", app.ID).Find(&app.AspectScores)
	if len(app.AspectScores) == 0 {
		database.DB.Where("application_id = ?", app.ID).Find(&app.AspectScores)
	}

	// 4. Resolve Plans from ARCHIVE
	database.DB.Table("testing_plans_arc").Preload("Aspect").Preload("Location").Where("application_id = ?", app.ID).Find(&app.TestingPlans)
	if len(app.TestingPlans) == 0 {
		database.DB.Preload("Aspect").Preload("Location").Where("application_id = ?", app.ID).Find(&app.TestingPlans)
	}
}

// Stage Specific Updates

func VerifyApplication(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status             string     `json:"status"`
		IsDocsComplete     bool       `json:"is_docs_complete"`
		VerificationNotes  string     `json:"verification_notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	fmt.Printf("Verify Application ID: %s, User: %v, Body: %+v\n", id, username, req)
	
	var app models.TestingApplication
	if err := database.DB.First(&app, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	app.Status = req.Status
	app.IsDocsComplete = req.IsDocsComplete
	app.VerificationNotes = req.VerificationNotes
	app.UpdatedUser = username.(string)

	err := database.DB.Save(&app).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update verification data: " + err.Error()})
		return
	}

	// Create Audit
	createAudit(c, app)


	// Log transaction
	c.Set("process", "VerifyApplication")

	c.JSON(http.StatusOK, gin.H{"message": "Verification completed"})
}

func ApproveApplication(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status        string `json:"status"`
		ApprovalNotes string `json:"approval_notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	
	var app models.TestingApplication
	if err := database.DB.First(&app, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	}

	app.Status = req.Status
	app.ApprovalNotes = req.ApprovalNotes
	app.UpdatedUser = username.(string)

	err := database.DB.Save(&app).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update approval data: " + err.Error()})
		return
	}

	// Create Audit
	createAudit(c, app)


	c.JSON(http.StatusOK, gin.H{"message": "Persetujuan pimpinan berhasil disimpan"})
}

func PlanApplication(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status               string     `json:"status"`
		MethodologyCode      string     `json:"methodology_code"`
		LabMethodologyCode   string     `json:"lab_methodology_code"`
		FieldMethodologyCode string     `json:"field_methodology_code"`
		LabTeamJSON          string     `json:"lab_team_json"`
		FieldTeamJSON        string     `json:"field_team_json"`
		TestPlanDocPath      string     `json:"test_plan_doc_path"`
		RelationalPlans      interface{} `json:"relational_plans"` // Capturing incoming plans to save to relational tables
		TestingTools         []struct {
			ToolCode  string `json:"tool_code"`
			StartHour int    `json:"start_hour"`
			EndHour   int    `json:"end_hour"`
			Quantity  int    `json:"quantity"`
			Date      string `json:"date"`
		} `json:"testing_tools"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	fmt.Printf("PlanApplication req: %+v\n", req)

	// --- 1. Update fields di testing_applications ---
	updates := map[string]interface{}{
		"status":             req.Status,
		"test_plan_doc_path": req.TestPlanDocPath,
		"updated_user":       username.(string),
	}
	if req.MethodologyCode != "" {
		updates["methodology_code"] = req.MethodologyCode
	}
	if req.LabMethodologyCode != "" {
		updates["lab_methodology_code"] = req.LabMethodologyCode
	}
	if req.FieldMethodologyCode != "" {
		updates["field_methodology_code"] = req.FieldMethodologyCode
	}
	if err := database.DB.Model(&models.TestingApplication{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update application: " + err.Error()})
		return
	}
	
	var app models.TestingApplication
	database.DB.Preload("Equipment").First(&app, id)

	// Create Audit
	createAudit(c, app)

	// --- 2. Simpan tim ke tabel application_teams (delete + re-insert) ---
	type TeamMember struct {
		Name string `json:"name"`
		Role string `json:"role"`
		Rank string `json:"rank"`
	}

	appID, _ := strconv.ParseUint(id, 10, 64)

	saveTeam := func(jsonStr string, teamType string, methodologyCode *string) error {
		// Hapus data tim lama untuk tipe ini
		database.DB.Where("application_id = ? AND team_type = ?", appID, teamType).
			Delete(&models.TesterApplication{})

		fmt.Printf("DEBUG: saveTeam %s input: %s\n", teamType, jsonStr)

		if jsonStr == "" || jsonStr == "[]" {
			return nil
		}
		type TeamMemberInput struct {
			TesterID string `json:"tester_id"`
			Position string `json:"position"`
		}
		var members []TeamMemberInput
		if err := json.Unmarshal([]byte(jsonStr), &members); err != nil {
			fmt.Printf("DEBUG: saveTeam %s JSON unmarshal error: %v\n", teamType, err)
			return fmt.Errorf("invalid %s team JSON: %s", teamType, err.Error())
		}
		for _, m := range members {
			if m.TesterID == "" {
				continue
			}
			mCode := ""
			if methodologyCode != nil {
				mCode = *methodologyCode
			}
			
			// Pad TesterID to 5 chars to match database char(5) and foreign key
			paddedTesterID := fmt.Sprintf("%-5s", m.TesterID)
			
			row := models.TesterApplication{
				ApplicationID:   appID,
				MethodologyCode: mCode,
				TesterID:        paddedTesterID,
				Position:        m.Position,
				TeamType:        teamType,
				CreatedAt:       time.Now(),
				CreatedUser:     username.(string),
			}
			if err := database.DB.Create(&row).Error; err != nil {
				fmt.Printf("DEBUG: saveTeam %s DB Create error for TesterID %s: %v\n", teamType, paddedTesterID, err)
				return err
			}
		}
		return nil
	}

	if err := saveTeam(req.LabTeamJSON, "LAB", app.LabMethodologyCode); err != nil {
		fmt.Printf("DEBUG: PlanApplication Error in saveTeam LAB: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := saveTeam(req.FieldTeamJSON, "FIELD", app.FieldMethodologyCode); err != nil {
		fmt.Printf("DEBUG: PlanApplication Error in saveTeam FIELD: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// --- 3. Save per-aspect plans to testing_plans table ---
	if req.RelationalPlans != nil {
		fmt.Printf("DEBUG: Saving TestingPlans for app %d\n", app.ID)
		var plans []struct {
			AspectCode    string `json:"aspect_code"`
			Type          string `json:"type"` // LAB or FIELD
			LocationCode  string `json:"location_code"`
			ScheduledDate string `json:"scheduled_date"`
			Team          []struct {
				TesterID string `json:"tester_id"`
				Name     string `json:"name"`
				Position string `json:"position"`
			} `json:"team"`
		}

		b, _ := json.Marshal(req.RelationalPlans)
		json.Unmarshal(b, &plans)

		database.DB.Where("application_id = ?", app.ID).Delete(&models.TestingPlan{})
		// Delete only aspect-specific team members to keep global teams if needed, 
		// but usually planning replaces everything.
		database.DB.Where("application_id = ? AND aspect_code != ''", app.ID).Delete(&models.TesterApplication{})

		for _, p := range plans {
			if p.AspectCode == "" { continue }
			var t *time.Time
			if p.ScheduledDate != "" {
				parsed, err := time.Parse("2006-01-02", p.ScheduledDate)
				if err == nil { t = &parsed }
			}
			
			// Dynamic Double Lookup: Get methodology and test type from the master data
			var aspect models.ScoringAspect
			database.DB.Preload("Methodology").Where("code = ?", p.AspectCode).First(&aspect)
			methodologyCode := aspect.MethodologyCode
			teamType := aspect.Methodology.TestTypeCode // e.g., LAB or FIELD mapped at methodology level

			for _, m := range p.Team {
				// Save each team member relationally (1 person per row)
				if m.TesterID != "" {
					paddedID := fmt.Sprintf("%-5s", m.TesterID)
					
					row := models.TesterApplication{
						ApplicationID:   app.ID,
						AspectCode:      p.AspectCode,
						MethodologyCode: methodologyCode,
						TesterID:        paddedID,
						Position:        m.Position,
						TeamType:        teamType, // Dynamic from methodology master
						CreatedAt:       time.Now(),
						CreatedUser:     username.(string),
					}
					if err := database.DB.Create(&row).Error; err != nil {
						fmt.Printf("ERROR saving team member %s: %v\n", m.Name, err)
					} else {
						fmt.Printf("DEBUG: Saved team member %s for aspect %s with methodology %s (%s)\n", m.Name, p.AspectCode, methodologyCode, teamType)
					}
				}
			}

			tp := models.TestingPlan{
				ApplicationID: app.ID,
				AspectCode:    p.AspectCode,
				ScheduledDate: t,
				UpdatedUser:   username.(string),
				CreatedAt:     time.Now(),
			}
			if p.LocationCode != "" {
				tp.LocationCode = p.LocationCode
			}
			database.DB.Create(&tp)
		}
	}

	// --- 4. Save Testing Tool Reservations ---
	if len(req.TestingTools) > 0 {
		var user models.User
		database.DB.Where("username = ?", username.(string)).First(&user)

		for _, tReq := range req.TestingTools {
			var tool models.TestingTool
			if err := database.DB.Where("code = ?", tReq.ToolCode).First(&tool).Error; err != nil {
				continue
			}

			// Validate and Update Stock for STOCK type tools
			if tool.Type == "STOCK" {
				if tool.CurrentStock-tReq.Quantity < 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Stok alat %s tidak mencukupi (Sisa: %d)", tool.Name, tool.CurrentStock)})
					return
				}
				// Decrease current stock
				stockBefore := tool.CurrentStock
				tool.CurrentStock -= tReq.Quantity
				stockAfter := tool.CurrentStock
				database.DB.Model(&tool).Update("current_stock", stockAfter)

				// Log Transaction (Partitioned)
				tableName := "testing_tool_transactions_" + time.Now().Format("200601")
				database.DB.Table(tableName).Create(&models.TestingToolTransaction{
					ToolCode:      tool.Code,
					Type:          "OUT",
					Quantity:      tReq.Quantity,
					ReferenceType: "PLANNING",
					ReferenceID:   uint(appID),
					StockBefore:   stockBefore,
					StockAfter:    stockAfter,
					Notes:         fmt.Sprintf("Keluar untuk rencana uji aplikasi ID: %d", appID),
					CreatedAt:     time.Now(),
				})
			}

			date, _ := time.Parse("2006-01-02", tReq.Date)

			avTableName := "testing_tool_availabilities_" + date.Format("200601")
			resTableName := "testing_tool_reservations_" + date.Format("200601")

			// Check for conflicts (Only for USAGE type as STOCK can be shared by quantity)
			if tool.Type == "USAGE" {
				for h := tReq.StartHour; h < tReq.EndHour; h++ {
					var existing models.TestingToolAvailability
					var err error
					if err = database.DB.Table(avTableName).Where("tool_code = ? AND date = ? AND hour = ?", tReq.ToolCode, date, h).First(&existing).Error; err != nil {
						// Fallback to parent table if partition doesn't exist
						err = database.DB.Where("tool_code = ? AND date = ? AND hour = ?", tReq.ToolCode, date, h).First(&existing).Error
					}
					if err == nil {
						c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("Alat %s sudah di-book pada jam %02d:00.", tool.Name, h)})
						return
					}
				}
			}

			// Create availability/usage records (Only for USAGE type)
			if tool.Type == "USAGE" {
				for h := tReq.StartHour; h < tReq.EndHour; h++ {
					av := models.TestingToolAvailability{
						ToolCode:  tReq.ToolCode,
						Date:      date,
						Hour:      h,
						Status:    "BOOKED",
						BookedBy:  user.ID,
						Quantity:  tReq.Quantity,
						CreatedAt: date, // Align with partition range constraint
					}
					if err := database.DB.Table(avTableName).Create(&av).Error; err != nil {
						// Fallback to parent table
						database.DB.Create(&av)
					}
				}
			}

			// Create reservation record
			startTime := time.Date(date.Year(), date.Month(), date.Day(), tReq.StartHour, 0, 0, 0, time.Local)
			endTime := time.Date(date.Year(), date.Month(), date.Day(), tReq.EndHour, 0, 0, 0, time.Local)

			res := models.TestingToolReservation{
				ToolCode:      tReq.ToolCode,
				UserID:        user.ID,
				ApplicationID: app.ID,
				StartTime:     startTime,
				EndTime:       endTime,
				Quantity:      tReq.Quantity,
				Status:        "BOOKED",
				CreatedAt:     startTime, // Align with partition range constraint
			}
			if err := database.DB.Table(resTableName).Create(&res).Error; err != nil {
				// Fallback to parent table
				database.DB.Create(&res)
			}
		}
	}

	// --- 5. Notifikasi & log ---

	c.Set("process", "PlanApplication")
	c.JSON(http.StatusOK, gin.H{"message": "Planning completed"})
}

func GetExecution(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var app models.TestingApplication
	
	isArchived := false
	if err := database.DB.First(&app, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Try archive parent
			if errArc := database.DB.Table("testing_applications_arc").Where("id = ?", id).First(&app).Error; errArc != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Application not found in production or archive"})
				return
			}
			isArchived = true
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	type ExecutionItem struct {
		ParameterName    string  `json:"parameter_name"`
		ParamCode        string  `json:"param_code"`
		AspectName       string  `json:"aspect_name"`
		AspectCode       string  `json:"aspect_code"`
		AspectWeight     float64 `json:"aspect_weight"`
		MethodName       string  `json:"method_name"`
		TestTypeCode     string  `json:"test_type_code"`
		Unit             string  `json:"unit"`
		Weight           float64 `json:"weight"`
		ActualValue      string  `json:"actual_value"`
		Notes            string  `json:"notes"`
		PhotoPath        string  `json:"photo_path"`
		IsSimulator      bool    `json:"is_simulator"`
		SimulatorLogID   *uint   `json:"simulator_log_id"`
		SimulatorMachine string  `json:"simulator_machine"`
		StandardValue    float64 `json:"standard_value"`
		StandardValueMax float64 `json:"standard_value_max"`
		StandardOperator string  `json:"standard_operator"`
		StandardUnit     string  `json:"standard_unit"`
		PercentResult    string  `json:"percent_result"`
		Keterangan       string  `json:"keterangan"`
	}

	var results []ExecutionItem

	// 1. Ambil semua rencana aspek pengujian
	var plans []models.TestingPlan
	plansTable := "testing_plans"
	if isArchived {
		plansTable = "testing_plans_arc"
	}
	
	database.DB.Table(plansTable).Preload("Aspect.Methodology").Preload("Aspect.TestType").
		Where("application_id = ?", app.ID).
		Find(&plans)

	// Jika tidak ada plan sama sekali (misal status masih Registered/Verified), 
	// gunakan fallback ke metodologi jika ada (untuk template awal)
	if len(plans) == 0 {
		var aspects []models.ScoringAspect
		if app.LabMethodologyCode != nil {
			var labAspects []models.ScoringAspect
			database.DB.Preload("Methodology").Where("methodology_code = ?", *app.LabMethodologyCode).Find(&labAspects)
			aspects = append(aspects, labAspects...)
		}
		if app.FieldMethodologyCode != nil {
			var fieldAspects []models.ScoringAspect
			database.DB.Preload("Methodology").Where("methodology_code = ?", *app.FieldMethodologyCode).Find(&fieldAspects)
			aspects = append(aspects, fieldAspects...)
		}

		// Filter template aspects by package active configuration if exists (Option B)
		if app.PackageID != nil && *app.PackageID != 0 {
			var activeAspectCodes []string
			database.DB.Table("package_active_aspects").
				Where("package_id = ?", *app.PackageID).
				Pluck("aspect_code", &activeAspectCodes)

			if len(activeAspectCodes) > 0 {
				var filtered []models.ScoringAspect
				activeMap := make(map[string]bool)
				for _, c := range activeAspectCodes {
					activeMap[c] = true
				}
				for _, a := range aspects {
					if activeMap[a.Code] {
						filtered = append(filtered, a)
					}
				}
				aspects = filtered
			}
		}

		// Convert to plans for matching loop below
		for _, a := range aspects {
			plans = append(plans, models.TestingPlan{Aspect: a, AspectCode: a.Code})
		}
	}

	// 2. Ambil hasil yang sudah ada
	var existingResults []models.TestingResult
	resultsTable := "testing_results"
	if isArchived {
		resultsTable = "testing_results_arc"
	}
	database.DB.Table(resultsTable).Where("application_id = ?", app.ID).Find(&existingResults)
	
	resultsMap := make(map[string]models.TestingResult)
	for _, er := range existingResults {
		if er.SubAspectCode != nil {
			resultsMap[*er.SubAspectCode] = er
		}
	}

	// 3. Iterasi setiap aspek dalam rencana untuk mengambil sub-aspect (parameter)
	for _, p := range plans {
		asp := p.Aspect
		var subAspects []models.ScoringSubAspect
		database.DB.Where("aspect_code = ?", asp.Code).Find(&subAspects)

		// Filter template sub-aspects by package active configuration if exists (Option B)
		if app.PackageID != nil && *app.PackageID != 0 {
			var activeSubCodes []string
			database.DB.Table("package_active_sub_aspects").
				Where("package_id = ?", *app.PackageID).
				Pluck("sub_aspect_code", &activeSubCodes)

			if len(activeSubCodes) > 0 {
				var filtered []models.ScoringSubAspect
				activeMap := make(map[string]bool)
				for _, c := range activeSubCodes {
					activeMap[c] = true
				}
				for _, sa := range subAspects {
					if activeMap[sa.Code] {
						filtered = append(filtered, sa)
					}
				}
				subAspects = filtered
			}
		}

		for _, sub := range subAspects {
			er, exists := resultsMap[sub.Code]

			testTypeCode := ""
			if asp.TestTypeCode != nil {
				testTypeCode = *asp.TestTypeCode
			} else if asp.Methodology.TestTypeCode != "" {
				testTypeCode = asp.Methodology.TestTypeCode
			}

			item := ExecutionItem{
				ParameterName:    sub.Name,
				ParamCode:        sub.Code,
				AspectName:       asp.Name,
				AspectCode:       asp.Code,
				AspectWeight:     asp.Weight,
				MethodName:       asp.Methodology.Name,
				TestTypeCode:     testTypeCode,
				Unit:             sub.StandardUnit,
				Weight:           sub.Weight,
				ActualValue:      "",
				Notes:            "",
				PhotoPath:        "",
				IsSimulator:      sub.IsSimulator,
				SimulatorLogID:   nil,
				SimulatorMachine: "",
				StandardValue:    sub.StandardValue,
				StandardValueMax: sub.StandardValueMax,
				StandardOperator: sub.StandardOperator,
				StandardUnit:     sub.StandardUnit,
				PercentResult:    "-",
				Keterangan:       "-",
			}
			if exists {
				item.ActualValue = fmt.Sprintf("%v", er.Score)
				item.Notes = er.Notes
				item.PhotoPath = er.PhotoPath
			}

			// Simulator integration (usually not needed for reprinted archives)
			if sub.IsSimulator && !exists && !isArchived {
				var simLog models.SimulatorDataLog
				if err := database.DB.
					Where("sub_aspect_code = ? AND is_used = false AND (application_id = ? OR application_id = 0)", sub.Code, app.ID).
					Order("created_at DESC").
					First(&simLog).Error; err == nil {
					item.ActualValue = fmt.Sprintf("%v", simLog.Score)
					item.Notes = simLog.Notes
					item.SimulatorLogID = &simLog.ID
					item.SimulatorMachine = simLog.MachineID
				}
			}

			// Calculate % Hasil & Keterangan if actual value is present and standard is defined
			if item.ActualValue != "" {
				actualVal, err := strconv.ParseFloat(item.ActualValue, 64)
				if err == nil {
					hasStandard := sub.StandardValue != 0 || sub.StandardValueMax != 0 || sub.StandardUnit != ""
					if hasStandard {
						isPassed := false
						percentStr := "-"

						switch strings.TrimSpace(strings.ToLower(sub.StandardOperator)) {
						case "range":
							isPassed = actualVal >= sub.StandardValue && actualVal <= sub.StandardValueMax
							percentStr = "-"
						case "<=":
							isPassed = actualVal <= sub.StandardValue
							if actualVal > 0 {
								percentStr = fmt.Sprintf("%.1f%%", (sub.StandardValue/actualVal)*100)
							} else {
								percentStr = "100.0%"
							}
						case "<":
							isPassed = actualVal < sub.StandardValue
							if actualVal > 0 {
								percentStr = fmt.Sprintf("%.1f%%", (sub.StandardValue/actualVal)*100)
							} else {
								percentStr = "100.0%"
							}
						case ">":
							isPassed = actualVal > sub.StandardValue
							if sub.StandardValue > 0 {
								percentStr = fmt.Sprintf("%.1f%%", (actualVal/sub.StandardValue)*100)
							}
						case "=":
							isPassed = actualVal == sub.StandardValue
							if sub.StandardValue > 0 {
								percentStr = fmt.Sprintf("%.1f%%", (actualVal/sub.StandardValue)*100)
							}
						default: // default is >=
							isPassed = actualVal >= sub.StandardValue
							if sub.StandardValue > 0 {
								percentStr = fmt.Sprintf("%.1f%%", (actualVal/sub.StandardValue)*100)
							}
						}

						if isPassed {
							item.Keterangan = "Memenuhi"
						} else {
							item.Keterangan = "Tidak Memenuhi"
						}
						item.PercentResult = percentStr
					}
				}
			}

			results = append(results, item)
		}
	}

	c.JSON(http.StatusOK, results)
}

func ExecuteApplication(c *gin.Context) {
	id := c.Param("id")

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		fmt.Printf("Error parsing multipart form: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form: " + err.Error()})
		return
	}

	status := c.PostForm("status")
	resultsStr := c.PostForm("results")
	fmt.Printf("ExecuteApplication: ID=%s, Status=%s, ResultsLength=%d\n", id, status, len(resultsStr))

	type ResultItem struct {
		ParamCode     string  `json:"param_code"`
		SubAspectCode string  `json:"sub_aspect_code"`
		Score         float64 `json:"score"`
		Notes         string  `json:"notes"`
		IsDisabled    bool    `json:"is_disabled"`
	}
	var results []ResultItem
	if resultsStr != "" {
		if err := json.Unmarshal([]byte(resultsStr), &results); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid results JSON format"})
			return
		}
	}

	username, _ := c.Get("username")
	tx := database.DB.Begin()
	// Update App
	updateData := map[string]interface{}{
		"status":       status,
		"updated_user": username.(string),
	}

	err := tx.Model(&models.TestingApplication{}).Where("id = ?", id).Updates(updateData).Error
	if err != nil {
		fmt.Printf("Error updating application: %v\n", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update app: " + err.Error()})
		return
	}

	// Delete old results
	if err := tx.Where("application_id = ?", id).Delete(&models.TestingResult{}).Error; err != nil {
		fmt.Printf("Error deleting old results: %v\n", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear old results: " + err.Error()})
		return
	}

	// Insert new results
	appIDInt, _ := strconv.ParseUint(id, 10, 64)
	form, _ := c.MultipartForm()

	// Pre-fetch ONLY relevant scoring sub-aspects to map AspectCode (Optimized)
	var subCodes []string
	for _, r := range results {
		code := r.ParamCode
		if code == "" { code = r.SubAspectCode }
		if code != "" { subCodes = append(subCodes, code) }
	}
	
	var allSubAspects []models.ScoringSubAspect
	if len(subCodes) > 0 {
		database.DB.Where("code IN ?", subCodes).Find(&allSubAspects)
	}
	
	subAspectMap := make(map[string]models.ScoringSubAspect)
	for _, sa := range allSubAspects {
		subAspectMap[sa.Code] = sa
	}

	for _, r := range results {
		var photoPath string

		subCode := r.ParamCode
		if subCode == "" {
			subCode = r.SubAspectCode
		}

		if form != nil {
			// Backwards compatibility for photo_ prefix
			files := form.File["photo_"+subCode]
			if len(files) == 0 {
				// Also check for sub_aspect_ prefix
				files = form.File["sub_aspect_"+subCode+"_file"]
			}
			
			if len(files) > 0 {
				file := files[0]
				f, err := file.Open()
				if err == nil {
					contentType := file.Header.Get("Content-Type")
					if contentType == "" {
						contentType = "application/octet-stream"
					}

					// 1. Size Restriction
					maxSizeStr := os.Getenv("MAX_UPLOAD_SIZE")
					if maxSizeStr == "" {
						maxSizeStr = "2048"
					}
					maxSizeKB, _ := strconv.ParseInt(maxSizeStr, 10, 64)
					if file.Size > maxSizeKB*1024 {
						fmt.Printf("File too large: %s (%d bytes)\n", file.Filename, file.Size)
						f.Close()
						continue // Skip this too large file or handle accordingly
					}

					// 2. Unique Filename
					ext := filepath.Ext(file.Filename)
					baseName := strings.TrimSuffix(file.Filename, ext)
					timestamp := time.Now().Format("150405.000") // HHMMSS.ms
					timestamp = strings.ReplaceAll(timestamp, ".", "")
					uniqueName := fmt.Sprintf("%s_%s%s", baseName, timestamp, ext)

					photoPath, _ = services.Minio.UploadGenericFile(c.Request.Context(), uniqueName, f, file.Size, contentType)
					f.Close()
				}
			}
		}

		// Map codes for hierarchical scoring v2.0
		var aspectCode string
		if sa, ok := subAspectMap[subCode]; ok {
			aspectCode = sa.AspectCode
		}

		// Sanitasi HTML pada kolom Notes untuk mencegah Stored XSS
		// saat data dirender di halaman Print Preview atau output HTML lainnya.
		sanitizedNotes := html.EscapeString(r.Notes)

		res := models.TestingResult{
			ApplicationID:        appIDInt,
			AspectCode:           aspectCode,
			SubAspectCode:        &subCode,
			Score:                r.Score,
			Notes:                sanitizedNotes,
			PhotoPath:            photoPath,
			IsDisabled:           r.IsDisabled,
			CreatedAt:            time.Now(),
		}
		if err := tx.Create(&res).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save results for " + subCode})
			return
		}
	}
	if err := tx.Commit().Error; err != nil {
		fmt.Printf("Error committing transaction: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction: " + err.Error()})
		return
	}
	fmt.Printf("Transaction committed successfully for ID=%s\n", id)

	appIDUint, _ := strconv.ParseUint(id, 10, 64)

	// Mark simulator log entries as used
	simLogIDsStr := c.PostForm("simulator_log_ids")
	if simLogIDsStr != "" {
		var simLogIDs []uint
		if err := json.Unmarshal([]byte(simLogIDsStr), &simLogIDs); err == nil && len(simLogIDs) > 0 {
			database.DB.Model(&models.SimulatorDataLog{}).
				Where("id IN ?", simLogIDs).
				Updates(map[string]interface{}{
					"is_used":               true,
					"used_by_application_id": appIDUint,
				})
		}
	}

	// Fetch app data
	var app models.TestingApplication
	database.DB.Preload("Equipment").First(&app, id)

	// Create Audit
	createAudit(c, app)


	c.Set("process", "ExecuteApplication")
	
	// Recalculate and generate final conclusion immediately after execution is finished.
	// Clear the aspect scores cache to ensure full recalculation from new sub-aspect values.
	database.DB.Exec("DELETE FROM testing_aspect_scores WHERE application_id = ?", appIDUint)
	scoringResult, _ := services.RefreshApplicationScoring(appIDUint)
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Execution results updated",
		"final_score": scoringResult.FinalScore,
		"final_status": scoringResult.Status,
	})
}

func AnalyzeApplication(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status        string  `json:"status"`
		FinalScore    float64 `json:"final_score"`
		AnalysisNotes string  `json:"analysis_notes"`
		FinalStatus   string  `json:"final_status"`
		ReportAi      string  `json:"report_ai"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	uintID, _ := strconv.ParseUint(id, 10, 64)
	
	// Recalculate scoring to get the correct narrative label (e.g. Lulus Sedang)
	scoringResult, err := services.RefreshApplicationScoring(uintID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate scoring: " + err.Error()})
		return
	}

	actualStatus := scoringResult.Status
	// If the front-end explicitly passed an OVERRIDE status, respect it!
	if strings.HasPrefix(req.FinalStatus, "OVERRIDE") {
		actualStatus = req.FinalStatus
	}

	username, _ := c.Get("username")
	err = database.DB.Model(&models.TestingApplication{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":         req.Status,
		"final_score":    scoringResult.FinalScore,
		"analysis_notes": req.AnalysisNotes,
		"final_status":   actualStatus,
		"updated_user":   username.(string),
	}).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update analysis data: " + err.Error()})
		return
	}

	if req.ReportAi != "" {
		var report models.TestingReportAi
		if err := database.DB.Where("application_id = ?", uintID).First(&report).Error; err != nil {
			report = models.TestingReportAi{
				ApplicationID: uintID,
				ReportAi:      req.ReportAi,
				CreatedAt:     time.Now(),
				CreatedUser:   username.(string),
			}
			database.DB.Create(&report)
		} else {
			report.ReportAi = req.ReportAi
			report.UpdatedAt = time.Now()
			report.UpdatedUser = username.(string)
			database.DB.Save(&report)
		}
	}

	// Fetch app data
	var app models.TestingApplication
	database.DB.Preload("Equipment").First(&app, id)

	// Create Audit
	createAudit(c, app)

	if req.Status == "Analyzed" {
		certUpdates := map[string]interface{}{}
		
		if app.CertificateNum == "" {
			format := database.GetGlobalParam("CERT_NUMBER_FORMAT", "CERT/MEC/%Y/%05d")
			now := time.Now()
			
			var count int64
			database.DB.Model(&models.TestingApplication{}).Where("status IN ('Analyzed', 'Reporting', 'Certified', 'Closed') AND EXTRACT(YEAR FROM created_at) = ?", now.Year()).Count(&count)
			
			certNum := strings.Replace(format, "%Y", fmt.Sprintf("%d", now.Year()), 1)
			certNum = strings.Replace(certNum, "%05d", fmt.Sprintf("%05d", count+1), 1)
			certUpdates["certificate_num"] = certNum
		}
		
		if app.ExpiryDate == nil {
			validityStr := database.GetGlobalParam("CERT_VALIDITY_DAYS", "720")
			validityDays, err := strconv.Atoi(validityStr)
			if err != nil || validityDays == 0 {
				validityDays = 720
			}
			expiryDate := time.Now().AddDate(0, 0, validityDays)
			certUpdates["expiry_date"] = expiryDate
		}
		
		if len(certUpdates) > 0 {
			database.DB.Model(&models.TestingApplication{}).Where("id = ?", id).Updates(certUpdates)
		}

	}

	c.Set("process", "AnalyzeApplication")
	c.JSON(http.StatusOK, gin.H{"message": "Analysis completed"})
}

func RevisionApplication(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Notes string `json:"notes" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Catatan revisi wajib diisi"})
		return
	}

	var app models.TestingApplication
	if err := database.DB.Preload("Equipment").First(&app, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengajuan tidak ditemukan"})
		return
	}

	usernameVal, _ := c.Get("username")
	username := usernameVal.(string)

	// Update status, analysis_notes, and updated_user
	err := database.DB.Model(&app).Updates(map[string]interface{}{
		"status":         "Planned",
		"analysis_notes": req.Notes,
		"updated_user":   username,
	}).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan revisi: " + err.Error()})
		return
	}

	// Update struct for audit
	app.Status = "Planned"
	app.UpdatedUser = username
	createAudit(c, app)

	// --- Send Email to executors ---
	subject := fmt.Sprintf("Revisi Analisa Pengujian - %s", app.RegNumber)
	message := fmt.Sprintf("Terdapat permintaan revisi untuk pengujian dengan Nomor Registrasi %s.\n\nCatatan Revisi dari Analis:\n\"%s\"\n\nSilakan lakukan pengujian ulang atau koordinasikan dengan tim analis.", app.RegNumber, req.Notes)

	// 1. Email all users with role "OPERATOR_TEST" (Pelaksana Uji)
	services.SendEmailToRole("OPERATOR_TEST", subject, message)

	// 2. Email specifically assigned testers (if they have accounts matching username or name)
	var testers []models.TesterApplication
	database.DB.Preload("Tester").Where("application_id = ?", app.ID).Find(&testers)
	for _, t := range testers {
		var u models.User
		if err := database.DB.Where("username = ? OR username = ?", t.Tester.Name, t.Tester.TesterID).First(&u).Error; err == nil && u.Email != "" {
			services.SendEmailToAddress(u.Email, subject, message)
		}
	}

	c.Set("process", "RevisionApplication")
	c.JSON(http.StatusOK, gin.H{"message": "Revisi berhasil disimpan dan notifikasi email telah dikirim"})
}


func FinalizeApplication(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status          string     `json:"status"`
		CertificateNum  string     `json:"certificate_num"`
		ExpiryDate      *time.Time `json:"expiry_date"`
		ReportDocPath   string     `json:"report_doc_path"`
		CertificatePath string     `json:"certificate_path"`
		FinalStatus     string     `json:"final_status"`
		Notes           string     `json:"notes"`
		ReportAi        string     `json:"report_ai"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	username, _ := c.Get("username")
	updates := map[string]interface{}{
		"status":           req.Status,
		"certificate_num":  req.CertificateNum,
		"expiry_date":      req.ExpiryDate,
		"report_doc_path":  req.ReportDocPath,
		"certificate_path": req.CertificatePath,
		"updated_user":     username.(string),
	}

	if req.FinalStatus != "" {
		updates["final_status"] = req.FinalStatus
	}
	if req.Notes != "" {
		updates["analysis_notes"] = req.Notes
	}

	err := database.DB.Model(&models.TestingApplication{}).Where("id = ?", id).Updates(updates).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update application: " + err.Error()})
		return
	}

	uintID, _ := strconv.ParseUint(id, 10, 64)
	if req.ReportAi != "" {
		var report models.TestingReportAi
		if err := database.DB.Where("application_id = ?", uintID).First(&report).Error; err != nil {
			report = models.TestingReportAi{
				ApplicationID: uintID,
				ReportAi:      req.ReportAi,
				CreatedAt:     time.Now(),
				CreatedUser:   username.(string),
			}
			database.DB.Create(&report)
		} else {
			report.ReportAi = req.ReportAi
			report.UpdatedAt = time.Now()
			report.UpdatedUser = username.(string)
			database.DB.Save(&report)
		}
	}

	c.Set("process", "FinalizeApplication")

	// Create Notification for Operator (Applicant)
	var app models.TestingApplication
	database.DB.Preload("Equipment").First(&app, id)

	// Create Audit
	createAudit(c, app)


	c.JSON(http.StatusOK, gin.H{"message": "Final recommendation issued"})
}


// GetApplicationAuditHistory retrieves audit trail untuk aplikasi tertentu
func GetApplicationAuditHistory(c *gin.Context) {
	id := c.Param("id")
	
	var audits []models.TestingApplicationAudit
	
	// 1. Try production parent
	if err := database.DB.Where("application_id = ?", id).Order("created_at DESC").Find(&audits).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit history: " + err.Error()})
		return
	}

	// 2. If empty, try archive parent
	if len(audits) == 0 {
		fmt.Printf("GetApplicationAuditHistory: ID %s not found in production, checking archive...\n", id)
		database.DB.Table("testing_applications_audit_arc").Where("application_id = ?", id).Order("created_at DESC").Find(&audits)
	}
	
	// Format response
	type AuditResponse struct {
		ID              uint      `json:"id"`
		ApplicationID   uint64    `json:"application_id"`
		RegNumber       string    `json:"reg_number"`
		ApplicationDate *time.Time `json:"application_date"`
		Status          string    `json:"status"`
		IPAddress       string    `json:"ip_address"`
		UserAgent       string    `json:"user_agent"`
		CreatedUser     string    `json:"created_user"`
		CreatedAt       time.Time `json:"created_at"`
		CreatedAtFormatted string `json:"created_at_formatted"`
	}
	
	var response []AuditResponse
	for _, audit := range audits {
		response = append(response, AuditResponse{
			ID:              audit.ID,
			ApplicationID:   audit.ApplicationID,
			RegNumber:       audit.RegNumber,
			ApplicationDate: audit.ApplicationDate,
			Status:          audit.Status,
			IPAddress:       audit.IPAddress,
			UserAgent:       audit.UserAgent,
			CreatedUser:     audit.CreatedUser,
			CreatedAt:       audit.CreatedAt,
			CreatedAtFormatted: audit.CreatedAt.Format("02-01-2006 15:04:05"),
		})
	}
	
	c.JSON(http.StatusOK, response)
}

// createAudit mendaftarkan perubahan status ke tabel audit
func parseBrowser(ua string) string {
	if strings.Contains(ua, "PostmanRuntime/") {
		return "Postman"
	} else if strings.Contains(ua, "Insomnia/") {
		return "Insomnia"
	} else if strings.Contains(ua, "Edg/") {
		return "Microsoft Edge"
	} else if strings.Contains(ua, "OPR/") || strings.Contains(ua, "Opera/") {
		return "Opera"
	} else if strings.Contains(ua, "Chrome/") {
		return "Google Chrome"
	} else if strings.Contains(ua, "Firefox/") {
		return "Mozilla Firefox"
	} else if strings.Contains(ua, "Safari/") {
		return "Apple Safari"
	}
	
	// Jika tidak dikenal, ambil potongan awal saja agar tidak terlalu panjang
	if len(ua) > 30 {
		return ua[:27] + "..."
	}
	if ua == "" {
		return "Internal System"
	}
	return ua
}

func createAudit(c *gin.Context, app models.TestingApplication) {
	ua := c.Request.UserAgent()
	browser := parseBrowser(ua)

	audit := models.TestingApplicationAudit{
		ApplicationID:   app.ID,
		RegNumber:       app.RegNumber,
		ApplicationDate: &app.CreatedAt,
		Status:          app.Status,
		IPAddress:       strings.TrimPrefix(c.ClientIP(), "::ffff:"),
		UserAgent:       browser,
		CreatedUser:     app.UpdatedUser,
		CreatedAt:       time.Now(),
	}
	database.DB.Create(&audit)
}

// GetApplicationScoringBreakdown retrieves detailed breakdown of scoring calculations
func GetApplicationScoringBreakdown(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	result, err := services.GetApplicationScoringBreakdown(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetScoringAspects retrieves scoring aspects, optionally filtered by methodology

// ValidateApplicationScoring triggers a recalculation and returns pass/fail status
func ValidateApplicationScoring(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	result, err := services.RefreshApplicationScoring(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"all_aspects_passed": result.AllAspectsPassed,
		"status":             result.Status,
		"final_score":        result.FinalScore,
		"failed_aspects":     result.FailedAspects,
	})
}

type AIDetectRequest struct {
	ApplicationID uint64             `json:"application_id"`
	AspectCode    string             `json:"aspect_code"`
	Features      map[string]float64 `json:"features"`
}

type AIDetectResponse struct {
	IsAnomaly    bool               `json:"is_anomaly"`
	AnomalyScore float64            `json:"anomaly_score"`
	ShapValues   map[string]float64 `json:"shap_values"`
	Medians      map[string]float64 `json:"medians"`
	Stds         map[string]float64 `json:"stds"`
	Message      string             `json:"message"`
}

type AspectMetadata struct {
	Features    []string           `json:"features"`
	Medians     map[string]float64 `json:"medians"`
	Stds        map[string]float64 `json:"stds"`
	NumFeatures int                `json:"num_features"`
}

func findModelFile(aspectCode, ext string) string {
	var libName string
	if ext == "json" {
		libName = fmt.Sprintf("pqc_%s_meta.json", aspectCode)
	} else {
		libName = fmt.Sprintf("pqc_%s.onnx", aspectCode)
	}

	// 1. Try custom shared folder from global parameters first
	customFolder := models.GetGlobalParam("AI_METADATA_FOLDER", "")
	if customFolder != "" {
		trimmedFolder := strings.TrimRight(customFolder, "/\\")
		lowerFolder := strings.ToLower(trimmedFolder)
		if !strings.HasSuffix(lowerFolder, "models") {
			customFolder = filepath.Join(customFolder, "models")
		}
		customPath := filepath.Join(customFolder, libName)
		if _, err := os.Stat(customPath); err == nil {
			return customPath
		}
	}

	// 2. Fallback to candidate local folders
	candidates := []string{
		filepath.Join("ai_service", "models", libName),
		filepath.Join("backend", "ai_service", "models", libName),
		filepath.Join("..", "backend", "ai_service", "models", libName),
		libName,
	}

	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			return c
		}
	}
	return ""
}

// checkAnomaly and explainAnomaly are defined in ai_detect_linux.go (linux only)
// or ai_detect_stub.go (non-linux) via build tags.

// SaveAspectResults saves results for all sub-aspects under a specific aspect
func SaveAspectResults(c *gin.Context) {
	appID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	aspectCode := c.Param("aspect_code")
	
	_ = c.Request.ParseMultipartForm(32 << 20) // 32MB max
	
	resultsStr := c.PostForm("results")
	if resultsStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No results data provided"})
		return
	}
	
	var reqItems []struct {
		SubAspectCode string  `json:"sub_aspect_code"`
		ParamCode     string  `json:"param_code"`
		Score         float64 `json:"score"`
		Notes         string  `json:"notes"`
		PhotoPath     string  `json:"photo_path"`
		IsDisabled    bool    `json:"is_disabled"`
	}
	
	if err := json.Unmarshal([]byte(resultsStr), &reqItems); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid results format: " + err.Error()})
		return
	}

	// AI Anomaly Check
	isAnomaly, anomalyScore, shapValues, medians, stds, err := checkAnomaly(appID, aspectCode, reqItems)
	if err == nil && isAnomaly {
		override := c.PostForm("override") == "true"
		overrideReason := c.PostForm("override_reason")
		spvUsername := c.PostForm("spv_username")
		spvPassword := c.PostForm("spv_password")
		
		username, _ := c.Get("username")
		usernameStr, _ := username.(string)
		if usernameStr == "" {
			usernameStr = "system"
		}

		features := make(map[string]float64)
		for _, item := range reqItems {
			code := item.SubAspectCode
			if code == "" {
				code = item.ParamCode
			}
			if code != "" {
				features[code] = item.Score
			}
		}



		isValidSpv := false
		spvErrorMsg := ""

		if override {
			if strings.TrimSpace(overrideReason) == "" {
				isValidSpv = false
				spvErrorMsg = "Alasan override wajib diisi"
			} else if strings.TrimSpace(spvUsername) == "" || strings.TrimSpace(spvPassword) == "" {
				isValidSpv = false
				spvErrorMsg = "Username dan Password Supervisor wajib diisi"
			} else {
				var spvUser models.User
				if err := spvUser.GetByUsername(database.DB, spvUsername); err != nil {
					isValidSpv = false
					spvErrorMsg = "Supervisor tidak ditemukan"
				} else if !utils.CheckPasswordHash(spvPassword, spvUser.Password) {
					isValidSpv = false
					spvErrorMsg = "Password Supervisor salah"
				} else {
					roleName := strings.ToUpper(spvUser.Role.Name)
					if roleName != "SUPERVISOR_SCORE" && roleName != "ADMIN" {
						isValidSpv = false
						spvErrorMsg = "Hanya user dengan role SUPERVISOR_SCORE atau ADMIN yang dapat melakukan override"
					} else {
						isValidSpv = true
					}
				}
			}
		}

		if override && isValidSpv {
			// Save log as OVERRIDDEN
			// (Penghapusan ai_anomaly_logs sesuai usulan untuk mengurangi redundansi log)
		} else {
			// BLOCKED
			// (Penghapusan ai_anomaly_logs sesuai usulan untuk mengurangi redundansi log)

			msg := "Deteksi Anomali: Nilai parameter di luar batas wajar. Hubungi supervisor untuk melakukan override."
			if override && spvErrorMsg != "" {
				msg = fmt.Sprintf("Override Gagal: %s. Silakan hubungi supervisor dengan wewenang yang tepat.", spvErrorMsg)
			}

			c.JSON(http.StatusBadRequest, gin.H{
				"status":        "BLOCKED",
				"message":       msg,
				"anomaly_score": anomalyScore,
				"shap_values":   shapValues,
				"medians":       medians,
				"stds":          stds,
			})
			return
		}
	}

	form, _ := c.MultipartForm()
	tx := database.DB.Begin()
	
	// Delete existing results for these sub-aspects in this application
	var subAspectCodes []string
	for _, item := range reqItems {
		code := item.SubAspectCode
		if code == "" {
			code = item.ParamCode
		}
		subAspectCodes = append(subAspectCodes, code)
	}
	
	if err := tx.Where("application_id = ? AND sub_aspect_code IN ?", appID, subAspectCodes).
		Delete(&models.TestingResult{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear old results"})
		return
	}
	
	// Insert new results
	for _, item := range reqItems {
		var photoPath string
		code := item.SubAspectCode
		if code == "" {
			code = item.ParamCode
		}

		if form != nil {
			files := form.File["photo_"+code]
			if len(files) == 0 {
				files = form.File["sub_aspect_"+code+"_file"]
			}
			if len(files) > 0 {
				file := files[0]
				f, err := file.Open()
				if err == nil {
					contentType := file.Header.Get("Content-Type")
					if contentType == "" {
						contentType = "application/octet-stream"
					}
					
					// Size Restriction
					maxSizeStr := os.Getenv("MAX_UPLOAD_SIZE")
					if maxSizeStr == "" { maxSizeStr = "2048" }
					maxSizeKB, _ := strconv.ParseInt(maxSizeStr, 10, 64)
					if file.Size <= maxSizeKB*1024 {
						ext := filepath.Ext(file.Filename)
						baseName := strings.TrimSuffix(file.Filename, ext)
						timestamp := time.Now().Format("150405.000")
						timestamp = strings.ReplaceAll(timestamp, ".", "")
						uniqueName := fmt.Sprintf("%s_%s%s", baseName, timestamp, ext)

						photoPath, _ = services.Minio.UploadGenericFile(c.Request.Context(), uniqueName, f, file.Size, contentType)
					}
					f.Close()
				}
			}
		}

		res := models.TestingResult{
			ApplicationID:        appID,
			AspectCode:           aspectCode,
			SubAspectCode:        &code,
			Score:                item.Score,
			Notes:                item.Notes,
			PhotoPath:            photoPath,
			IsDisabled:           item.IsDisabled,
			CreatedAt:            time.Now(),
		}
		if err := tx.Create(&res).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save aspect result: " + code})
			return
		}
	}
	
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit results"})
		return
	}
	
	// Recalculate everything. Important: Delete the old aspect score first so CalculateAspectScore recomputes it from new sub-aspect values.
	database.DB.Exec("DELETE FROM testing_aspect_scores WHERE application_id = ? AND aspect_code = ?", appID, aspectCode)
	services.RefreshApplicationScoring(appID)
	
	c.JSON(http.StatusOK, gin.H{"message": "Aspect results saved successfully"})
}
