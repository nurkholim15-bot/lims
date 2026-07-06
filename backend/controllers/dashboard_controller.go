package controllers

import (
	"fmt"
	"lim-system/database"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	cachedStats     gin.H
	lastStatsUpdate time.Time
	statsCacheTTL   = 5 * time.Minute
)


func GetDashboardStats(c *gin.Context) {
	fmt.Println("[DASHBOARD] Fetching stats...")
	
	// Check for manual refresh parameter
	isRefresh := c.Query("refresh") == "true"
	
	// Get Cache TTL from Global Parameter
	ttlStr := database.GetGlobalParam("DASHBOARD_STATS_CACHE_MINUTES", "5")
	ttl, _ := strconv.Atoi(ttlStr)
	
	// Check cache (only if TTL > 0 and NOT a manual refresh)
	if !isRefresh && ttl > 0 && time.Since(lastStatsUpdate) < time.Duration(ttl)*time.Minute && cachedStats != nil {
		fmt.Println("[DASHBOARD] Returning cached stats")
		c.JSON(http.StatusOK, cachedStats)
		return
	}

	var totalEquipment int64
	var pendingReviews int64

	// 1. Get period from global parameters
	daysStr := database.GetGlobalParam("DASHBOARD_STATS_DAYS", "3")
	days, _ := strconv.Atoi(daysStr)
	if days <= 0 {
		days = 3
	}
	
	now := time.Now()
	startTime := now.AddDate(0, 0, -days)

	// REQUIREMENT 3: Cross-month logic cutoff (Always target current partition)
	if startTime.Month() != now.Month() || startTime.Year() != now.Year() {
		startTime = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		days = int(now.Sub(startTime).Hours() / 24) + 1
	}

	// YAKINKAN TABLE YANG DIBACA ADALAH PARTISI
	partitionSuffix := now.Format("200601")
	targetTable := fmt.Sprintf("testing_applications_%s", partitionSuffix)
	
	fmt.Printf("[DASHBOARD] Targeting Partition Table: %s, Period: %d days (Refresh: %v)\n", targetTable, days, isRefresh)

	// REQUIREMENT 1: Summary per status
	type StatusCount struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	statusSummary := []StatusCount{}

	// NEW: Daily Traffic Summary
	type DailyTraffic struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	dailyTraffic := []DailyTraffic{}

	// Execute queries in parallel for maximum speed
	var wg sync.WaitGroup
	wg.Add(4)

	go func() {
		defer wg.Done()
		database.DB.Table(targetTable).
			Where("created_at >= ?", startTime).
			Count(&totalEquipment)
	}()

	go func() {
		defer wg.Done()
		database.DB.Table(targetTable).
			Where("UPPER(status) = ? AND created_at >= ?", "REGISTERED", startTime).
			Count(&pendingReviews)
	}()

	go func() {
		defer wg.Done()
		database.DB.Table(targetTable).
			Select("UPPER(status) as status, count(*) as count").
			Where("created_at >= ?", startTime).
			Group("UPPER(status)").
			Scan(&statusSummary)
	}()

	go func() {
		defer wg.Done()
		// Get daily traffic from partition table
		database.DB.Table(targetTable).
			Select("DATE(created_at) as date, count(*) as count").
			Where("created_at >= ?", startTime).
			Group("DATE(created_at)").
			Order("DATE(created_at) ASC").
			Scan(&dailyTraffic)
	}()

	wg.Wait()

	fmt.Printf("[DASHBOARD] Found %d status groups and %d days of traffic\n", len(statusSummary), len(dailyTraffic))

	// 5. Uptime calculation
	uptimeStr := "0h 0m"
	if !BootTime.IsZero() {
		diff := time.Since(BootTime)
		hrs := int(diff.Hours())
		mins := int(diff.Minutes()) % 60
		uptimeStr = fmt.Sprintf("%dh %dm", hrs, mins)
	}

	result := gin.H{
		"total_equipment_testing": totalEquipment,
		"pending_reviews":          pendingReviews,
		"status_summary":           statusSummary,
		"daily_traffic":            dailyTraffic,
		"uptime":                   uptimeStr,
		"boot_time":                BootTime.Format(time.RFC3339),
		"as_of":                    now.Format("02-01-2006 15:04:05"),
		"period_days":              days,
		"period_start":             startTime.Format("02-01-2006"),
		"target_partition":         targetTable,
		"cached":                   !isRefresh,
	}

	// Update cache
	cachedStats = result
	lastStatsUpdate = time.Now()

	fmt.Println("[DASHBOARD] Stats fetch complete")
	c.JSON(http.StatusOK, result)
}

