package models

import (
	"fmt"
	"gorm.io/gorm"
	"os"
	"strings"
	"time"
)

type SchemaFinding struct {
	Type        string `json:"type"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	SQL         string `json:"sql"`
}

func AnalyzeSchema(db *gorm.DB, year int) ([]SchemaFinding, error) {
	if year == 0 { year = time.Now().Year() }
	
	schema := os.Getenv("DB_SCHEMA")
	if schema == "" { schema = "public" }

	fmt.Printf("[SCHEMA-FINAL] Analyzing mecs schema...\n")
	findings := []SchemaFinding{}

	tables := []string{
		"testing_plans", "testing_applications", "tester_applications",
		"testing_equipments", "testing_results", "testing_aspect_scores", "testing_applications_audit",
		"simulator_data_logs", "testing_tool_availabilities", "testing_tool_reservations",
		"travel_requests", "reimbursements", "asset_activity_logs", "asset_handovers",
		"cash_advances", "invoices", "payments", "testing_pqc_ai_anomalies", "testing_report_ais", "testing_tool_transactions",
		"testing_plans_arc", "testing_applications_arc", "tester_applications_arc",
		"testing_equipments_arc", "testing_results_arc", "testing_aspect_scores_arc", "testing_applications_audit_arc",
		"simulator_data_logs_arc", "testing_tool_availabilities_arc", "testing_tool_reservations_arc",
		"travel_requests_arc", "reimbursements_arc", "asset_activity_logs_arc", "asset_handovers_arc",
		"cash_advances_arc", "invoices_arc", "payments_arc", "testing_pqc_ai_anomalies_arc", "testing_report_ais_arc", "testing_tool_transactions_arc",
	}

	for _, table := range tables {
		// 1. Check if parent table exists in target schema
		var parentExists bool
		db.Raw(`
			SELECT EXISTS (
				SELECT 1 FROM pg_class c 
				JOIN pg_namespace n ON n.oid = c.relnamespace 
				WHERE n.nspname = ? AND c.relname = ?
			)`, schema, table).Scan(&parentExists)
		
		if !parentExists {
			// Check if it's lurking in public (even if user says no, for diagnostics)
			var inPublic bool
			db.Raw("SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = ?)", table).Scan(&inPublic)
			
			desc := fmt.Sprintf("Table '%s' is missing in schema %s.", table, schema)
			if inPublic {
				desc = fmt.Sprintf("Table '%s' is trapped in 'public' schema.", table)
			}

			findings = append(findings, SchemaFinding{
				Type:        "Schema",
				Description: desc,
				Priority:    "HIGH",
				SQL:         fmt.Sprintf("-- Corrected by Sync"),
			})
			continue
		}

		// 2. Check monthly partitions
		for m := 1; m <= 12; m++ {
			partName := fmt.Sprintf("%s_%d%02d", table, year, m)
			
			var exists bool
			db.Raw(`
				SELECT EXISTS (
					SELECT 1 FROM pg_class c 
					JOIN pg_namespace n ON n.oid = c.relnamespace 
					WHERE n.nspname = ? AND c.relname = ?
				)`, schema, partName).Scan(&exists)
			
			var isAttached bool
			db.Raw(`
				SELECT EXISTS (
					SELECT 1 FROM pg_inherits i 
					JOIN pg_class pc ON i.inhparent = pc.oid 
					JOIN pg_class cc ON i.inhrelid = cc.oid
					JOIN pg_namespace pn ON pc.relnamespace = pn.oid
					JOIN pg_namespace cn ON cc.relnamespace = cn.oid
					WHERE pc.relname = ? AND cc.relname = ? 
					AND pn.nspname = ? AND cn.nspname = ?
				)`, table, partName, schema, schema).Scan(&isAttached)

			if !exists || !isAttached {
				desc := fmt.Sprintf("Partition '%s' is missing or not attached in %s.", partName, schema)
				
				// Diagnostic for public lingering
				var inPublic bool
				db.Raw("SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = ?)", partName).Scan(&inPublic)
				if inPublic {
					desc = fmt.Sprintf("Partition '%s' exists in 'public' instead of '%s'.", partName, schema)
				}

				findings = append(findings, SchemaFinding{
					Type:        "Partition",
					Description: desc,
					Priority:    "MEDIUM",
					SQL:         fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s.%s PARTITION OF %s.%s FOR VALUES FROM ('%d-%02d-01 00:00:00+07') TO ('%s 00:00:00+07');", schema, partName, schema, table, year, m, func() string { if m < 12 { return fmt.Sprintf("%d-%02d-01", year, m+1) } else { return fmt.Sprintf("%d-01-01", year+1) } }()),
				})
			}
		}
	}

	return findings, nil
}

func EnsureMonthlyPartitions(db *gorm.DB, tableName string, year int) {
	if os.Getenv("DB_AUTO_MIGRATE") != "true" { return }
	schema := os.Getenv("DB_SCHEMA")
	if schema == "" { schema = "public" }

	months := []string{"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"}
	for i, m := range months {
		start := fmt.Sprintf("%d-%s-01", year, m)
		var end string
		if i < 11 { end = fmt.Sprintf("%d-%s-01", year, months[i+1]) } else { end = fmt.Sprintf("%d-01-01", year+1) }
		partName := fmt.Sprintf("%s_%d%s", tableName, year, m)
		
		// 1. Move from public if exists (Safety Cleaner)
		var inPublic bool
		db.Raw("SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = ?)", partName).Scan(&inPublic)
		if inPublic {
			if err := db.Exec(fmt.Sprintf("ALTER TABLE public.%s SET SCHEMA %s", partName, schema)).Error; err != nil {
				fmt.Printf("[SCHEMA-SYNC] Error moving %s from public to %s: %v\n", partName, schema, err)
			}
		}

		// 2. Ensure attachment
		var isAttached bool
		db.Raw(`
			SELECT EXISTS (
				SELECT 1 FROM pg_inherits i 
				JOIN pg_class pc ON i.inhparent = pc.oid 
				JOIN pg_class cc ON i.inhrelid = cc.oid
				JOIN pg_namespace pn ON pc.relnamespace = pn.oid
				JOIN pg_namespace cn ON cc.relnamespace = cn.oid
				WHERE pc.relname = ? AND cc.relname = ? AND pn.nspname = ? AND cn.nspname = ?
			)`, tableName, partName, schema, schema).Scan(&isAttached)

		var existsInSchema bool
		db.Raw(`
			SELECT EXISTS (
				SELECT 1 FROM pg_class c 
				JOIN pg_namespace n ON n.oid = c.relnamespace 
				WHERE n.nspname = ? AND c.relname = ?
			)`, schema, partName).Scan(&existsInSchema)

		if existsInSchema && !isAttached {
			if err := db.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s.%s CASCADE", schema, partName)).Error; err != nil {
				fmt.Printf("[SCHEMA-SYNC] Error dropping detached table %s.%s: %v\n", schema, partName, err)
			}
		}

		if err := db.Exec(fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s.%s PARTITION OF %s.%s FOR VALUES FROM ('%s 00:00:00+07') TO ('%s 00:00:00+07')", schema, partName, schema, tableName, start, end)).Error; err != nil {
			fmt.Printf("[SCHEMA-SYNC] Error creating partition %s.%s: %v\n", schema, partName, err)
		}
	}
}

func SynchronizeSchema(db *gorm.DB, year int, targets []string) error {
	if os.Getenv("DB_AUTO_MIGRATE") != "true" { return nil }
	if year == 0 { year = time.Now().Year() }
	schema := os.Getenv("DB_SCHEMA")
	if schema == "" { schema = "public" }

	isTarget := func(t string) bool {
		if len(targets) == 0 { return true }
		for _, v := range targets { if v == t || v == "Partition" || v == "All" { return true } }
		return false
	}
	
	// Ensure parent tables are in correct schema
	parentTables := []string{
		"asset_activity_logs", "asset_handovers", "cash_advances", "invoices",
		"payments", "reimbursements", "simulator_data_logs", "tester_applications",
		"testing_applications", "testing_applications_audit", "testing_aspect_scores",
		"testing_equipments", "testing_plans", "testing_pqc_ai_anomalies",
		"testing_report_ais", "testing_results", "testing_tool_availabilities",
		"testing_tool_reservations", "testing_tool_transactions", "travel_requests",
		"asset_activity_logs_arc", "asset_handovers_arc", "cash_advances_arc", "invoices_arc",
		"payments_arc", "reimbursements_arc", "simulator_data_logs_arc", "tester_applications_arc",
		"testing_applications_arc", "testing_applications_audit_arc", "testing_aspect_scores_arc",
		"testing_equipments_arc", "testing_plans_arc", "testing_pqc_ai_anomalies_arc",
		"testing_report_ais_arc", "testing_results_arc", "testing_tool_availabilities_arc",
		"testing_tool_reservations_arc", "testing_tool_transactions_arc", "travel_requests_arc",
	}
	for _, t := range parentTables {
		var inPublic bool
		db.Raw("SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = ?)", t).Scan(&inPublic)
		if inPublic {
			db.Exec(fmt.Sprintf("ALTER TABLE public.%s SET SCHEMA %s", t, schema))
		}
	}

	setupFuncs := map[string]func(*gorm.DB, int){
		"asset_activity_logs":             func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "asset_activity_logs", y) },
		"asset_handovers":                 func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "asset_handovers", y) },
		"cash_advances":                   func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "cash_advances", y) },
		"invoices":                        func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "invoices", y) },
		"payments":                        func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "payments", y) },
		"reimbursements":                  func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "reimbursements", y) },
		"simulator_data_logs":             func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "simulator_data_logs", y) },
		"tester_applications":             func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "tester_applications", y) },
		"testing_applications":            func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_applications", y) },
		"testing_applications_audit":      func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_applications_audit", y) },
		"testing_aspect_scores":           func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_aspect_scores", y) },
		"testing_equipments":              func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_equipments", y) },
		"testing_plans":                   func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_plans", y) },
		"testing_pqc_ai_anomalies":        func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_pqc_ai_anomalies", y) },
		"testing_report_ais":              func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_report_ais", y) },
		"testing_results":                 func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_results", y) },
		"testing_tool_availabilities":     func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_tool_availabilities", y) },
		"testing_tool_reservations":       func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_tool_reservations", y) },
		"testing_tool_transactions":       func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_tool_transactions", y) },
		"travel_requests":                 func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "travel_requests", y) },
		
		"asset_activity_logs_arc":         func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "asset_activity_logs_arc", y) },
		"asset_handovers_arc":             func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "asset_handovers_arc", y) },
		"cash_advances_arc":               func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "cash_advances_arc", y) },
		"invoices_arc":                    func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "invoices_arc", y) },
		"payments_arc":                    func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "payments_arc", y) },
		"reimbursements_arc":              func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "reimbursements_arc", y) },
		"simulator_data_logs_arc":         func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "simulator_data_logs_arc", y) },
		"tester_applications_arc":         func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "tester_applications_arc", y) },
		"testing_applications_arc":        func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_applications_arc", y) },
		"testing_applications_audit_arc":  func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_applications_audit_arc", y) },
		"testing_aspect_scores_arc":       func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_aspect_scores_arc", y) },
		"testing_equipments_arc":          func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_equipments_arc", y) },
		"testing_plans_arc":               func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_plans_arc", y) },
		"testing_pqc_ai_anomalies_arc":    func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_pqc_ai_anomalies_arc", y) },
		"testing_report_ais_arc":          func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_report_ais_arc", y) },
		"testing_results_arc":             func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_results_arc", y) },
		"testing_tool_availabilities_arc": func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_tool_availabilities_arc", y) },
		"testing_tool_reservations_arc":   func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_tool_reservations_arc", y) },
		"testing_tool_transactions_arc":   func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "testing_tool_transactions_arc", y) },
		"travel_requests_arc":             func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "travel_requests_arc", y) },
		"user_activity_logs":              func(db *gorm.DB, y int) { EnsureMonthlyPartitions(db, "user_activity_logs", y) },
	}

	for name, fn := range setupFuncs {
		if isTarget(name) || isTarget(strings.TrimSuffix(name, "_arc")) { fn(db, year) }
	}

	FixPartitioningConstraints(db)
	return nil
}

func FixPartitioningConstraints(db *gorm.DB) {
	schema := os.Getenv("DB_SCHEMA")
	if schema == "" { schema = "public" }
	db.Exec(fmt.Sprintf("ALTER TABLE IF EXISTS %s.testing_applications_audit ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)", schema))
	db.Exec(fmt.Sprintf("ALTER TABLE IF EXISTS %s.testing_applications_audit ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255)", schema))
}

type TableBloat struct {
	SchemaName string `json:"schema_name"`
	TableName  string `json:"table_name"`
	TableSize  string `json:"table_size"`
}

func GetDatabaseBloat(db *gorm.DB) ([]TableBloat, error) { return []TableBloat{}, nil }
