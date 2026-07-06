package views

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// Response structure for uniform API output
type Response struct {
	Status   int         `json:"status"`
	Message  string      `json:"message"`
	Data     interface{} `json:"data,omitempty"`
	Metadata interface{} `json:"metadata,omitempty"`
	Error    string      `json:"error,omitempty"`
}

func Success(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, Response{
		Status:  http.StatusOK,
		Message: message,
		Data:    data,
	})
}

func SuccessWithMeta(c *gin.Context, data interface{}, meta interface{}, message string) {
	c.JSON(http.StatusOK, Response{
		Status:   http.StatusOK,
		Message:  message,
		Data:     data,
		Metadata: meta,
	})
}

func Created(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusCreated, Response{
		Status:  http.StatusCreated,
		Message: message,
		Data:    data,
	})
}

func Error(c *gin.Context, status int, message string, err string) {
	c.JSON(status, Response{
		Status:  status,
		Message: message,
		Error:   err,
	})
}

func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message, "Unauthorized access")
}

func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message, "Access forbidden")
}

func BadRequest(c *gin.Context, message string, err string) {
	Error(c, http.StatusBadRequest, message, err)
}

func InternalError(c *gin.Context, message string, err string) {
	Error(c, http.StatusInternalServerError, message, err)
}

func SuccessWithPaging(c *gin.Context, data interface{}, message string, total int64, page int, limit int) {
	c.JSON(http.StatusOK, Response{
		Status:  http.StatusOK,
		Message: message,
		Data:    data,
		Metadata: gin.H{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message, "Resource not found")
}
