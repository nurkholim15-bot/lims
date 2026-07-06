package services

import (
	"encoding/json"
	"fmt"
	"log"
	"lim-system/models"
	"lim-system/database"
	"strings"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// ============================================================
// SCORING SERVICE - HIERARCHICAL SCORING CALCULATION ENGINE
// Implements 4-level scoring hierarchy:
// Level 1: Equipment
// Level 2: Tests (Methodologies)
// Level 3: Aspects (with weights & thresholds)
// Level 4: Sub-aspects (actual parameters with scores)
// ============================================================

// AspectScore represents calculated value for an aspect
type AspectScore struct {
	AspectCode  string           `json:"aspect_code"`
	AspectName  string           `json:"aspect_name"`
	Weight      float64          `json:"weight"`
	Score       float64          `json:"score"`       // Calculated aspect score
	Threshold   float64          `json:"threshold"`   // Dynamic threshold from database
	IsPassed    bool             `json:"is_passed"`   // Whether score meets threshold
	SubAspects  []SubAspectScore `json:"sub_aspects"` // Breakdown by sub-aspect
}

// SubAspectScore represents score for a single sub-aspect
type SubAspectScore struct {
	SubAspectCode string  `json:"sub_aspect_code"`
	SubAspectName string  `json:"sub_aspect_name"`
	Weight        float64 `json:"weight"`
	Score         float64 `json:"score"`
	IsDisabled    bool    `json:"is_disabled"`
}

// ScoringResult represents complete scoring calculation result
type ScoringResult struct {
	ApplicationID      uint64          `json:"application_id"`
	FinalScore         float64         `json:"final_score"`
	FinalLevel         string          `json:"final_level"`
	AllAspectsPassed   bool            `json:"all_aspects_passed"`
	AspectsScore       []AspectScore   `json:"aspects_score"`
	FailedAspects      []AspectFailure `json:"failed_aspects"`
	Status             string          `json:"status"` // LULUS, TIDAK LULUS
	CalculationDetails string          `json:"calculation_details"`
}

// AspectFailure represents a failed aspect
type AspectFailure struct {
	AspectCode  string  `json:"aspect_code"`
	AspectName  string  `json:"aspect_name"`
	Score       float64 `json:"score"`
	Difference  float64 `json:"difference"` // Deprecated
}

// ============================================================
// CALCULATION FUNCTIONS
// ============================================================

// GetScoreLevel determines the narrative level (grade) for a given score based on rule set code
func GetScoreLevel(score float64, levelCode string) string {
	var level models.ScoringLevel

	// 1. Try specific rule set
	if levelCode != "" && levelCode != "00000" && levelCode != "     " {
		err := database.DB.Where("level_group_code = ? AND ? >= min_score AND ? < max_score",
			strings.TrimSpace(levelCode), score, score).First(&level).Error
		if err == nil && level.Label != "" {
			return level.Label
		}
	}

	// 2. Fallback to General (code '00000')
	err := database.DB.Where("level_group_code = '00000' AND ? >= min_score AND ? < max_score",
		score, score).First(&level).Error
	
	if err != nil || level.Label == "" {
		log.Printf("Warning: No scoring level found for score %.2f (LevelCode: [%s]). Fallback to basic Lulus/Tidak Lulus.", score, levelCode)
		if score >= 65 {
			return "Lulus"
		}
		return "Tidak Lulus"
	}

	return level.Label
}

// CalculateSubAspectScore calculates weighted average for a single sub-aspect
// Returns: (score OR 0), error
func CalculateSubAspectScore(applicationID uint64, subAspectCode string) (float64, error) {
	var results []models.TestingResult

	// Get all scores for this sub-aspect in the application
	if err := database.DB.Where(
		"application_id = ? AND sub_aspect_code = ?",
		applicationID, subAspectCode,
	).Find(&results).Error; err != nil {
		log.Printf("Error fetching results for sub-aspect %s: %v", subAspectCode, err)
		return 0, err
	}

	// (Archive fallback dihilangkan untuk optimasi performa)

	if len(results) == 0 {
		return 0, fmt.Errorf("no scores found for sub-aspect %s", subAspectCode)
	}

	// Average scores for this sub-aspect
	var sum float64
	for _, r := range results {
		sum += r.Score
	}
	avgScore := sum / float64(len(results))

	return avgScore, nil
}

// CalculateAspectScore calculates weighted average of sub-aspects for an aspect
// Formula: Σ(Sub-aspect Score × Weight) / Σ Weight
func CalculateAspectScore(applicationID uint64, aspectCode string) (AspectScore, error) {
	var aspect models.ScoringAspect
	var subAspects []models.ScoringSubAspect

	// Get aspect details
	if err := database.DB.Where("code = ?", aspectCode).First(&aspect).Error; err != nil {
		return AspectScore{}, fmt.Errorf("aspect not found: %w", err)
	}

	// Get all sub-aspects for this aspect
	if err := database.DB.Where("aspect_code = ? AND is_active = ?", aspect.Code, true).
		Find(&subAspects).Error; err != nil {
		return AspectScore{}, err
	}

	if len(subAspects) == 0 {
		return AspectScore{}, fmt.Errorf("no sub-aspects found for aspect %s", aspectCode)
	}

	// Filter by package active sub-aspects configuration if exists
	var app models.TestingApplication
	if err := database.DB.Select("package_id").First(&app, applicationID).Error; err == nil && app.PackageID != nil && *app.PackageID != 0 {
		var activeSubCodes []string
		database.DB.Table("package_active_sub_aspects").
			Where("package_id = ?", *app.PackageID).
			Pluck("sub_aspect_code", &activeSubCodes)

		if len(activeSubCodes) > 0 {
			var filteredSubAspects []models.ScoringSubAspect
			activeMap := make(map[string]bool)
			for _, code := range activeSubCodes {
				activeMap[code] = true
			}
			for _, sa := range subAspects {
				if activeMap[sa.Code] {
					filteredSubAspects = append(filteredSubAspects, sa)
				}
			}
			subAspects = filteredSubAspects
		}
	}

	// Calculate weighted sum
	var weightedSum float64
	var totalWeight float64
	var subAspectScores []SubAspectScore

	for _, subAspect := range subAspects {
		// Check if this sub-aspect is explicitly disabled in testing results
		var res models.TestingResult
		isDisabled := false
		if err := database.DB.Where("application_id = ? AND sub_aspect_code = ?", applicationID, subAspect.Code).First(&res).Error; err == nil {
			if res.IsDisabled {
				isDisabled = true
			}
		}

		if isDisabled {
			// Skip/exclude this sub-aspect from scoring calculations
			subAspectScores = append(subAspectScores, SubAspectScore{
				SubAspectCode: subAspect.Code,
				SubAspectName: subAspect.Name,
				Weight:        subAspect.Weight,
				Score:         0,
				IsDisabled:    true,
			})
			continue
		}

		// Get scores for this sub-aspect
		score, err := CalculateSubAspectScore(applicationID, subAspect.Code)
		if err != nil {
			log.Printf("Warning: Could not get score for sub-aspect %s: %v", subAspect.Code, err)
			continue
		}

		weighted := score * subAspect.Weight
		weightedSum += weighted
		totalWeight += subAspect.Weight

		subAspectScores = append(subAspectScores, SubAspectScore{
			SubAspectCode: subAspect.Code,
			SubAspectName: subAspect.Name,
			Weight:        subAspect.Weight,
			Score:         score,
			IsDisabled:    false,
		})
	}

	// Avoid division by zero
	var aspectScore float64
	if totalWeight > 0 {
		aspectScore = weightedSum / totalWeight
	}
	
	log.Printf("[SCORING DEBUG] Aspect %s calculated score: %.4f", aspectCode, aspectScore)

	// MANUAL OVERRIDE / CACHE CHECK:
	// Gunakan raw SQL agar partitioned table (testing_aspect_scores) dapat di-query
	// dengan benar. GORM .First() tanpa filter created_at rentan gagal di partitioned table.
	// 1. Try production parent
	type cachedRow struct {
		Score float64
	}
	var cachedResult cachedRow

	rawErr := database.DB.Raw(`
		SELECT score FROM testing_aspect_scores
		WHERE application_id = ? AND UPPER(aspect_code) = UPPER(?)
		ORDER BY created_at DESC
		LIMIT 1
	`, applicationID, aspectCode).Scan(&cachedResult).Error

	// (Archive fallback dihilangkan untuk optimasi performa query)
	// Jika data tidak ditemukan di tabel utama, maka memang belum ada nilainya.
	if rawErr != nil {
		cachedResult.Score = 0
	}

	if (rawErr == nil || cachedResult.Score > 0) && cachedResult.Score > 0 {
		log.Printf("[SCORING PERSISTENCE] Aspect %s FOUND persisted score: %.4f (Replacing calculated score %.4f)", aspectCode, cachedResult.Score, aspectScore)
		aspectScore = cachedResult.Score
	}

	threshold := aspect.Threshold
	if threshold == 0 {
		threshold = 60.0 // Default fallback if not defined in database
	}

	return AspectScore{
		AspectCode: aspect.Code,
		AspectName: aspect.Name,
		Weight:     aspect.Weight,
		Score:      aspectScore,
		Threshold:  threshold,
		IsPassed:   aspectScore >= threshold,
		SubAspects: subAspectScores,
	}, nil
}

// ValidateAspectThresholds checks if ALL aspects meet minimum threshold
// Returns: error if ANY aspect fails, nil if all pass
func ValidateAspectThresholds(aspectScores []AspectScore) ([]AspectFailure, bool) {
	var failures []AspectFailure
	allPassed := true

	for i := range aspectScores {
		threshold := aspectScores[i].Threshold
		if threshold == 0 {
			threshold = 60.0 // Default fallback
		}
		if aspectScores[i].Score < threshold {
			aspectScores[i].IsPassed = false
			allPassed = false
			failures = append(failures, AspectFailure{
				AspectCode: aspectScores[i].AspectCode,
				AspectName: aspectScores[i].AspectName,
				Score:      aspectScores[i].Score,
			})
		}
	}

	return failures, allPassed
}

// CalculateFinalScore calculates overall final score from aspects
// Formula: Σ(Aspect Score × Weight) / Σ Weight
func CalculateFinalScore(aspectScores []AspectScore) float64 {
	if len(aspectScores) == 0 {
		return 0
	}

	var weightedSum float64
	var totalWeight float64

	for _, aspect := range aspectScores {
		weightedSum += aspect.Score * aspect.Weight
		totalWeight += aspect.Weight
	}

	if totalWeight == 0 {
		return 0
	}

	return weightedSum / totalWeight
}

// DetermineFinalStatus determines pass/fail based on thresholds
// Returns status string (LULUS, TIDAK_LULUS)
func DetermineFinalStatus(allAspectsPassed bool, finalScore float64, finalThreshold float64) string {
	// Critical: If ANY aspect failed, entire test fails
	if !allAspectsPassed {
		return "TIDAK_LULUS"
	}

	// Check final score threshold
	if finalScore >= finalThreshold {
		return "LULUS"
	}

	return "TIDAK_LULUS"
}

// RefreshApplicationScoring recalculates all scores for an application
// This is the main entry point for recalculating scores
func RefreshApplicationScoring(applicationID uint64) (ScoringResult, error) {
	var app models.TestingApplication
	result := ScoringResult{
		ApplicationID: applicationID,
	}

	// Get application
	if err := database.DB.First(&app, applicationID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Try archive parent
			if errArc := database.DB.Table("testing_applications_arc").Where("id = ?", applicationID).First(&app).Error; errArc != nil {
				return result, fmt.Errorf("application not found in production or archive: %w", errArc)
			}
		} else {
			return result, fmt.Errorf("application fetch error: %w", err)
		}
	}

	// Get all aspects for this application's methodologies (Lab & Field)
	var aspects []models.ScoringAspect
	methodologyCodes := []string{}
	if app.LabMethodologyCode != nil {
		methodologyCodes = append(methodologyCodes, *app.LabMethodologyCode)
	}
	if app.FieldMethodologyCode != nil {
		methodologyCodes = append(methodologyCodes, *app.FieldMethodologyCode)
	}
	if app.MethodologyCode != nil {
		methodologyCodes = append(methodologyCodes, *app.MethodologyCode)
	}

	if len(methodologyCodes) > 0 {
		if err := database.DB.Where(
			"methodology_code IN ? AND is_active = ? AND is_used = ?",
			methodologyCodes, true, true,
		).Find(&aspects).Error; err != nil {
			return result, fmt.Errorf("failed to fetch aspects: %w", err)
		}
	}

	// Filter by package active aspects configuration if exists
	if app.PackageID != nil && *app.PackageID != 0 {
		var activeAspectCodes []string
		database.DB.Table("package_active_aspects").
			Where("package_id = ?", *app.PackageID).
			Pluck("aspect_code", &activeAspectCodes)

		if len(activeAspectCodes) > 0 {
			var filteredAspects []models.ScoringAspect
			activeMap := make(map[string]bool)
			for _, code := range activeAspectCodes {
				activeMap[code] = true
			}
			for _, asp := range aspects {
				if activeMap[asp.Code] {
					filteredAspects = append(filteredAspects, asp)
				}
			}
			aspects = filteredAspects
		}
	}

	// Calculate score for each aspect
	var aspectScores []AspectScore
	for _, aspect := range aspects {
		aspScore, err := CalculateAspectScore(applicationID, aspect.Code)
		if err != nil {
			log.Printf("Warning: Could not calculate score for aspect %s: %v", aspect.Code, err)
			continue
		}
		aspectScores = append(aspectScores, aspScore)
	}

	// Validate all aspects meet thresholds (HARD FAILURE RULE)
	failedAspects, allPassed := ValidateAspectThresholds(aspectScores)
	result.AllAspectsPassed = allPassed
	result.AspectsScore = aspectScores
	result.FailedAspects = failedAspects

	// Always calculate final score even if some aspects failed thresholds
	// This allows narrative labels (like 'Lulus Sedang') to be determined by the weighted average
	finalScore := CalculateFinalScore(aspectScores)

	// Get the level rule code from the app's methodology
	levelCode := "00000"
	if app.LabMethodologyCode != nil {
		var met models.Methodology
		database.DB.Where("code = ?", *app.LabMethodologyCode).First(&met)
		if met.ScoringLevelCode != "" {
			levelCode = met.ScoringLevelCode
		}
	} else if app.FieldMethodologyCode != nil {
		var met models.Methodology
		database.DB.Where("code = ?", *app.FieldMethodologyCode).First(&met)
		if met.ScoringLevelCode != "" {
			levelCode = met.ScoringLevelCode
		}
	}

	result.FinalScore = finalScore
	result.FinalLevel = GetScoreLevel(finalScore, levelCode)
	
	// FINAL DECISION LOGIC:
	// If any aspect failed (score < 60), the final status is MUST be "Tidak Lulus"
	// even if the final average score is >= 65.
	if !allPassed {
		result.Status = "Tidak Lulus"
	} else {
		result.Status = result.FinalLevel
	}

	// Generate calculation details
	result.CalculationDetails = generateCalculationDetails(aspectScores, finalScore, allPassed)

	// Save to database
	err := SaveScoringResult(applicationID, result)
	if err != nil {
		log.Printf("Warning: Failed to save scoring result: %v", err)
	}

	return result, nil
}

// SaveScoringResult saves the calculated score back to database
func SaveScoringResult(applicationID uint64, result ScoringResult) error {
	// Convert aspect failures to JSON
	failuresJSON, _ := json.Marshal(result.FailedAspects)
	failuresJSONData := datatypes.JSON(failuresJSON)

	// Update testing_applications
	updates := map[string]interface{}{
		"final_score":      result.FinalScore,
		"final_status":     result.Status,
		"aspects_passed":   result.AllAspectsPassed,
		"updated_at":       time.Now(),
	}

	if err := database.DB.Model(&models.TestingApplication{}).
		Where("id = ?", applicationID).
		Updates(updates).Error; err != nil {
		return err
	}

	// Update testing_pqc_ai_anomalies
	var anomaly models.TestingPqcAiAnomaly
	if err := database.DB.Where("application_id = ?", applicationID).First(&anomaly).Error; err != nil {
		// Insert new anomaly
		newAnomaly := models.TestingPqcAiAnomaly{
			ApplicationID: applicationID,
			AspectFailure: failuresJSONData,
			CreatedAt:     time.Now(),
			CreatedUser:   "SYSTEM_RECALC",
		}
		if err := database.DB.Create(&newAnomaly).Error; err != nil {
			log.Printf("[SCORING] Warning: Failed to create anomaly record: %v", err)
		}
	} else {
		// Update existing anomaly
		anomaly.AspectFailure = failuresJSONData
		anomaly.UpdatedAt = time.Now()
		anomaly.UpdatedUser = "SYSTEM_RECALC"
		if err := database.DB.Save(&anomaly).Error; err != nil {
			log.Printf("[SCORING] Warning: Failed to update anomaly record: %v", err)
		}
	}

	// Update testing_aspect_scores with aspect scores
	log.Printf("[SCORING] Saving %d aspect scores for application %d", len(result.AspectsScore), applicationID)
	
	for _, aspect := range result.AspectsScore {
		// Gunakan raw SQL untuk DELETE + INSERT pada partitioned table.
		// GORM ORM tanpa created_at tidak bisa melakukan partition pruning dengan benar.
		now := time.Now()

		err := database.DB.Transaction(func(tx *gorm.DB) error {
			// 1. Hapus semua record lama untuk aspect ini (semua partisi)
			if err := tx.Exec(
				`DELETE FROM testing_aspect_scores WHERE application_id = $1 AND aspect_code = $2`,
				applicationID, aspect.AspectCode,
			).Error; err != nil {
				return fmt.Errorf("delete aspect score: %w", err)
			}

			// 2. Insert record baru dengan created_at eksplisit agar masuk partisi yang benar
			if err := tx.Exec(
				`INSERT INTO testing_aspect_scores (application_id, aspect_code, score, created_at, created_user)
				 VALUES ($1, $2, $3, $4, $5)`,
				applicationID, aspect.AspectCode, aspect.Score, now, "SYSTEM_RECALC",
			).Error; err != nil {
				return fmt.Errorf("insert aspect score: %w", err)
			}

			return nil
		})

		if err != nil {
			log.Printf("[SCORING ERROR] Failed to save aspect score for %s: %v", aspect.AspectCode, err)
		} else {
			log.Printf("[SCORING] Aspect %s score saved: %.2f", aspect.AspectCode, aspect.Score)
		}
	}

	return nil
}

// generateCalculationDetails creates human-readable calculation breakdown
func generateCalculationDetails(aspectScores []AspectScore, finalScore float64, allPassed bool) string {
	details := "=== SCORING CALCULATION DETAILS ===\n\n"

	details += "ASPECT SCORES:\n"
	details += "─────────────────────────────────────\n"

	for _, aspect := range aspectScores {
		status := "✓ PASS"
		if !aspect.IsPassed {
			status = "✗ FAIL"
		}
		details += fmt.Sprintf("%s (%s): %.2f [%s]\n",
			aspect.AspectName, aspect.AspectCode,
			aspect.Score, status)

		for _, sub := range aspect.SubAspects {
			status := ""
			if sub.IsDisabled {
				status = " (DISABLED)"
			}
			details += fmt.Sprintf("  └─ %s: %.2f (weight %.0f%%)%s\n",
				sub.SubAspectName, sub.Score, sub.Weight, status)
		}
	}

	details += "\n─────────────────────────────────────\n"
	details += fmt.Sprintf("FINAL SCORE: %.2f [%s]\n", finalScore, GetScoreLevel(finalScore, "00000"))
	details += fmt.Sprintf("ALL ASPECTS PASSED: %v\n", allPassed)

	return details
}

// GetApplicationScoringBreakdown returns detailed scoring breakdown
func GetApplicationScoringBreakdown(applicationID uint64) (ScoringResult, error) {
	return RefreshApplicationScoring(applicationID)
}
