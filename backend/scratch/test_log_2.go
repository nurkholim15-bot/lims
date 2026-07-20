package main

import (
	"fmt"
	"strings"
)

func main() {
	line := "Pengecekan KOFAS selesai dengan skor 91."
	
	// fallback for scoreCand
	var scoreCand string
	fields := strings.Fields(line)
	if len(fields) >= 2 {
		scoreCand = fields[len(fields)-1]
	}
	fmt.Printf("KOFAS scoreCand: %q\n", scoreCand)
	
	lowerLine := strings.ToLower(line)
	matchedKw := "KOFAS"
	codeIdx := strings.Index(lowerLine, strings.ToLower(matchedKw))
	var textToParse string
	if codeIdx != -1 {
		textToParse = line[codeIdx+len(matchedKw):]
	} else {
		textToParse = line
	}
	
	textToParse = strings.TrimSpace(textToParse)
	words := strings.Fields(textToParse)
	scoreCandClean := ""
	if len(words) >= 2 {
		lastWord := strings.Trim(words[len(words)-1], `.*[]!| `)
		cand := strings.Trim(words[len(words)-2], `:-=*|# `)
		scoreCandClean = lastWord
		fmt.Printf("KOFAS cand: %q, lastWord: %q, clean: %q\n", cand, lastWord, scoreCandClean)
	}
}
