package main

import (
	"fmt"
	"strings"
	"regexp"
)

func main() {
	rawText := `[2026-07-20 06:01:00] Memulai pengujian LDIS...
[2026-07-20 06:01:05] Sensor mendeteksi kepadatan.
Nilai untuk KONSI adalah 93.
Hasil KOLOC: 2 (Normal).
Pengecekan KOFAS selesai dengan skor 91.`

	singleLineText := strings.ReplaceAll(rawText, "\n", " ")
	fmt.Println("singleLineText:", singleLineText)

	keywords := []string{"KOFAS", "KOLOC", "KONSI", "KORUS"}
	delimitedKeywords := fmt.Sprintf(`(?:\b[a-zA-Z0-9]{1,2}\s*(?:%s)|(?:%s)|$)`, strings.Join(keywords, "|"), strings.Join(keywords, "|"))
	
	pattern := fmt.Sprintf(`(?:%s)[:\s\-\=\|\#]+(.*?)(?:%s)`, "KONSI", delimitedKeywords)
	re := regexp.MustCompile(pattern)
	
	if matches := re.FindStringSubmatch(singleLineText); len(matches) > 1 {
		fmt.Printf("KONSI rawCaptured: %q\n", matches[1])
	}
	
	pattern2 := fmt.Sprintf(`(?:%s)[:\s\-\=\|\#]+(.*?)(?:%s)`, "KOLOC", delimitedKeywords)
	re2 := regexp.MustCompile(pattern2)
	
	if matches := re2.FindStringSubmatch(singleLineText); len(matches) > 1 {
		fmt.Printf("KOLOC rawCaptured: %q\n", matches[1])
	}
}
