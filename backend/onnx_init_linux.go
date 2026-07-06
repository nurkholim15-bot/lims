//go:build linux

package main

import (
	"log"
	"os"
	"path/filepath"
	"runtime"
	"lim-system/models"
	ort "github.com/yalue/onnxruntime_go"
)

func initONNXRuntime() {
	if models.GetGlobalParam("AI_PQC_ENABLED", "true") != "true" {
		return
	}
	var libName string
	if runtime.GOOS == "windows" {
		libName = "onnxruntime.dll"
	} else {
		libName = "libonnxruntime.so"
	}

	// Candidates for finding the dynamic library
	candidates := []string{
		filepath.Join("lib", libName),
		filepath.Join("backend", "lib", libName),
		filepath.Join("..", "backend", "lib", libName),
		libName,
	}

	var foundPath string
	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			foundPath = c
			break
		}
	}

	if foundPath == "" {
		log.Printf("Warning: Dynamic library %s not found in candidates %v. ONNX Runtime initialization might fail.", libName, candidates)
		foundPath = filepath.Join("lib", libName)
	}

	ort.SetSharedLibraryPath(foundPath)
	log.Printf("Initializing ONNX Runtime using shared library at: %s", foundPath)
	err := ort.InitializeEnvironment()
	if err != nil {
		log.Fatalf("Failed to initialize ONNX Runtime: %v", err)
	}
}

func destroyONNXRuntime() {
	if models.GetGlobalParam("AI_PQC_ENABLED", "true") == "true" {
		ort.DestroyEnvironment()
	}
}
