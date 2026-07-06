//go:build !linux

package main

func initONNXRuntime() {
	// No-op di Windows/macOS untuk development agar tidak butuh CGO / ONNX Runtime libraries
}

func destroyONNXRuntime() {
	// No-op di Windows/macOS untuk development
}
