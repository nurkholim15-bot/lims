//go:build !linux

package controllers

// Stub implementations of checkAnomaly and explainAnomaly for non-Linux platforms.
// On Linux, the real ONNX-based implementations in ai_detect_linux.go are used.

func checkAnomaly(appID uint64, aspectCode string, reqItems []AspectResultItem) (bool, float64, map[string]float64, map[string]float64, map[string]float64, error) {
	// AI ONNX detection only runs on Linux in production.
	// On Windows/macOS (development), anomaly check is bypassed.
	return false, 0.0, nil, nil, nil, nil
}
