package controllers

import (
	"fmt"
	"lim-system/models"
	"lim-system/views"
	"lim-system/database"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// GetEligiblePartitions scans for partitions older than the threshold (default: 3 months)
func GetEligiblePartitions(c *gin.Context) {
	thresholdStr := models.GetGlobalParam("DATA_ARCHIVE_THRESHOLD_MONTHS", "3")
	threshold, _ := strconv.Atoi(thresholdStr)
	if threshold <= 0 {
		threshold = 3
	}

	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	cutoff := currentMonthStart.AddDate(0, -(threshold - 1), 0)

	eligible := []gin.H{}

	tables := []string{
		"testing_applications", "asset_activity_logs", "reimbursements",
		"testing_aspect_scores", "testing_equipments", "testing_tool_availabilities",
		"testing_tool_reservations", "travel_requests",
		"testing_applications_audit", "testing_plans", "testing_results",
		"simulator_data_logs", "tester_applications",
	}

	schema := os.Getenv("DB_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	query := fmt.Sprintf(`
		SELECT DISTINCT substring(relname from '[0-9]{6}$') as period
		FROM pg_class c
		JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE n.nspname = '%s'
		  AND c.relkind = 'r'
		  AND (
	`, schema)
	for i, t := range tables {
		if i > 0 {
			query += " OR "
		}
		query += fmt.Sprintf("relname LIKE '%s_%%'", t)
	}
	query += ") AND relname ~ '_[0-9]{6}$'"

	var periods []string
	// Gunakan session Silent agar query meta-data ini tidak spam/mengganggu log terminal
	database.DB.Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}).Raw(query).Scan(&periods)

	foundMap := make(map[string]gin.H)
	for _, period := range periods {
		if len(period) != 6 {
			continue
		}
		y, _ := strconv.Atoi(period[:4])
		mStr := period[4:]
		m, _ := strconv.Atoi(mStr)
		
		partitionDate := time.Date(y, time.Month(m), 1, 0, 0, 0, 0, time.Local)
		if partitionDate.After(cutoff) || partitionDate.Equal(cutoff) {
			continue
		}

		key := period
		if _, ok := foundMap[key]; !ok {
			foundMap[key] = gin.H{
				"year":  y,
				"month": mStr,
				"name":  fmt.Sprintf("%d-%s", y, mStr),
			}
		}
	}

	keys := make([]string, 0, len(foundMap))
	for k := range foundMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, k := range keys {
		v := foundMap[k]
		v["label"] = v["name"]
		eligible = append(eligible, v)
	}

	views.Success(c, gin.H{
		"eligible":         eligible,
		"threshold_months": threshold,
		"limit_date":       cutoff.Format("Jan 2006"),
	}, "Eligible partitions retrieved")
}

func getCommonColumns(db *gorm.DB, table1, table2 string) ([]string, error) {
	var cols1 []string
	if err := db.Raw("SELECT column_name FROM information_schema.columns WHERE table_name = ?", table1).Scan(&cols1).Error; err != nil {
		return nil, err
	}
	
	var cols2 []string
	if err := db.Raw("SELECT column_name FROM information_schema.columns WHERE table_name = ?", table2).Scan(&cols2).Error; err != nil {
		return nil, err
	}
	
	colMap := make(map[string]bool)
	for _, c := range cols2 {
		colMap[c] = true
	}
	
	var common []string
	for _, c := range cols1 {
		if colMap[c] {
			common = append(common, c)
		}
	}
	
	if len(common) == 0 {
		return nil, fmt.Errorf("no common columns found between %s and %s", table1, table2)
	}
	
	return common, nil
}

func ArchiveData(c *gin.Context) {
	var input struct {
		Year  int    `json:"year"`
		Month string `json:"month"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Invalid input", err.Error())
		return
	}

	username, _ := c.Get("username")
	suffix := fmt.Sprintf("%d%s", input.Year, input.Month)
	tables := []string{
		"asset_activity_logs",
		"asset_handovers",
		"cash_advances",
		"invoices",
		"payments",
		"reimbursements",
		"simulator_data_logs",
		"tester_applications",
		"testing_applications",
		"testing_applications_audit",
		"testing_aspect_scores",
		"testing_equipments",
		"testing_plans",
		"testing_pqc_ai_anomalies",
		"testing_report_ais",
		"testing_results",
		"testing_tool_availabilities",
		"testing_tool_reservations",
		"testing_tool_transactions",
		"travel_requests",
	}

	schema := os.Getenv("DB_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	tx := database.DB.Begin()
	// Ensure transaction uses the correct schema
	tx.Exec(fmt.Sprintf("SET search_path TO %s, public", schema))

	for _, table := range tables {
		partitionName := fmt.Sprintf("%s_%s", table, suffix)
		archiveTable := fmt.Sprintf("%s_arc", table)
		archivePartitionName := fmt.Sprintf("%s_%s", archiveTable, suffix)
		
		var exists bool
		tx.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", partitionName).Scan(&exists)
		if !exists {
			continue
		}

		var arcParentExists bool
		tx.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", archiveTable).Scan(&arcParentExists)
		if !arcParentExists {
			continue
		}

		tx.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", archivePartitionName).Scan(&exists)
		if !exists {
			start := fmt.Sprintf("%d-%s-01", input.Year, input.Month)
			mVal, _ := time.Parse("01", input.Month)
			targetDate := time.Date(input.Year, mVal.Month(), 1, 0, 0, 0, 0, time.Local)
			endDate := targetDate.AddDate(0, 1, 0)
			end := endDate.Format("2006-01-01")
			
			if err := tx.Exec(fmt.Sprintf("CREATE TABLE %s PARTITION OF %s FOR VALUES FROM ('%s') TO ('%s')", archivePartitionName, archiveTable, start, end)).Error; err != nil {
				tx.Rollback()
				views.InternalError(c, "Failed to create archive partition", err.Error())
				return
			}
		}

		common, err := getCommonColumns(tx, partitionName, archiveTable)
		if err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to get column mapping", err.Error())
			return
		}
		
		colList := strings.Join(common, ", ")
		query := fmt.Sprintf("INSERT INTO %s (%s) SELECT %s FROM %s", archiveTable, colList, colList, partitionName)
		
		if err := tx.Exec(query).Error; err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to move data to archive", err.Error())
			return
		}

		if err := tx.Exec(fmt.Sprintf("DROP TABLE %s", partitionName)).Error; err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to drop partition", err.Error())
			return
		}
	}
	tx.Commit()

	logMsg := fmt.Sprintf("Archived partitions for %d-%s by %v", input.Year, input.Month, username)
	fmt.Println(logMsg)

	views.Success(c, nil, "Archiving completed successfully")
}

func UnarchiveData(c *gin.Context) {
	var input struct {
		Year  int    `json:"year"`
		Month string `json:"month"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		views.BadRequest(c, "Invalid input", err.Error())
		return
	}

	username, _ := c.Get("username")
	suffix := fmt.Sprintf("%d%s", input.Year, input.Month)
	tables := []string{
		"asset_activity_logs",
		"asset_handovers",
		"cash_advances",
		"invoices",
		"payments",
		"reimbursements",
		"simulator_data_logs",
		"tester_applications",
		"testing_applications",
		"testing_applications_audit",
		"testing_aspect_scores",
		"testing_equipments",
		"testing_plans",
		"testing_pqc_ai_anomalies",
		"testing_report_ais",
		"testing_results",
		"testing_tool_availabilities",
		"testing_tool_reservations",
		"testing_tool_transactions",
		"travel_requests",
	}

	schema := os.Getenv("DB_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	tx := database.DB.Begin()
	// Ensure transaction uses the correct schema
	tx.Exec(fmt.Sprintf("SET search_path TO %s, public", schema))

	// Check if testing_applications partition already has data to prevent overwriting/conflicts
	var count int64
	targetPartition := fmt.Sprintf("%s.testing_applications_%s", schema, suffix)
	var exists bool
	tx.Raw("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=? AND table_name=?)", schema, fmt.Sprintf("testing_applications_%s", suffix)).Scan(&exists)
	
	if exists {
		tx.Raw(fmt.Sprintf("SELECT COUNT(*) FROM %s", targetPartition)).Scan(&count)
		if count > 0 {
			tx.Rollback()
			views.BadRequest(c, fmt.Sprintf("Maaf proses restore archive tidak bisa dilanjutkan karena table testing_applications_%s masih ada datanya", suffix), "")
			return
		}
	}

	for _, table := range tables {
		partitionName := fmt.Sprintf("%s_%s", table, suffix)
		archiveTable := fmt.Sprintf("%s_arc", table)
		archivePartitionName := fmt.Sprintf("%s_%s", archiveTable, suffix)
		
		var exists bool
		tx.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", archivePartitionName).Scan(&exists)
		if !exists {
			continue
		}

		var parentExists bool
		tx.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", table).Scan(&parentExists)
		if !parentExists {
			continue
		}

		tx.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ?)", partitionName).Scan(&exists)
		if !exists {
			start := fmt.Sprintf("%d-%s-01", input.Year, input.Month)
			mVal, _ := time.Parse("01", input.Month)
			targetDate := time.Date(input.Year, mVal.Month(), 1, 0, 0, 0, 0, time.Local)
			endDate := targetDate.AddDate(0, 1, 0)
			end := endDate.Format("2006-01-01")
			
			if err := tx.Exec(fmt.Sprintf("CREATE TABLE %s PARTITION OF %s FOR VALUES FROM ('%s') TO ('%s')", partitionName, table, start, end)).Error; err != nil {
				tx.Rollback()
				views.InternalError(c, "Failed to recreate partition", err.Error())
				return
			}
		}

		common, err := getCommonColumns(tx, archivePartitionName, table)
		if err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to get column mapping", err.Error())
			return
		}
		
		colList := strings.Join(common, ", ")
		query := fmt.Sprintf("INSERT INTO %s (%s) SELECT %s FROM %s", table, colList, colList, archivePartitionName)

		if err := tx.Exec(query).Error; err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to move data back to active", err.Error())
			return
		}

		if err := tx.Exec(fmt.Sprintf("DROP TABLE %s", archivePartitionName)).Error; err != nil {
			tx.Rollback()
			views.InternalError(c, "Failed to drop archive partition", err.Error())
			return
		}
	}

	// Sync sequences for ID continuity
	for _, table := range tables {
		var hasId bool
		tx.Raw("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = ? AND column_name = 'id')", table).Scan(&hasId)
		if hasId {
			var seqName string
			tx.Raw("SELECT pg_get_serial_sequence(?, 'id')", table).Scan(&seqName)
			if seqName != "" {
				tx.Exec(fmt.Sprintf("SELECT setval('%s', (SELECT COALESCE(MAX(id), 1) FROM %s))", seqName, table))
			}
		}
	}

	tx.Commit()
	fmt.Printf("Unarchived partitions for %d-%s by %v\n", input.Year, input.Month, username)

	views.Success(c, nil, "Unarchiving completed successfully")
}

func getPgDumpPath() string {
	if path, err := exec.LookPath("pg_dump"); err == nil {
		fmt.Println("[BACKUP] Found pg_dump in PATH:", path)
		return path
	}
	
	// Try Windows
	matches, _ := filepath.Glob("C:\\Program Files\\PostgreSQL\\*\\bin\\pg_dump.exe")
	if len(matches) > 0 {
		fmt.Println("[BACKUP] Found pg_dump via Windows fallback:", matches[len(matches)-1])
		return matches[len(matches)-1]
	}

	// Try Linux/Mac
	matchesLin, _ := filepath.Glob("/usr/lib/postgresql/*/bin/pg_dump")
	if len(matchesLin) > 0 {
		fmt.Println("[BACKUP] Found pg_dump via Linux fallback:", matchesLin[len(matchesLin)-1])
		return matchesLin[len(matchesLin)-1]
	}

	fmt.Println("[BACKUP] WARNING: pg_dump not found in PATH or standard directories!")
	return "pg_dump"
}

func getPsqlPath() string {
	if path, err := exec.LookPath("psql"); err == nil {
		return path
	}
	matches, _ := filepath.Glob("C:\\Program Files\\PostgreSQL\\*\\bin\\psql.exe")
	if len(matches) > 0 {
		return matches[len(matches)-1]
	}
	matchesLin, _ := filepath.Glob("/usr/lib/postgresql/*/bin/psql")
	if len(matchesLin) > 0 {
		return matchesLin[len(matchesLin)-1]
	}
	return "psql"
}

func BackupDatabase(c *gin.Context) {
	dbName := os.Getenv("DB_NAME")
	dbUser := os.Getenv("DB_USER")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbPass := database.DBPassword

	fileName := fmt.Sprintf("full_backup_%s_%s.sql", dbName, time.Now().Format("20060102_150405"))
	filePath := filepath.Join("public", "uploads", fileName)

	os.MkdirAll(filepath.Join("public", "uploads"), os.ModePerm)

	cmd := exec.Command(getPgDumpPath(), "-h", dbHost, "-p", dbPort, "-U", dbUser, "-f", filePath, dbName)
	cmd.Env = append(os.Environ(), "PGPASSWORD="+dbPass)

	if output, err := cmd.CombinedOutput(); err != nil {
		views.InternalError(c, "Backup failed", fmt.Sprintf("%v: %s", err, string(output)))
		return
	}

	if stat, err := os.Stat(filePath); err != nil || stat.Size() == 0 {
		views.InternalError(c, "Backup file corrupted or empty", "")
		return
	}

	c.FileAttachment(filePath, fileName)
}

func RestoreDatabase(c *gin.Context) {
	file, err := c.FormFile("backup_file")
	if err != nil {
		views.BadRequest(c, "No backup file provided", "")
		return
	}

	tempPath := filepath.Join("public", "uploads", "restore_temp.sql")
	if err := c.SaveUploadedFile(file, tempPath); err != nil {
		views.InternalError(c, "Failed to save upload", err.Error())
		return
	}
	defer os.Remove(tempPath)

	dbName := os.Getenv("DB_NAME")
	dbUser := os.Getenv("DB_USER")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbPass := database.DBPassword

	cmd := exec.Command(getPsqlPath(), "-h", dbHost, "-p", dbPort, "-U", dbUser, "-d", dbName, "-f", tempPath)
	cmd.Env = append(os.Environ(), "PGPASSWORD="+dbPass)

	if output, err := cmd.CombinedOutput(); err != nil {
		views.InternalError(c, "Restore failed", fmt.Sprintf("%v: %s", err, string(output)))
		return
	}

	views.Success(c, nil, "Database restore completed successfully")
}

func SyncDatabaseSchema(c *gin.Context) {
	var req struct {
		Year        int      `json:"year"`
		TargetTypes []string `json:"target_types"`
	}
	c.ShouldBindJSON(&req)

	if err := models.SynchronizeSchema(database.DB, req.Year, req.TargetTypes); err != nil {
		views.InternalError(c, "Schema synchronization failed", err.Error())
		return
	}

	views.Success(c, nil, "Database schema synchronization completed successfully")
}

func AnalyzeDatabaseSchema(c *gin.Context) {
	yearStr := c.Query("year")
	year, _ := strconv.Atoi(yearStr)

	findings, err := models.AnalyzeSchema(database.DB, year)
	if err != nil {
		views.InternalError(c, "Schema analysis failed", err.Error())
		return
	}

	views.Success(c, gin.H{"findings": findings}, "Schema analysis completed")
}


func GetDatabaseBloat(c *gin.Context) {
	results, err := models.GetDatabaseBloat(database.DB)
	if err != nil {
		views.InternalError(c, "Failed to get database bloat", err.Error())
		return
	}
	views.Success(c, results, "Database bloat analysis completed")
}

func VacuumTable(c *gin.Context) {
	tableName := c.Query("table")
	if tableName == "" {
		views.BadRequest(c, "Table name is required", "Missing parameter: table")
		return
	}

	// Validate table name to prevent SQL injection (though it's admin only)
	// For safety, we only allow alphanumeric and underscores
	for _, r := range tableName {
		if !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '.') {
			views.BadRequest(c, "Invalid table name", "Special characters are not allowed")
			return
		}
	}

	// Run VACUUM (cannot run inside transaction)
	isFull := c.Query("full") == "true"
	sql := fmt.Sprintf("VACUUM ANALYZE %s", tableName)
	if isFull {
		sql = fmt.Sprintf("VACUUM FULL ANALYZE %s", tableName)
	}

	if err := database.DB.Exec(sql).Error; err != nil {
		views.InternalError(c, "Failed to vacuum table", err.Error())
		return
	}

	views.Success(c, nil, fmt.Sprintf("Table %s vacuumed successfully", tableName))
}
