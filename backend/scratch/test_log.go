package main

import (
	"fmt"
	"strings"
)

func main() {
	line := "Hasil KOLOC: 2 (Normal)."
	lastColonIdx := strings.LastIndex(line, ":")
	var scoreCand string
	if lastColonIdx != -1 {
		rightPart := strings.TrimSpace(line[lastColonIdx+1:])
		words := strings.Fields(rightPart)
		if len(words) > 0 {
			scoreCand = words[len(words)-1]
		}
	}
	
	fmt.Printf("KOLOC scoreCand: %q\n", scoreCand)
	
	// C section
	textToParse := " 2 (Normal)."
	words := strings.Fields(textToParse)
	scoreCandClean := ""
	if len(words) >= 2 {
		lastWord := strings.Trim(words[len(words)-1], `.*[]!| `)
		cand := strings.Trim(words[len(words)-2], `:-=*|# `)
		scoreCandClean = lastWord
		fmt.Printf("KOLOC cand: %q, lastWord: %q, clean: %q\n", cand, lastWord, scoreCandClean)
	}
}
