package models

import "time"

type AgentChat struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	SenderID     uint      `json:"sender_id"`
	SenderName   string    `gorm:"type:varchar(30)" json:"sender_name"`
	ReceiverID   uint      `json:"receiver_id"`
	ReceiverName string    `gorm:"type:varchar(30)" json:"receiver_name"`
	Message      string    `gorm:"type:text" json:"message"`
	CreatedAt    time.Time `json:"created_at"`
	CreatedUser  string    `gorm:"type:varchar(30)" json:"created_user"`
}

func (AgentChat) TableName() string {
	return "chat_sch.agent_chats"
}

