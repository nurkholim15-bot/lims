//go:build linux

package controllers

import (
	"encoding/json"
	"log"
	"math"
	"os"

	"lim-system/models"
	ort "github.com/yalue/onnxruntime_go"
)

func checkAnomaly(appID uint64, aspectCode string, reqItems []struct {
	SubAspectCode string  `json:"sub_aspect_code"`
	ParamCode     string  `json:"param_code"`
	Score         float64 `json:"score"`
	Notes         string  `json:"notes"`
	PhotoPath     string  `json:"photo_path"`
	IsDisabled    bool    `json:"is_disabled"`
}) (bool, float64, map[string]float64, map[string]float64, map[string]float64, error) {
	if models.GetGlobalParam("AI_PQC_ENABLED", "true") != "true" {
		return false, 0.0, nil, nil, nil, nil
	}

	// 1. Find and Load Metadata
	metaPath := findModelFile(aspectCode, "json")
	if metaPath == "" {
		log.Printf("AI PQC warning: metadata file not found for aspect '%s', soft-bypassing check", aspectCode)
		return false, 0.0, nil, nil, nil, nil
	}

	metaBytes, err := os.ReadFile(metaPath)
	if err != nil {
		log.Printf("AI PQC warning: failed to read metadata for aspect '%s', soft-bypassing: %v", aspectCode, err)
		return false, 0.0, nil, nil, nil, nil
	}

	var metadata AspectMetadata
	if err := json.Unmarshal(metaBytes, &metadata); err != nil {
		log.Printf("AI PQC warning: failed to parse metadata for aspect '%s', soft-bypassing: %v", aspectCode, err)
		return false, 0.0, nil, nil, nil, nil
	}

	// Sanitize medians and stds
	cleanMedians := make(map[string]float64)
	for k, v := range metadata.Medians {
		if math.IsNaN(v) {
			cleanMedians[k] = 0.0
		} else {
			cleanMedians[k] = v
		}
	}

	cleanStds := make(map[string]float64)
	for k, v := range metadata.Stds {
		if math.IsNaN(v) {
			cleanStds[k] = 2.0
		} else {
			if v < 2.0 {
				cleanStds[k] = 2.0
			} else {
				cleanStds[k] = v
			}
		}
	}

	// Build and align feature vector
	featuresMap := make(map[string]float64)
	for _, item := range reqItems {
		code := item.SubAspectCode
		if code == "" {
			code = item.ParamCode
		}
		if code != "" {
			featuresMap[code] = item.Score
		}
	}

	inputData := make([]float32, len(metadata.Features))
	for i, featName := range metadata.Features {
		val, ok := featuresMap[featName]
		if !ok || math.IsNaN(val) {
			val = cleanMedians[featName]
		}
		inputData[i] = float32(val)
	}

	// 2. Load ONNX Model & Run Session
	onnxPath := findModelFile(aspectCode, "onnx")
	if onnxPath == "" {
		log.Printf("AI PQC warning: ONNX model file not found for aspect '%s', soft-bypassing check", aspectCode)
		return false, 0.0, nil, nil, nil, nil
	}

	inputNames := []string{"float_input"}
	outputNames := []string{"label", "scores"}
	session, err := ort.NewDynamicAdvancedSession(onnxPath, inputNames, outputNames, nil)
	if err != nil {
		log.Printf("AI PQC warning: failed to create ONNX session for aspect '%s', soft-bypassing: %v", aspectCode, err)
		return false, 0.0, nil, nil, nil, nil
	}
	defer session.Destroy()

	inputShape := ort.NewShape(1, int64(len(metadata.Features)))
	inputTensor, err := ort.NewTensor(inputShape, inputData)
	if err != nil {
		log.Printf("AI PQC warning: failed to create input tensor, soft-bypassing: %v", err)
		return false, 0.0, nil, nil, nil, nil
	}
	defer inputTensor.Destroy()

	outputs := []ort.Value{nil, nil}
	err = session.Run([]ort.Value{inputTensor}, outputs)
	if err != nil {
		log.Printf("AI PQC warning: failed to execute ONNX session, soft-bypassing: %v", err)
		return false, 0.0, nil, nil, nil, nil
	}
	defer outputs[0].Destroy()
	defer outputs[1].Destroy()

	labelTensor, ok1 := outputs[0].(*ort.Tensor[int64])
	scoresTensor, ok2 := outputs[1].(*ort.Tensor[float32])
	if !ok1 || !ok2 {
		log.Printf("AI PQC warning: invalid ONNX output tensor types, soft-bypassing")
		return false, 0.0, nil, nil, nil, nil
	}

	labels := labelTensor.GetData()
	scores := scoresTensor.GetData()

	isAnomaly := labels[0] == -1 || labels[0] == 0
	rawScore := float64(scores[0])
	anomalyScore := math.Max(0.0, math.Min(1.0, 0.5-rawScore))

	// 3. Individual Range Check (Secondary Bounds Validation)
	outOfRangeFeatures := make(map[string]float64)
	for _, featName := range metadata.Features {
		val, ok := featuresMap[featName]
		if !ok {
			continue
		}
		med := cleanMedians[featName]
		margin := cleanStds[featName] * 1.5
		lo := med - margin
		if lo < 0 {
			lo = 0
		}
		hi := med + margin
		if hi > 100.0 {
			hi = 100.0
		}

		if val < lo || val > hi {
			deviation := 999.0
			if margin > 0 {
				deviation = math.Abs(val-med) / margin
			}
			outOfRangeFeatures[featName] = math.Round(deviation*100) / 100
		}
	}

	// 4. Override isolation forest if range bounds are breached
	const MIN_OUT_OF_RANGE = 1
	shapValues := make(map[string]float64)
	if len(outOfRangeFeatures) >= MIN_OUT_OF_RANGE {
		isAnomaly = true
		anomalyScore = math.Max(anomalyScore, 0.55)

		totalDev := 0.0
		for _, dev := range outOfRangeFeatures {
			totalDev += dev
		}
		if totalDev > 0 {
			for k, v := range outOfRangeFeatures {
				shapValues[k] = math.Round((v/totalDev)*100*100) / 100
			}
		} else {
			for k := range outOfRangeFeatures {
				shapValues[k] = math.Round((100.0/float64(len(outOfRangeFeatures)))*100) / 100
			}
		}
	} else if isAnomaly {
		// Calculate original SHAP values (feature contribution)
		shapValues = explainAnomaly(session, inputData, metadata.Features, cleanMedians, rawScore)
	}

	return isAnomaly, math.Round(anomalyScore*10000)/10000, shapValues, cleanMedians, cleanStds, nil
}

func explainAnomaly(session *ort.DynamicAdvancedSession, inputData []float32, features []string, medians map[string]float64, rawScore float64) map[string]float64 {
	contributions := make(map[string]float64)
	baseScore := rawScore

	for i, featName := range features {
		tempInput := make([]float32, len(inputData))
		copy(tempInput, inputData)
		tempInput[i] = float32(medians[featName])

		inputShape := ort.NewShape(1, int64(len(features)))
		inputTensor, err := ort.NewTensor(inputShape, tempInput)
		if err != nil {
			continue
		}
		outputs := []ort.Value{nil, nil}
		err = session.Run([]ort.Value{inputTensor}, outputs)
		inputTensor.Destroy()
		if err != nil {
			continue
		}

		tempScores := outputs[1].(*ort.Tensor[float32]).GetData()
		tempScore := float64(tempScores[0])

		outputs[0].Destroy()
		outputs[1].Destroy()

		contrib := tempScore - baseScore
		if contrib < 0 {
			contrib = 0
		}
		contributions[featName] = contrib
	}

	total := 0.0
	for _, v := range contributions {
		total += v
	}

	shapValues := make(map[string]float64)
	if total > 0 {
		for _, featName := range features {
			shapValues[featName] = math.Round((contributions[featName]/total)*100*100) / 100
		}
	} else {
		for _, featName := range features {
			shapValues[featName] = math.Round((100.0/float64(len(features)))*100) / 100
		}
	}
	return shapValues
}
