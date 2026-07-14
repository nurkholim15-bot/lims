//go:build ignore

package main

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	_ "image/gif"
	_ "image/jpeg"
	"image/png"
	"lim-system/database"
	"lim-system/models"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

var expectedScoresLocal = map[string]string{
	"KONSI": "1", "KOPEN": "2", "KOKON": "3", "PEENE": "4", "PEGER": "5", "KOTAN": "6", "KODAY": "7", "PEPEM": "8", "KORUS": "9", "KOFAS": "10",
	"KOPEM": "11", "KOLOC": "12", "KOBEL": "13", "KOBNC": "14", "KOPOL": "15", "PEHAN": "16", "PETAS": "17", "PEPES": "18", "PETUP": "19", "PEBEL": "20",
	"KODES": "21", "KOWAR": "22",
	"KESEL": "1", "KEDAI": "2", "KESEN": "3", "KELCH": "4", "KERUS": "5", "KESUA": "6",
	"KEDRF": "1", "KENEL": "2", "KEPAN": "3", "KENAL": "4", "KERAN": "5", "KERJA": "6", "KERAK": "7", "KETER": "8", "KEAAN": "9",
	"KEBAN": "49", "KEANT": "50", "KEHAN": "51", "KEGET": "52", "KETUR": "53", "KEDAP": "54", "KEACA": "55", "KEAIR": "56", "KEOPE": "57",
	"INPER": "58", "INANT": "59", "INBAT": "60", "INFRE": "61", "INMAN": "62", "INPEM": "63",
}

func cleanScoreWithContextLocal(val string, code string) string {
	valNorm := strings.ToLower(strings.TrimSpace(val))
	if valNorm == "" {
		return val
	}

	// 1. Check in database lims.ocr_score_mappings
	if database.DB != nil {
		var dbMapping models.OCRScoreMapping
		if err := database.DB.Where("LOWER(ocr_value) = LOWER(?)", valNorm).First(&dbMapping).Error; err == nil {
			return dbMapping.MappedValue
		}
	}

	expected, exists := expectedScoresLocal[code]
	if !exists {
		return cleanGarbledScore(val)
	}
	isMatch := func(variations ...string) bool {
		for _, v := range variations {
			if valNorm == strings.ToLower(v) {
				return true
			}
		}
		return false
	}
	switch expected {
	case "1":
		if isMatch("l", "i", "|", "[", "]", "!", "t", "1") { return "1" }
	case "2":
		if isMatch("z", "2") { return "2" }
	case "3":
		if isMatch("m", "3") { return "3" }
	case "5":
		if isMatch("3", "s", "5") { return "5" }
	case "6":
		if isMatch("o", "0", "b", "6") { return "6" }
	case "9":
		if isMatch("3", "g", "q", "6", "9") { return "9" }
	case "11":
		if isMatch("i", "ll", "ii", "1l", "l1", "1i", "i1", "11") { return "11" }
	case "12":
		if isMatch("2", "l2", "i2", "12") { return "12" }
	case "14":
		if isMatch("4", "l4", "i4", "14") { return "14" }
	case "16":
		if isMatch("91", "l6", "i6", "16") { return "16" }
	case "17":
		if isMatch("21", "vw", "v", "w", "l7", "i7", "n", "17") { return "17" }
	case "18":
		if isMatch("8", "l8", "i8", "18") { return "18" }
	case "19":
		if isMatch("9", "l9", "i9", "19") { return "19" }
	case "21":
		if isMatch("2", "2l", "2i", "21") { return "21" }
	case "23":
		if isMatch("l3", "i3", "23") { return "23" }
	case "24":
		if isMatch("hz", "h2", "2a", "24") { return "24" }
	case "25":
		if isMatch("2s", "25") { return "25" }
	case "26":
		if isMatch("2b", "26") { return "26" }
	case "27":
		if isMatch("2", "27") { return "27" }
	case "28":
		if isMatch("sh", "2b", "2h", "28") { return "28" }
	case "29":
		if isMatch("25", "29") { return "29" }
	case "31":
		if isMatch("al", "a1", "3l", "31") { return "31" }
	case "35":
		if isMatch("3g", "35") { return "35" }
	}
	return val
}

func binarizeImage(src image.Image) image.Image {
	bounds := src.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()
	dst := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			c := src.At(bounds.Min.X+x, bounds.Min.Y+y)
			r, g, b, a := c.RGBA()
			if a < 32768 {
				dst.Set(x, y, color.White)
				continue
			}
			lum := (r*299 + g*587 + b*114) / 1000
			if lum < 48000 {
				dst.Set(x, y, color.Black)
			} else {
				dst.Set(x, y, color.White)
			}
		}
	}
	return dst
}

func maskTableColumns(src image.Image, codeMin, codeMax, skorMin, skorMax float64) image.Image {
	bounds := src.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()
	dst := image.NewRGBA(image.Rect(0, 0, w, h))

	codeXStart := int(float64(w) * codeMin)
	codeXEnd := int(float64(w) * codeMax)
	skorXStart := int(float64(w) * skorMin)
	skorXEnd := int(float64(w) * skorMax)

	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			isCodeCol := x >= codeXStart && x <= codeXEnd
			isSkorCol := x >= skorXStart && x <= skorXEnd
			if isCodeCol || isSkorCol {
				dst.Set(x, y, src.At(bounds.Min.X+x, bounds.Min.Y+y))
			} else {
				dst.Set(x, y, color.White)
			}
		}
	}
	return dst
}

func resize2xBilinear(src image.Image) image.Image {
	bounds := src.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()
	newW := w * 2
	newH := h * 2
	dst := image.NewRGBA(image.Rect(0, 0, newW, newH))
	for y := 0; y < newH; y++ {
		fy := float64(y) / 2.0
		y0 := int(fy)
		y1 := y0 + 1
		if y1 >= h {
			y1 = h - 1
		}
		dy := fy - float64(y0)
		for x := 0; x < newW; x++ {
			fx := float64(x) / 2.0
			x0 := int(fx)
			x1 := x0 + 1
			if x1 >= w {
				x1 = w - 1
			}
			dx := fx - float64(x0)
			c00 := src.At(bounds.Min.X+x0, bounds.Min.Y+y0)
			c10 := src.At(bounds.Min.X+x1, bounds.Min.Y+y0)
			c01 := src.At(bounds.Min.X+x0, bounds.Min.Y+y1)
			c11 := src.At(bounds.Min.X+x1, bounds.Min.Y+y1)
			r00, g00, b00, a00 := c00.RGBA()
			r10, g10, b10, a10 := c10.RGBA()
			r01, g01, b01, a01 := c01.RGBA()
			r11, g11, b11, a11 := c11.RGBA()
			interpolate := func(v00, v10, v01, v11 uint32) uint8 {
				val := float64(v00>>8)*(1.0-dx)*(1.0-dy) +
					float64(v10>>8)*dx*(1.0-dy) +
					float64(v01>>8)*(1.0-dx)*dy +
					float64(v11>>8)*dx*dy
				if val > 255 { return 255 }
				if val < 0 { return 0 }
				return uint8(val)
			}
			dst.Set(x, y, color.RGBA{
				R: interpolate(r00, r10, r01, r11),
				G: interpolate(g00, g10, g01, g11),
				B: interpolate(b00, b10, b01, b11),
				A: interpolate(a00, a10, a01, a11),
			})
		}
	}
	return dst
}

func removeGridlines(src image.Image) (image.Image, bool) {
	bounds := src.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()
	if width < 50 || height < 50 {
		return src, false
	}
	isDark := func(x, y int) bool {
		c := src.At(x, y)
		r, g, b, a := c.RGBA()
		if a < 32768 { return false }
		gray := (r*299 + g*587 + b*114) / 1000
		return gray < 58000
	}
	verticalLines := make([]bool, width)
	verticalCount := 0
	for x := 0; x < width; x++ {
		maxRun := 0
		currentRun := 0
		for y := 0; y < height; y++ {
			if isDark(bounds.Min.X+x, bounds.Min.Y+y) {
				currentRun++
				if currentRun > maxRun { maxRun = currentRun }
			} else {
				currentRun = 0
			}
		}
		if maxRun > int(float64(height)*0.40) {
			verticalLines[x] = true
			verticalCount++
		}
	}
	horizontalLines := make([]bool, height)
	horizontalCount := 0
	for y := 0; y < height; y++ {
		maxRun := 0
		currentRun := 0
		for x := 0; x < width; x++ {
			if isDark(bounds.Min.X+x, bounds.Min.Y+y) {
				currentRun++
				if currentRun > maxRun { maxRun = currentRun }
			} else {
				currentRun = 0
			}
		}
		if maxRun > int(float64(width)*0.40) {
			horizontalLines[y] = true
			horizontalCount++
		}
	}
	if verticalCount > int(float64(width)*0.10) || horizontalCount > int(float64(height)*0.10) {
		return src, true
	}
	dst := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			isLine := verticalLines[x] || horizontalLines[y]
			if isLine {
				dst.Set(x, y, color.White)
			} else {
				dst.Set(x, y, src.At(bounds.Min.X+x, bounds.Min.Y+y))
			}
		}
	}
	return dst, false
}

func adaptiveThreshold(src image.Image, windowSize int, C float64) image.Image {
	bounds := src.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()
	lum := make([][]float64, w)
	for x := 0; x < w; x++ {
		lum[x] = make([]float64, h)
		for y := 0; y < h; y++ {
			c := src.At(bounds.Min.X+x, bounds.Min.Y+y)
			r, g, b, _ := c.RGBA()
			lum[x][y] = float64(r*299+g*587+b*114) / 1000.0 / 257.0
		}
	}
	intImg := make([][]float64, w)
	for x := 0; x < w; x++ {
		intImg[x] = make([]float64, h)
	}
	for x := 0; x < w; x++ {
		for y := 0; y < h; y++ {
			val := lum[x][y]
			if x > 0 { val += intImg[x-1][y] }
			if y > 0 { val += intImg[x][y-1] }
			if x > 0 && y > 0 { val -= intImg[x-1][y-1] }
			intImg[x][y] = val
		}
	}
	dst := image.NewRGBA(image.Rect(0, 0, w, h))
	s2 := windowSize / 2
	for x := 0; x < w; x++ {
		for y := 0; y < h; y++ {
			x0 := x - s2
			if x0 < 0 { x0 = 0 }
			y0 := y - s2
			if y0 < 0 { y0 = 0 }
			x1 := x + s2
			if x1 >= w { x1 = w - 1 }
			y1 := y + s2
			if y1 >= h { y1 = h - 1 }
			count := float64((x1 - x0 + 1) * (y1 - y0 + 1))
			sum := intImg[x1][y1]
			if x0 > 0 { sum -= intImg[x0-1][y1] }
			if y0 > 0 { sum -= intImg[x1][y0-1] }
			if x0 > 0 && y0 > 0 { sum += intImg[x0-1][y0-1] }
			mean := sum / count
			curr := lum[x][y]
			if curr < mean*(1.0-C) {
				dst.Set(x, y, color.Black)
			} else {
				dst.Set(x, y, color.White)
			}
		}
	}
	return dst
}

func localPreprocessImage(inputPath string, maskColumns bool) (string, error) {
	inFile, err := os.Open(inputPath)
	if err != nil { return "", err }
	defer inFile.Close()

	src, _, err := image.Decode(inFile)
	if err != nil { return "", err }

	if maskColumns {
		codeMin := 0.12
		codeMax := 0.28
		skorMin := 0.60
		skorMax := 0.98

		fmt.Printf("[Masking] codeMin=%.2f, codeMax=%.2f, skorMin=%.2f, skorMax=%.2f\n", codeMin, codeMax, skorMin, skorMax)
		src = maskTableColumns(src, codeMin, codeMax, skorMin, skorMax)
	}

	var isNatural bool
	src, isNatural = removeGridlines(src)
	src = resize2xBilinear(src)
	if isNatural {
		src = adaptiveThreshold(src, 25, 0.15)
	} else {
		src = binarizeImage(src)
	}
	bounds := src.Bounds()
	padding := 50
	newWidth := bounds.Dx() + 2*padding
	newHeight := bounds.Dy() + 2*padding

	dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))
	draw.Draw(dst, dst.Bounds(), &image.Uniform{color.White}, image.Point{}, draw.Src)
	draw.Draw(dst, image.Rect(padding, padding, padding+bounds.Dx(), padding+bounds.Dy()), src, bounds.Min, draw.Over)

	dir := filepath.Dir(inputPath)
	ext := filepath.Ext(inputPath)
	paddedPath := filepath.Join(dir, fmt.Sprintf("local_padded_%d%s", time.Now().UnixNano(), ext))

	outFile, err := os.Create(paddedPath)
	if err != nil { return "", err }
	defer outFile.Close()

	err = png.Encode(outFile, dst)
	if err != nil { return "", err }

	return paddedPath, nil
}

func runPaddleOCROnWSL(imgPath string, codeMin, codeMax, skorMin, skorMax string) (string, error) {
	cmd := exec.Command("wsl", "python3", "paddle_ocr.py", filepath.ToSlash(imgPath), codeMin, codeMax, skorMin, skorMax)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("PaddleOCR failed: %v, output: %s", err, string(output))
	}
	return string(output), nil
}

func cleanParsedScoreLocal(val string) string {
	val = strings.TrimSpace(val)
	val = strings.Trim(val, `:"'-=[]#| `)
	scorePattern := regexp.MustCompile(`^(\d+(?:[.,]\d+)?)(?:\s+\d+[%]?\s+.*)?$`)
	if matches := scorePattern.FindStringSubmatch(val); len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}
	return val
}

func cleanParsedValueLocal(val string) string {
	val = strings.TrimSpace(val)
	val = strings.Trim(val, `:"'-=[]#| `)
	scorePattern := regexp.MustCompile(`^(\d+(?:[.,]\d+)?)(?:\s+\d+[%]?\s+.*)?$`)
	if matches := scorePattern.FindStringSubmatch(val); len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}
	multiSpaceRegex := regexp.MustCompile(`\s{2,}`)
	if parts := multiSpaceRegex.Split(val, -1); len(parts) > 0 {
		val = strings.TrimSpace(parts[0])
	}
	yearCleanRegex := regexp.MustCompile(`^[1lI|]\s*(19\d\d|20\d\d)$`)
	if yearCleanRegex.MatchString(val) {
		val = yearCleanRegex.ReplaceAllString(val, "$1")
	}
	return val
}

func sanitizeOCRText(txt string) string {
	txt = strings.ReplaceAll(txt, "|", " ")
	ws := regexp.MustCompile(`[\t ]+`)
	txt = ws.ReplaceAllString(txt, " ")
	var lines []string
	for _, line := range strings.Split(txt, "\n") {
		line = strings.TrimSpace(line)
		if line != "" {
			lines = append(lines, line)
		}
	}
	return strings.Join(lines, "\n")
}

func isValidScoreCandidate(cand string, code string) bool {
	cand = strings.TrimSpace(cand)
	if cand == "" {
		return false
	}
	// 1. If it contains a digit, it's a valid numeric score candidate
	if regexp.MustCompile("\\d").MatchString(cand) {
		return true
	}
	// 2. Check if it matches any dropdown option in the database
	if database.DB != nil {
		var dbItems []models.ScoringSubAspectItem
		if err := database.DB.Where("sub_aspect_code = ?", code).Find(&dbItems).Error; err == nil && len(dbItems) > 0 {
			candNorm := strings.ToLower(cand)
			for _, item := range dbItems {
				if strings.ToLower(item.Name) == candNorm {
					return true
				}
				if levenshtein(strings.ToLower(item.Name), candNorm) <= 1 {
					return true
				}
			}
		}
	}
	return false
}

// levenshtein calculates the Levenshtein distance between two strings.

// Robust matchers implementation inside debugger
func normalizeForMatching(s string) string {
	s = strings.ToLower(s)
	s = strings.ReplaceAll(s, "l", "i")
	s = strings.ReplaceAll(s, "|", "i")
	s = strings.ReplaceAll(s, "0", "o")
	return s
}

func levenshtein(s, t string) int {
	d := make([][]int, len(s)+1)
	for i := range d {
		d[i] = make([]int, len(t)+1)
		d[i][0] = i
	}
	for j := range d[0] {
		d[0][j] = j
	}
	for i := 1; i <= len(s); i++ {
		for j := 1; j <= len(t); j++ {
			if s[i-1] == t[j-1] {
				d[i][j] = d[i-1][j-1]
			} else {
				min := d[i-1][j] + 1
				if d[i][j-1]+1 < min {
					min = d[i][j-1] + 1
				}
				if d[i-1][j-1]+1 < min {
					min = d[i-1][j-1] + 1
				}
				d[i][j] = min
			}
		}
	}
	return d[len(s)][len(t)]
}

func bigrams(s string) map[string]bool {
	res := make(map[string]bool)
	s = strings.ToLower(s)
	reg := regexp.MustCompile(`[^a-z0-9]`)
	s = reg.ReplaceAllString(s, "")
	for i := 0; i < len(s)-1; i++ {
		res[s[i:i+2]] = true
	}
	return res
}

func bigramSimilarity(s, t string) float64 {
	bs := bigrams(s)
	bt := bigrams(t)
	if len(bs) == 0 || len(bt) == 0 {
		return 0.0
	}
	intersect := 0
	for k := range bs {
		if bt[k] {
			intersect++
		}
	}
	union := len(bs) + len(bt) - intersect
	return float64(intersect) / float64(union)
}

func cleanGarbledScore(val string) string {
	val = strings.TrimSpace(val)
	val = strings.Trim(val, `:"'-=[]#| `)
	if val == "" {
		return ""
	}
	valLower := strings.ToLower(val)
	if valLower == "l" || valLower == "i" || valLower == "|" || valLower == "t" || valLower == "!" {
		return "1"
	}
	valCleaned := valLower
	valCleaned = strings.ReplaceAll(valCleaned, "sh", "28")
	valCleaned = strings.ReplaceAll(valCleaned, "al", "31")
	valCleaned = strings.ReplaceAll(valCleaned, "3g", "35")
	valCleaned = strings.ReplaceAll(valCleaned, "l", "1")
	valCleaned = strings.ReplaceAll(valCleaned, "i", "1")
	valCleaned = strings.ReplaceAll(valCleaned, "|", "1")
	valCleaned = strings.ReplaceAll(valCleaned, "t", "1")
	valCleaned = strings.ReplaceAll(valCleaned, "!", "1")
	valCleaned = strings.ReplaceAll(valCleaned, "z", "2")
	valCleaned = strings.ReplaceAll(valCleaned, "q", "9")
	valCleaned = strings.ReplaceAll(valCleaned, "g", "9")
	valCleaned = strings.ReplaceAll(valCleaned, "s", "5")
	valCleaned = strings.ReplaceAll(valCleaned, "o", "0")
	valCleaned = strings.ReplaceAll(valCleaned, "b", "6")
	valCleaned = strings.ReplaceAll(valCleaned, "h", "8")
	valCleaned = strings.ReplaceAll(valCleaned, "n", "17")
	valCleaned = strings.ReplaceAll(valCleaned, "?", "2")
	numPattern := regexp.MustCompile(`\d+(?:[.,]\d+)?`)
	if matchedNum := numPattern.FindString(valCleaned); matchedNum != "" {
		return strings.ReplaceAll(matchedNum, ",", ".")
	}
	hasLetter := regexp.MustCompile(`[a-zA-Z]`)
	if hasLetter.MatchString(val) {
		return val
	}
	return ""
}

func parseOCRTestResultsRobust(rawText string, subAspects []models.ScoringSubAspect) map[string]string {
	extractedValues := make(map[string]string)
	pages := strings.Split(rawText, "\n-- PAGE SPLIT --\n")
	for _, pageText := range pages {
		pageValues := parseSinglePageRobust(pageText, subAspects)
		for k, v := range pageValues {
			extractedValues[k] = v
		}
	}
	return extractedValues
}

func parseSinglePageRobust(pageText string, subAspects []models.ScoringSubAspect) map[string]string {
	extractedValues := make(map[string]string)
	lines := strings.Split(pageText, "\n")
	regNonAlphaNum := regexp.MustCompile(`[^a-zA-Z0-9]`)

	// 1. Group active sub-aspects by aspect_code
	aspectCounts := make(map[string]int)
	for _, sa := range subAspects {
		aspectCounts[sa.AspectCode] = 0
	}

	// 2. Count fuzzy code matches to identify the active aspect on this page
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" { continue }
		words := strings.Fields(line)
		for _, w := range words {
			cleanW := strings.Trim(w, `:"'-=[]#| `)
			cleanW = regNonAlphaNum.ReplaceAllString(cleanW, "")
			cleanW = regexp.MustCompile(`^\d+`).ReplaceAllString(cleanW, "")
			if len(cleanW) >= 4 && len(cleanW) <= 6 {
				cleanW = normalizeCodeWithKeywordsLocal(cleanW, subAspects)
				normW := normalizeForMatching(cleanW)
				for _, sa := range subAspects {
					cNorm := normalizeForMatching(sa.Code)
					if levenshtein(normW, cNorm) <= 1 {
						aspectCounts[sa.AspectCode]++
					}
				}
			}
		}
	}

	saList := subAspects
	type lineMatch struct {
		sa    models.ScoringSubAspect
		score string
		line  int
	}
	var matches []lineMatch
	usedSAs := make(map[string]bool)
	var bottomScores []string
	var pendingScore string
	pendingScoreLine := -1
	hasAnyColon := false

	for lineIdx, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" { continue }
		lowerLine := strings.ToLower(line)
		if strings.Contains(lowerLine, "aspect") || strings.Contains(lowerLine, "code") ||
			strings.Contains(lowerLine, "name") || strings.Contains(lowerLine, "skor") ||
			strings.Contains(lowerLine, "score") || strings.Contains(lowerLine, "nilai") {
			continue
		}

		// A. Parse colon delimiter and extract score candidate
		var scoreCand string
		lastColonIdx := strings.LastIndex(line, ":")
		matchLine := line
		if lastColonIdx != -1 && lastColonIdx > 0 && lastColonIdx < len(line)-1 {
			hasAnyColon = true
			matchLine = strings.TrimSpace(line[:lastColonIdx])
			
			rightPart := strings.TrimSpace(line[lastColonIdx+1:])
			// If there are multiple space-separated words after the colon (e.g. table border '|' read as '1' or 'l'),
			// the actual score is the last word.
			words := strings.Fields(rightPart)
			if len(words) > 0 {
				scoreCand = words[len(words)-1]
			} else {
				scoreCand = ""
			}
		} else {
			// Old logic for backward compatibility
			var cols []string
			multiSpace := regexp.MustCompile(`\s{2,}`)
			cols = multiSpace.Split(line, -1)
			var cleanCols []string
			for _, col := range cols {
				c := strings.TrimSpace(col)
				if c != "" { cleanCols = append(cleanCols, c) }
			}
			if len(cleanCols) >= 2 {
				scoreCand = cleanCols[len(cleanCols)-1]
			} else {
				fields := strings.Fields(line)
				if len(fields) >= 2 {
					scoreCand = fields[len(fields)-1]
				}
			}
		}

		// B. Match sub-aspect code and name using matchLine
		var bestSA models.ScoringSubAspect
		bestScore := -1.0
		for _, sa := range saList {
			if usedSAs[sa.Code] { continue }
			codeScore := 0.0
			cNorm := normalizeForMatching(sa.Code)
			words := strings.Fields(matchLine)
			bestWordDist := 999
			for _, w := range words {
				cleanW := strings.Trim(w, `:"'-=[]#| `)
				cleanW = regNonAlphaNum.ReplaceAllString(cleanW, "")
				cleanW = regexp.MustCompile(`^\d+`).ReplaceAllString(cleanW, "")
				if len(cleanW) >= 4 && len(cleanW) <= 6 {
					cleanW = normalizeCodeWithKeywordsLocal(cleanW, subAspects)
					normW := normalizeForMatching(cleanW)
					dist := levenshtein(normW, cNorm)
					if dist < bestWordDist { bestWordDist = dist }
				}
			}
			if bestWordDist <= 2 {
				codeScore = 1.0 - (float64(bestWordDist) / 5.0)
			}
			nameScore := bigramSimilarity(matchLine, sa.Name)
			totalScore := codeScore*0.5 + nameScore*0.5
			if totalScore > bestScore {
				bestScore = totalScore
				bestSA = sa
			}
		}

		// C. Clean score candidate (discarding overall sequence numbers in borders-off layout)
		cleanedScore := ""
		if bestScore >= 0.20 {
			seqNo := expectedScoresLocal[bestSA.Code]
			
			// Find the segment after the matched code or keyword in the line
			matchedKw := bestSA.Code
			lowerLine := strings.ToLower(line)
			kwsToCheck := []string{bestSA.Code, bestSA.OCRKeywords, bestSA.OCRKeywords1, bestSA.OCRKeywords2}
			for _, kw := range kwsToCheck {
				if kw == "" {
					continue
				}
				kwClean := kw
				if strings.Contains(kwClean, "|") {
					kwClean = strings.TrimSpace(strings.Split(kwClean, "|")[0])
				}
				if kwClean != "" && strings.Contains(lowerLine, strings.ToLower(kwClean)) {
					matchedKw = kwClean
					break
				}
			}

			var textToParse string
			codeIdx := strings.Index(lowerLine, strings.ToLower(matchedKw))
			if codeIdx != -1 {
				textToParse = line[codeIdx+len(matchedKw):]
			} else {
				textToParse = line
			}

			// If there is a colon in textToParse, only parse the segment after the last colon
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
				if seqNo != "" && (lastWord == seqNo || lastWord == seqNo+"." || levenshtein(lastWord, seqNo) <= 1) && isValidScoreCandidate(cand, bestSA.Code) {
					scoreCandClean = cand
				} else {
					scoreCandClean = lastWord
				}
			}
			if scoreCandClean != "" && len(scoreCandClean) <= 5 {
				isCodeWord := false
				for _, sa := range saList {
					if strings.Contains(strings.ToLower(scoreCandClean), strings.ToLower(sa.Code)) {
						isCodeWord = true
						break
					}
				}
				if !isCodeWord {
					// 1. Try mapping the raw score candidate directly first (prioritizing custom database mappings like 'u9' -> '49')
					cleanedScore = cleanScoreWithContextLocal(scoreCandClean, bestSA.Code)
					if cleanedScore == "" || cleanedScore == scoreCandClean {
						// 2. If no direct mapping exists, fall back to cleaning garbled characters and mapping the cleaned score
						cleanedGarbled := cleanGarbledScore(scoreCandClean)
						cleanedScore = cleanScoreWithContextLocal(cleanedGarbled, bestSA.Code)
					}
				}
			}
		} else {
			if scoreCand != "" && len(scoreCand) <= 5 {
				cleanedScore = cleanGarbledScore(scoreCand)
			}
		}

		// D. Match assignment and look-back/look-ahead local lookups
		if bestScore >= 0.20 {
			usedSAs[bestSA.Code] = true
			
			// Look-back: Check if we have a pending score from the immediately preceding line
			if cleanedScore == "" && pendingScore != "" && (lineIdx + 1 - pendingScoreLine <= 1) {
				cleanedScore = cleanScoreWithContextLocal(pendingScore, bestSA.Code)
				pendingScore = ""
				pendingScoreLine = -1
			}

			matches = append(matches, lineMatch{
				sa:    bestSA,
				score: cleanedScore,
				line:  lineIdx + 1,
			})
		} else {
			// Look-ahead: If this line has a score but didn't match an aspect,
			// check if we can assign it to the previous line's match
			if cleanedScore != "" {
				assignedToPrev := false
				if len(matches) > 0 {
					lastIdx := len(matches) - 1
					if matches[lastIdx].score == "" && (lineIdx + 1 - matches[lastIdx].line <= 2) {
						prevCleanedScore := cleanScoreWithContextLocal(cleanedScore, matches[lastIdx].sa.Code)
						if prevCleanedScore == "" {
							prevCleanedScore = cleanScoreWithContextLocal(scoreCand, matches[lastIdx].sa.Code)
						}
						if prevCleanedScore != "" {
							matches[lastIdx].score = prevCleanedScore
							assignedToPrev = true
						}
					}
				}
				if !assignedToPrev {
					pendingScore = cleanedScore
					pendingScoreLine = lineIdx + 1
					bottomScores = append(bottomScores, cleanedScore)
				}
			}
		}
	}

	// Map matches to results
	for _, m := range matches {
		if m.score != "" {
			extractedValues[m.sa.Code] = m.score
		}
	}

	// Fallback to global bottomScores ONLY if no colons were used on the page.
	if !hasAnyColon {
		bottomScoreIdx := 0
		for _, m := range matches {
			if m.score == "" {
				if bottomScoreIdx < len(bottomScores) {
					extractedValues[m.sa.Code] = bottomScores[bottomScoreIdx]
					bottomScoreIdx++
				}
			}
		}
	}
	return extractedValues
}

func parseVerticalColumns(rawText string, subAspects []models.ScoringSubAspect) map[string]string {
	result := make(map[string]string)
	lines := strings.Split(rawText, "\n")
	scoreHeaderIdx := -1
	for i, line := range lines {
		lowerLine := strings.ToLower(line)
		if strings.Contains(lowerLine, "score") || strings.Contains(lowerLine, "nilai") || strings.Contains(lowerLine, "skor") {
			scoreHeaderIdx = i
			break
		}
	}
	if scoreHeaderIdx == -1 { return result }

	var codes []string
	activeCodes := make(map[string]string)
	for _, sa := range subAspects {
		activeCodes[normalizeForMatching(sa.Code)] = sa.Code
	}
	for i := 0; i < scoreHeaderIdx; i++ {
		line := lines[i]
		words := strings.Fields(line)
		for _, w := range words {
			cleanW := strings.Trim(w, `:"'-=[]#| `)
			cleanW = normalizeCodeWithKeywordsLocal(cleanW, subAspects)
			normW := normalizeForMatching(cleanW)
			if actualCode, exists := activeCodes[normW]; exists {
				codes = append(codes, actualCode)
				break
			}
		}
	}

	var scores []string
	numPattern := regexp.MustCompile(`\d+(?:[.,]\d+)?`)
	for i := scoreHeaderIdx + 1; i < len(lines); i++ {
		line := lines[i]
		trimmed := strings.TrimSpace(line)
		if trimmed == "" { continue }
		if strings.HasSuffix(trimmed, "%") { continue }
		trimmed = strings.ReplaceAll(trimmed, "%", "9")
		val := ""
		if matchedNum := numPattern.FindString(trimmed); matchedNum != "" {
			val = strings.ReplaceAll(matchedNum, ",", ".")
		}
		scores = append(scores, val)
	}

	minLen := len(codes)
	if len(scores) < minLen { minLen = len(scores) }
	for i := 0; i < minLen; i++ {
		result[codes[i]] = scores[i]
	}
	return result
}

func runExtraction(rawText string, subAspects []models.ScoringSubAspect, itemsBySubAspect map[string][]models.ScoringSubAspectItem) {
	singleLineText := strings.ReplaceAll(rawText, "\n", "  ")
	singleLineText = strings.ReplaceAll(singleLineText, "\r", "  ")
	singleLineText = strings.TrimSpace(singleLineText)

	// Collect keywords
	var keywords []string
	for _, sa := range subAspects {
		keywords = append(keywords, regexp.QuoteMeta(sa.Code))
		if sa.OCRKeywords != "" {
			kw := sa.OCRKeywords
			if strings.Contains(kw, "|") {
				kw = strings.TrimSpace(strings.Split(kw, "|")[0])
			}
			if kw != "" {
				keywords = append(keywords, regexp.QuoteMeta(kw))
			}
		}
		if sa.OCRKeywords1 != "" {
			kw := sa.OCRKeywords1
			if strings.Contains(kw, "|") {
				kw = strings.TrimSpace(strings.Split(kw, "|")[0])
			}
			if kw != "" {
				keywords = append(keywords, regexp.QuoteMeta(kw))
			}
		}
		if sa.OCRKeywords2 != "" {
			kw := sa.OCRKeywords2
			if strings.Contains(kw, "|") {
				kw = strings.TrimSpace(strings.Split(kw, "|")[0])
			}
			if kw != "" {
				keywords = append(keywords, regexp.QuoteMeta(kw))
			}
		}
	}
	keywords = append(keywords, "nama", "alutsista", "peralatan", "kategori", "merk", "model", "varian", "batch", "seri", "negara", "spec")
	// Add robust pattern to capture garbled OCR parameter codes (uppercase words of length 3-6 starting with X, K, P, F, I, A, R)
	keywords = append(keywords, `(?-i:\b[XKPFIAR][A-Z0-9]{2,5}\b)`)
	delimitedKeywords := fmt.Sprintf(`(?:\b[a-zA-Z0-9]{1,2}\s*(?:%s)|(?:%s)|$)`, strings.Join(keywords, "|"), strings.Join(keywords, "|"))

	extractedValues := make(map[string]string)
	for _, sa := range subAspects {
		var val string
		// Prioritize code as search keyword
		var escapedParts []string
		escapedParts = append(escapedParts, regexp.QuoteMeta(sa.Code))

		if sa.OCRKeywords != "" {
			kw := sa.OCRKeywords
			if strings.Contains(kw, "|") {
				kw = strings.TrimSpace(strings.Split(kw, "|")[0])
			}
			if kw != "" {
				escapedParts = append(escapedParts, regexp.QuoteMeta(kw))
			}
		}
		if sa.OCRKeywords1 != "" {
			kw := sa.OCRKeywords1
			if strings.Contains(kw, "|") {
				kw = strings.TrimSpace(strings.Split(kw, "|")[0])
			}
			if kw != "" {
				escapedParts = append(escapedParts, regexp.QuoteMeta(kw))
			}
		}
		if sa.OCRKeywords2 != "" {
			kw := sa.OCRKeywords2
			if strings.Contains(kw, "|") {
				kw = strings.TrimSpace(strings.Split(kw, "|")[0])
			}
			if kw != "" {
				escapedParts = append(escapedParts, regexp.QuoteMeta(kw))
			}
		}

		if len(escapedParts) > 0 {
			var patternParts []string
					for _, part := range escapedParts {
						if part == sa.Code && regexp.MustCompile("^[A-Z0-9]{3,6}$").MatchString(part) {
							patternParts = append(patternParts, fmt.Sprintf("\\b\\d*%s\\b", part))
						} else {
							patternParts = append(patternParts, fmt.Sprintf("(?i)%s", part))
						}
					}
					pattern := fmt.Sprintf(`(?:%s)[:\s\-\=\|\#]+(.*?)(?:%s)`, strings.Join(patternParts, "|"), delimitedKeywords)
			re := regexp.MustCompile(pattern)
			if matches := re.FindStringSubmatch(singleLineText); len(matches) > 1 {
				rawCaptured := matches[1]
				if strings.Contains(rawCaptured, ":") {
					parts := strings.Split(rawCaptured, ":")
					rawCaptured = parts[len(parts)-1]
				}
				val = cleanParsedScoreLocal(rawCaptured)
				
				// Discard overall sequence number from captured value in borders-off layout
				seqNo := expectedScoresLocal[sa.Code]
				valClean := strings.Trim(val, `:-= `)
				words := strings.Fields(valClean)
				if len(words) == 1 {
					val = strings.Trim(words[0], `.*[]!| `)
				} else if len(words) >= 2 {
					lastWord := strings.Trim(words[len(words)-1], `.*[]!| `)
					cand := strings.Trim(words[len(words)-2], `:-= `)
					if seqNo != "" && (lastWord == seqNo || lastWord == seqNo+"." || levenshtein(lastWord, seqNo) <= 1) && isValidScoreCandidate(cand, sa.Code) {
						if cand != "" {
							val = cand
						} else {
							val = ""
						}
					} else {
						val = words[len(words)-1]
					}
				}

				if val != "" {
					valCleaned := cleanScoreWithContextLocal(val, sa.Code)
					hasDropdown := len(itemsBySubAspect[sa.Code]) > 0
					
					// If value contains a space and has a trailing number, extract it (handles table borders read as '1' or 'l')
					trimmedVal := strings.TrimSpace(valCleaned)
					if strings.Contains(trimmedVal, " ") {
						trailingNumRe := regexp.MustCompile(`\b(\d+(?:[.,]\d+)?)\s*$`)
						if m := trailingNumRe.FindStringSubmatch(trimmedVal); len(m) > 1 {
							valCleaned = strings.ReplaceAll(m[1], ",", ".")
						}
					}

					if len(strings.TrimSpace(valCleaned)) >= 15 {
						trailingNumRe := regexp.MustCompile(`\b(\d+(?:[.,]\d+)?)\s*$`)
						if m := trailingNumRe.FindStringSubmatch(strings.TrimSpace(valCleaned)); len(m) > 1 {
							valCleaned = strings.ReplaceAll(m[1], ",", ".")
						} else {
							valCleaned = ""
						}
					}
					hasDigit := regexp.MustCompile(`\d`).MatchString(valCleaned)
					if hasDigit || (hasDropdown && len(strings.TrimSpace(valCleaned)) > 0 && len(strings.TrimSpace(valCleaned)) < 15) {
						extractedValues[sa.Code] = valCleaned
					}
				}
			}
		}
	}

	// MERGE FALLBACKS ALWAYS
	robustData := parseOCRTestResultsRobust(rawText, subAspects)
	for k, v := range robustData {
		if val, exists := extractedValues[k]; !exists || val == "" {
			extractedValues[k] = v
		}
	}

	verticalData := parseVerticalColumns(rawText, subAspects)
	for k, v := range verticalData {
		if val, exists := extractedValues[k]; !exists || val == "" {
			extractedValues[k] = v
		}
	}

	// Recheck context cleanup
	for code, val := range extractedValues {
		extractedValues[code] = cleanScoreWithContextLocal(val, code)
	}

	fmt.Printf("Total parsed: %d sub-aspects:\n", len(extractedValues))
	for _, sa := range subAspects {
		if v, ok := extractedValues[sa.Code]; ok {
			fmt.Printf("  %-6s: %s\n", sa.Code, v)
		} else {
			fmt.Printf("  %-6s: MISSING (Keywords: %s)\n", sa.Code, sa.OCRKeywords)
		}
	}
}

func main() {
	_ = godotenv.Load(".env")
	database.InitDB()

	var subAspects []models.ScoringSubAspect
	database.DB.Where("is_active = ?", true).Order("code").Find(&subAspects)

	var subAspectItems []models.ScoringSubAspectItem
	itemsBySubAspect := make(map[string][]models.ScoringSubAspectItem)
	if err := database.DB.Find(&subAspectItems).Error; err == nil {
		for _, itm := range subAspectItems {
			itemsBySubAspect[itm.SubAspectCode] = append(itemsBySubAspect[itm.SubAspectCode], itm)
		}
	}

	files := []string{"IMG-1.pdf", "IMG-2.pdf"}
	for _, fn := range files {
		fmt.Printf("\n=================== MASKED TEST ON: %s ===================\n", fn)
		
		imgPrefix := "scratch/masked_page"
		ppmCmd := exec.Command("wsl", "pdftoppm", "-png", "-r", "150", fn, imgPrefix)
		ppmOutput, ppmErr := ppmCmd.CombinedOutput()
		if ppmErr != nil {
			fmt.Printf("pdftoppm failed: %v, output: %s\n", ppmErr, string(ppmOutput))
			continue
		}

		matches, _ := filepath.Glob(imgPrefix + "-*.png")
		if len(matches) == 0 {
			fmt.Println("No page images found after pdftoppm")
			continue
		}

		sort.Slice(matches, func(i, j int) bool {
			return matches[i] < matches[j]
		})

		var combinedText []string
		for _, imgPath := range matches {
			defer os.Remove(imgPath)

			// Fetch coordinate limits from global parameters
			codeMin := models.GetGlobalParam("ocr_code_col_min", "0.12")
			codeMax := models.GetGlobalParam("ocr_code_col_max", "0.28")
			skorMin := models.GetGlobalParam("ocr_skor_col_min", "0.70")
			skorMax := models.GetGlobalParam("ocr_skor_col_max", "0.98")

			// Disable physical column masking, use python midpoint filtering
			paddedPath, prepErr := localPreprocessImage(imgPath, false)
			if prepErr != nil {
				fmt.Printf("localPreprocessImage failed for %s: %v\n", imgPath, prepErr)
				continue
			}
			defer os.Remove(paddedPath)

			paddleText, ocrErr := runPaddleOCROnWSL(paddedPath, codeMin, codeMax, skorMin, skorMax)
			if ocrErr != nil {
				fmt.Printf("PaddleOCR failed for %s: %v\n", imgPath, ocrErr)
				continue
			}
			cleanedPaddleText := sanitizeOCRText(paddleText)
			combinedText = append(combinedText, cleanedPaddleText)
		}

		fullText := strings.Join(combinedText, "\n-- PAGE SPLIT --\n")
		fmt.Println("\nRunning extraction with Always Fallback merged on PaddleOCR text:")
		runExtraction(fullText, subAspects, itemsBySubAspect)
	}
}

// normalizeCodeWithKeywordsLocal maps raw OCR codes to their official sub-aspect code based on database-configured ocr_keywords, ocr_keywords_1, and ocr_keywords_2.
func normalizeCodeWithKeywordsLocal(rawWord string, subAspects []models.ScoringSubAspect) string {
	rawWordNorm := strings.ToUpper(strings.TrimSpace(rawWord))
	if rawWordNorm == "" {
		return rawWord
	}

	// 1. Check direct matches
	for _, sa := range subAspects {
		if strings.ToUpper(sa.Code) == rawWordNorm {
			return sa.Code
		}
	}

	// 2. Check ocr_keywords
	for _, sa := range subAspects {
		kw := sa.OCRKeywords
		if strings.Contains(kw, "|") {
			kw = strings.TrimSpace(strings.Split(kw, "|")[0])
		}
		if kw != "" && strings.ToUpper(kw) == rawWordNorm {
			return sa.Code
		}
	}

	// 3. Check ocr_keywords_1
	for _, sa := range subAspects {
		kw := sa.OCRKeywords1
		if strings.Contains(kw, "|") {
			kw = strings.TrimSpace(strings.Split(kw, "|")[0])
		}
		if kw != "" && strings.ToUpper(kw) == rawWordNorm {
			return sa.Code
		}
	}

	// 4. Check ocr_keywords_2
	for _, sa := range subAspects {
		kw := sa.OCRKeywords2
		if strings.Contains(kw, "|") {
			kw = strings.TrimSpace(strings.Split(kw, "|")[0])
		}
		if kw != "" && strings.ToUpper(kw) == rawWordNorm {
			return sa.Code
		}
	}

	return rawWord
}

