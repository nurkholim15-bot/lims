package services

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"lim-system/utils"
)

// MinioServiceInterface defines the methods for storage integration
type MinioServiceInterface interface {
	UploadPDF(ctx context.Context, fileName string, reader io.Reader, size int64) (string, error)
	UploadGenericFile(ctx context.Context, fileName string, reader io.Reader, size int64, contentType string) (string, error)
	DownloadPDF(ctx context.Context, objectPath string) (*minio.Object, error)
}

type minioServiceImpl struct {
	client *minio.Client
}

func (s *minioServiceImpl) UploadPDF(ctx context.Context, fileName string, reader io.Reader, size int64) (string, error) {
	bucketName := os.Getenv("MINIO_BUCKET")
	now := time.Now()
	objectPath := fmt.Sprintf("%d/%02d/%s", now.Year(), now.Month(), fileName)

	exists, err := s.client.BucketExists(ctx, bucketName)
	if err != nil {
		return "", err
	}
	if !exists {
		err = s.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return "", err
		}
	}

	_, err = s.client.PutObject(ctx, bucketName, objectPath, reader, size, minio.PutObjectOptions{
		ContentType: "application/pdf",
	})
	return objectPath, err
}

func (s *minioServiceImpl) UploadGenericFile(ctx context.Context, fileName string, reader io.Reader, size int64, contentType string) (string, error) {
	bucketName := os.Getenv("MINIO_BUCKET")
	now := time.Now()
	objectPath := fmt.Sprintf("%d/%02d/%s", now.Year(), now.Month(), fileName)

	exists, err := s.client.BucketExists(ctx, bucketName)
	if err != nil {
		return "", err
	}
	if !exists {
		err = s.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return "", err
		}
	}

	_, err = s.client.PutObject(ctx, bucketName, objectPath, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return objectPath, err
}

func (s *minioServiceImpl) DownloadPDF(ctx context.Context, objectPath string) (*minio.Object, error) {
	bucketName := os.Getenv("MINIO_BUCKET")
	return s.client.GetObject(ctx, bucketName, objectPath, minio.GetObjectOptions{})
}

// mockMinioService is a mock implementation for development
// It stores files locally in ./public/uploads/ so they can be served
type mockMinioService struct{}

func (s *mockMinioService) UploadPDF(ctx context.Context, fileName string, reader io.Reader, size int64) (string, error) {
	return s.saveLocal(fileName, reader)
}

func (s *mockMinioService) UploadGenericFile(ctx context.Context, fileName string, reader io.Reader, size int64, contentType string) (string, error) {
	return s.saveLocal(fileName, reader)
}

func (s *mockMinioService) saveLocal(fileName string, reader io.Reader) (string, error) {
	now := time.Now()
	// Build a sub-path like 2026/03/filename.ext
	subPath := fmt.Sprintf("%d/%02d/%s", now.Year(), now.Month(), fileName)
	localDir := fmt.Sprintf("./public/uploads/%d/%02d", now.Year(), now.Month())

	if err := os.MkdirAll(localDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload dir: %v", err)
	}

	localPath := fmt.Sprintf("%s/%s", localDir, fileName)
	f, err := os.Create(localPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer f.Close()

	if _, err = io.Copy(f, reader); err != nil {
		return "", fmt.Errorf("failed to write file: %v", err)
	}

	fmt.Printf("[MOCK MINIO] Saved locally: %s -> %s\n", fileName, localPath)
	// Return an object path that DownloadPDF can resolve
	return subPath, nil
}

func (s *mockMinioService) DownloadPDF(ctx context.Context, objectPath string) (*minio.Object, error) {
	// In development mode, files are stored locally. We signal the controller
	// to serve the file directly by returning a special error containing the local path.
	// The controller checks for this and falls back to local serving.
	fmt.Printf("[MOCK MINIO] Download requested for: %s\n", objectPath)
	return nil, fmt.Errorf("local:%s", objectPath)
}

// Global Minio service instance
var Minio MinioServiceInterface

func InitMinio() {
	if os.Getenv("MINIO_ENV") == "development" {
		Minio = &mockMinioService{}
		fmt.Println("MinIO Service: Using MOCK implementation (Development Mode)")
		return
	}

	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")
	encryptedSecret := os.Getenv("MINIO_SECRET_KEY_ENCRYPTED")
	if encryptedSecret != "" {
		decrypted, err := utils.DecryptAES(encryptedSecret, os.Getenv("JWT_SECRET"))
		if err == nil {
			secretKey = decrypted
		} else {
			log.Printf("Warning: failed to decrypt MINIO_SECRET_KEY_ENCRYPTED: %v", err)
		}
	}
	useSSL := os.Getenv("MINIO_USE_SSL") == "true"

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("Failed to initialize MinIO: %v", err)
	}

	Minio = &minioServiceImpl{client: client}
	fmt.Println("MinIO Service: Using REAL implementation")

	// Auto-create bucket if not exists
	bucketName := os.Getenv("MINIO_BUCKET")
	if bucketName != "" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		exists, err := client.BucketExists(ctx, bucketName)
		if err == nil && !exists {
			fmt.Printf("MinIO: Creating bucket '%s'...\n", bucketName)
			err = client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
			if err != nil {
				log.Printf("MinIO Warning: Failed to create bucket: %v", err)
			}
		} else if err != nil {
			log.Printf("MinIO Warning: Failed to check bucket existence: %v", err)
		} else {
			fmt.Printf("MinIO: Bucket '%s' is ready\n", bucketName)
		}
	}
}

