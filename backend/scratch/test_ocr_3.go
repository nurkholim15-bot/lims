package main

import (
	"fmt"
	"strings"
	"regexp"
)

type models_ScoringSubAspect struct {
	Code string
	Name string
	AspectCode string
}

func normalizeCodeWithKeywords(c string, sa []models_ScoringSubAspect) string { return c }
func normalizeForMatching(c string) string { return strings.ToLower(c) }
func levenshtein(s, t string) int {
	// simple stub for "konsi" == "konsi" -> 0
	if s == t { return 0 }
	return 5
}
func bigramSimilarity(s, t string) float64 { return 0.6 }
func isValidScoreCandidate(s, c string) bool { return true }
func cleanScoreWithContext(s, c string) string { return s }
func cleanGarbledScore(s string) string { return s }

func main() {
	rawText := `[2026-07-20 06:01:00] Memulai pengujian LDIS...
[2026-07-20 06:01:05] Sensor mendeteksi kepadatan.
Nilai untuk KONSI adalah 93.
Hasil KOLOC: 2 (Normal).
Pengecekan KOFAS selesai dengan skor 91.`

	saList := []models_ScoringSubAspect{
		{Code: "KONSI", Name: "Konstruksi-Dimensi", AspectCode: "KONPE"},
		{Code: "KOLOC", Name: "Konstruksi-Frekuensi lock", AspectCode: "KONPE"},
		{Code: "KOFAS", Name: "Konstruksi-Fasilitas anti Pernika", AspectCode: "KONPE"},
	}

	extractedValues := make(map[string]string)
	lines := strings.Split(rawText, "\n")
	regNonAlphaNum := regexp.MustCompile(`[^a-zA-Z0-9]`)

	type lineMatch struct {
		sa    models_ScoringSubAspect
		score string
		line  int
	}
	var matches []lineMatch

	for lineIdx, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" { continue }
		
		var scoreCand string
		lastColonIdx := strings.LastIndex(line, ":")
		matchLine := line
		if lastColonIdx != -1 && lastColonIdx > 0 && lastColonIdx < len(line)-1 {
			matchLine = strings.TrimSpace(line[:lastColonIdx])
			rightPart := strings.TrimSpace(line[lastColonIdx+1:])
			words := strings.Fields(rightPart)
			if len(words) > 0 { scoreCand = words[len(words)-1] }
		} else {
			fields := strings.Fields(line)
			if len(fields) >= 2 { scoreCand = fields[len(fields)-1] }
		}

		var bestSA models_ScoringSubAspect
		bestScore := -1.0
		for _, sa := range saList {
			codeScore := 0.0
			cNorm := normalizeForMatching(sa.Code)
			words := strings.Fields(matchLine)
			bestWordDist := 999
			for _, w := range words {
				cleanW := strings.Trim(w, `:"'-=[]#| `)
				cleanW = regNonAlphaNum.ReplaceAllString(cleanW, "")
				cleanW = regexp.MustCompile(`^\d+`).ReplaceAllString(cleanW, "")
				if len(cleanW) >= 4 && len(cleanW) <= 6 {
					normW := normalizeForMatching(cleanW)
					dist := levenshtein(normW, cNorm)
					if dist < bestWordDist { bestWordDist = dist }
				}
			}
			if bestWordDist <= 2 { codeScore = 1.0 - (float64(bestWordDist) / 5.0) }
			nameScore := bigramSimilarity(matchLine, sa.Name)
			totalScore := codeScore*0.5 + nameScore*0.5
			if totalScore > bestScore {
				bestScore = totalScore
				bestSA = sa
			}
		}

		cleanedScore := ""
		if bestScore >= 0.20 {
			matchedKw := bestSA.Code
			lowerLine := strings.ToLower(line)
			var textToParse string
			codeIdx := strings.Index(lowerLine, strings.ToLower(matchedKw))
			if codeIdx != -1 {
				textToParse = line[codeIdx+len(matchedKw):]
			} else {
				textToParse = line
			}
			if strings.Contains(textToParse, ":") {
				parts := strings.Split(textToParse, ":")
				textToParse = parts[len(parts)-1]
			}
			textToParse = strings.TrimSpace(textToParse)
			words := strings.Fields(textToParse)
			scoreCandClean := ""
			if len(words) == 1 {
				scoreCandClean = strings.Trim(words[0], `.*[]!| `)
			} else if len(words) >= 2 {
				lastWord := strings.Trim(words[len(words)-1], `.*[]!| `)
				cand := strings.Trim(words[len(words)-2], `:-=*|# `)
				scoreCandClean = lastWord // simplified
			}
			if scoreCandClean != "" {
				cleanedScore = scoreCandClean
			}
		}

		if bestScore >= 0.20 {
			matches = append(matches, lineMatch{sa: bestSA, score: cleanedScore, line: lineIdx + 1})
		}
	}
	
	for _, m := range matches {
		if m.score != "" { extractedValues[m.sa.Code] = m.score }
	}
	
	fmt.Printf("Robust Extracted: %+v\n", extractedValues)
}
