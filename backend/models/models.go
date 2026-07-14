package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var globalParamCache map[string]string = make(map[string]string)
var roleCache map[uint]string = make(map[uint]string)
var menuCache map[uint][]Menu = make(map[uint][]Menu) // roleID -> menus

// RefreshParamCache loads all global parameters into memory for fast access
func RefreshParamCache(db *gorm.DB) {
	var params []GlobalParameter
	if err := db.Find(&params).Error; err != nil {
		return
	}

	newCache := make(map[string]string)
	for _, p := range params {
		newCache[p.ParamKey] = p.ParamValue
	}
	globalParamCache = newCache
}

// GetGlobalParam retrieves a parameter value from the cache or returns a default
func GetGlobalParam(key string, defaultValue string) string {
	if val, ok := globalParamCache[key]; ok {
		return val
	}
	return defaultValue
}

// RefreshRoleMenuCache loads all roles and their menus into memory
func RefreshRoleMenuCache(db *gorm.DB) {
	var roles []Role
	if err := db.Find(&roles).Error; err != nil {
		return
	}

	newRoleCache := make(map[uint]string)
	newMenuCache := make(map[uint][]Menu)

	for _, r := range roles {
		newRoleCache[r.ID] = r.Name
		
		var menus []Menu
		err := db.Table("menus").
			Select("menus.*").
			Joins("join role_menus on role_menus.menu_id = menus.id").
			Where("role_menus.role_id = ?", r.ID).
			Order("menus.order asc").
			Find(&menus).Error
		
		if err == nil {
			newMenuCache[r.ID] = menus
		}
	}
	roleCache = newRoleCache
	menuCache = newMenuCache
}

// GetRoleName retrieves a role name from the cache
func GetRoleName(roleID uint) string {
	if name, ok := roleCache[roleID]; ok {
		return name
	}
	return "UNKNOWN"
}

// --- Partner Methods ---
func (p *Partner) GetAll(db *gorm.DB) ([]Partner, error) {
	var results []Partner
	err := db.Preload("Type").Preload("City").Find(&results).Error
	return results, err
}

func (p *Partner) Create(db *gorm.DB) error {
	return db.Create(p).Error
}

func (p *Partner) Update(db *gorm.DB) error {
	return db.Save(p).Error
}

// --- MaterialCategory Methods ---
func (m *MaterialCategory) GetAll(db *gorm.DB) ([]MaterialCategory, error) {
	var results []MaterialCategory
	err := db.Find(&results).Error
	return results, err
}

func (m *MaterialCategory) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(m).Error
}

func (m *MaterialCategory) Create(db *gorm.DB) error {
	return db.Create(m).Error
}

func (m *MaterialCategory) Update(db *gorm.DB) error {
	return db.Save(m).Error
}

func (m *MaterialCategory) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&MaterialCategory{}).Error
}




// --- Brand, Model, Variant Methods ---
func (b *Brand) GetAll(db *gorm.DB) ([]Brand, error) {
	var results []Brand
	err := db.Find(&results).Error
	return results, err
}
func (b *Brand) Create(db *gorm.DB) error { return db.Create(b).Error }

func (m *Model) GetAll(db *gorm.DB) ([]Model, error) {
	var results []Model
	err := db.Preload("Brand").Find(&results).Error
	return results, err
}
func (m *Model) Create(db *gorm.DB) error { return db.Create(m).Error }

func (v *Variant) GetAll(db *gorm.DB) ([]Variant, error) {
	var results []Variant
	err := db.Preload("Model.Brand").Find(&results).Error
	return results, err
}
func (v *Variant) Create(db *gorm.DB) error { return db.Create(v).Error }

// --- CRUD Methods / Repository Logic ---

func (u *User) GetByUsername(db *gorm.DB, username string) error {
	return db.Preload("Role").Where("username = ?", username).First(u).Error
}

func (u *User) GetByID(db *gorm.DB, id uint) error {
	return db.Preload("Role").First(u, id).Error
}

func (m *Menu) GetByRoleID(db *gorm.DB, roleID uint) ([]Menu, error) {
	// Try cache first
	if menus, ok := menuCache[roleID]; ok {
		return menus, nil
	}

	var menus []Menu
	err := db.Table("menus").
		Select("menus.*").
		Joins("join role_menus on role_menus.menu_id = menus.id").
		Where("role_menus.role_id = ?", roleID).
		Order("menus.order asc").
		Find(&menus).Error
	return menus, err
}

func (g *GlobalParameter) GetAll(db *gorm.DB) ([]GlobalParameter, error) {
	var params []GlobalParameter
	err := db.Find(&params).Error
	return params, err
}

func (s *UserSession) Create(db *gorm.DB) error {
	return db.Create(s).Error
}

func (s *UserSession) Delete(db *gorm.DB, token string, userID uint) error {
	return db.Where("token = ? AND user_id = ?", token, userID).Delete(&UserSession{}).Error
}

func (u *User) UpdatePassword(db *gorm.DB, newPassword string) error {
	return db.Model(u).Update("password", newPassword).Error
}

type User struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Username       string         `gorm:"unique;not null;type:varchar(30)" json:"username"`
	Password       string         `gorm:"not null;type:varchar(225)" json:"-"`
	Email          string         `gorm:"type:varchar(30)" json:"email"`
	Phone          string         `gorm:"type:varchar(30)" json:"phone"`
	RoleID         uint           `json:"role_id"`
	Role           Role           `gorm:"foreignKey:RoleID" json:"role"`
	TelegramChatID string         `gorm:"-" json:"telegram_chat_id"`
	WhatsAppPhone  string         `gorm:"-" json:"whatsapp_phone"`
	TeamsUserID    string         `gorm:"-" json:"teams_user_id"`
	LastPwdChange  time.Time      `json:"last_pwd_change"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	CreatedUser    string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser    string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	DeletedUser    string         `gorm:"type:varchar(30)" json:"deleted_user"`
	ForcePwdChange bool           `gorm:"column:force_pwd_change;default:false;not null" json:"force_pwd_change"`
	IsActive       bool           `gorm:"column:is_active;default:true;not null" json:"is_active"`
	IdleTimeoutMinutes *int       `gorm:"column:idle_timeout_minutes" json:"idle_timeout_minutes"`
}

type HistUser struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `gorm:"index" json:"user_id"`
	Username       string    `gorm:"type:varchar(30)" json:"username"`
	Password       string    `gorm:"type:varchar(225)" json:"-"`
	Email          string    `gorm:"type:varchar(30)" json:"email"`
	Phone          string    `gorm:"type:varchar(30)" json:"phone"`
	RoleID         uint      `json:"role_id"`
	LastPwdChange  time.Time `json:"last_pwd_change"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	CreatedUser    string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser    string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt      time.Time `json:"deleted_at"`
	DeletedUser    string    `gorm:"type:varchar(30)" json:"deleted_user"`
	ForcePwdChange bool      `gorm:"column:force_pwd_change;default:false;not null" json:"force_pwd_change"`
	IsActive       bool      `gorm:"column:is_active;default:true;not null" json:"is_active"`
	IdleTimeoutMinutes *int      `gorm:"column:idle_timeout_minutes" json:"idle_timeout_minutes"`
}

type Role struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"unique;not null;type:varchar(40)" json:"name"`
	Description string         `gorm:"type:varchar(60)" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	Menus       []Menu         `gorm:"many2many:role_menus;" json:"menus"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user"`
}

type HistRole struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	RoleID      uint      `gorm:"index" json:"role_id"`
	Name        string    `gorm:"type:varchar(40)" json:"name"`
	Description string    `gorm:"type:varchar(60)" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   time.Time `json:"deleted_at"`
	DeletedUser string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

type Menu struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ParentID    uint           `json:"parent_id"`
	Title       string         `gorm:"type:varchar(50)" json:"title"`
	Icon        string         `gorm:"type:varchar(40)" json:"icon"`
	Path        string         `gorm:"type:varchar(60)" json:"path"`
	Order       int            `json:"order"`
	IsPassword  bool           `gorm:"type:boolean;default:false" json:"is_password"` // NEW: Require password for this menu
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user"`
}

type HistMenu struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	MenuID      uint      `gorm:"index" json:"menu_id"`
	ParentID    uint      `json:"parent_id"`
	Title       string    `gorm:"type:varchar(50)" json:"title"`
	Icon        string    `gorm:"type:varchar(40)" json:"icon"`
	Path        string    `gorm:"type:varchar(60)" json:"path"`
	Order       int       `json:"order"`
	IsPassword  bool      `gorm:"type:boolean;default:false" json:"is_password"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   time.Time `json:"deleted_at"`
	DeletedUser string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

type RoleMenu struct {
	RoleID      uint      `gorm:"primaryKey"`
	MenuID      uint      `gorm:"primaryKey"`
	CreatedAt   time.Time `json:"created_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
}

type HistRoleMenu struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	RoleID      uint      `gorm:"index" json:"role_id"`
	MenuID      uint      `gorm:"index" json:"menu_id"`
	CreatedAt   time.Time `json:"created_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
	DeletedAt   time.Time `json:"deleted_at"`
	DeletedUser string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistRoleMenu) TableName() string {
	return "hist_role_menus"
}

type UserSession struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `gorm:"index" json:"user_id"`
	Token          string    `gorm:"index;unique;not null;type:varchar(225)" json:"token"`
	ExpiresAt      time.Time `json:"expires_at"`
	IPAddress      string    `gorm:"type:varchar(30)" json:"ip_address"`
	CreatedAt      time.Time `json:"created_at"`
	CreatedUser    string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedAt      time.Time `json:"updated_at"`
	UpdatedUser    string    `gorm:"type:varchar(30)" json:"updated_user"`
	ClientVersion  string    `gorm:"type:varchar(50)" json:"client_version"`
	ClientPlatform string    `gorm:"type:varchar(50)" json:"client_platform"`
	UserAgent      string    `gorm:"type:varchar(255)" json:"user_agent"`
	LastActivityAt time.Time `gorm:"column:last_activity_at" json:"last_activity_at"`
}

type OtpCode struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Code      string    `gorm:"not null;type:varchar(10)" json:"code"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

func (OtpCode) TableName() string {
	return "otp_codes"
}

func SaveOTP(db *gorm.DB, userID uint, code string, expiresAt time.Time) error {
	// Hapus OTP lama user ini agar tidak menumpuk
	db.Where("user_id = ?", userID).Delete(&OtpCode{})
	
	otp := OtpCode{
		UserID:    userID,
		Code:      code,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now(),
	}
	return db.Create(&otp).Error
}

func VerifyOTP(db *gorm.DB, userID uint, code string) (bool, error) {
	// Hapus OTP kedaluwarsa secara berkala saat verifikasi dipanggil
	db.Where("expires_at < ?", time.Now()).Delete(&OtpCode{})

	var otp OtpCode
	err := db.Where("user_id = ? AND code = ? AND expires_at > ?", userID, code, time.Now()).First(&otp).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	
	// Hapus OTP setelah berhasil diverifikasi agar tidak bisa digunakan ulang
	db.Delete(&otp)
	return true, nil
}

type GlobalParameter struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ParamKey    string         `gorm:"unique;not null;type:varchar(100)" json:"param_key"`
	ParamValue  string         `gorm:"type:text" json:"param_value"`
	Description string         `gorm:"type:varchar(225)" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistGlobalParameter struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	GpID        uint           `gorm:"index" json:"gp_id"`
	ParamKey    string         `gorm:"type:varchar(100)" json:"param_key"`
	ParamValue  string         `gorm:"type:varchar(100)" json:"param_value"`
	Description string         `gorm:"type:varchar(225)" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

// --- Master Data ---

type Partner struct {
	ID           uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string          `gorm:"unique;not null;type:varchar(60)" json:"name"`
	TypeCode     string          `gorm:"type:varchar(5)" json:"type_code"`
	Type         PartnerType     `gorm:"foreignKey:TypeCode;references:Code" json:"type"`
	Alamat       string          `gorm:"type:varchar(225)" json:"alamat"`
	CityCode     string          `gorm:"type:varchar(5)" json:"city_code"`
	City         City            `gorm:"foreignKey:CityCode;references:CityCode" json:"city"`
	PicName      string          `gorm:"type:varchar(60)" json:"pic_name"`
	PicEmail     string          `gorm:"type:varchar(40)" json:"pic_email"`
	PicPhone     string          `gorm:"type:varchar(20)" json:"pic_phone"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	CreatedUser  string          `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string          `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt    gorm.DeletedAt  `gorm:"index" json:"-"`
	DeletedUser  string          `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistPartner struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PartnerID    uint64    `gorm:"index" json:"partner_id"`
	Name         string    `gorm:"type:varchar(60)" json:"name"`
	TypeCode     string    `gorm:"type:varchar(5)" json:"type_code"`
	Alamat       string    `gorm:"type:varchar(225)" json:"alamat"`
	CityCode     string    `gorm:"type:varchar(5)" json:"city_code"`
	PicName      string    `gorm:"type:varchar(60)" json:"pic_name"`
	PicEmail     string    `gorm:"type:varchar(40)" json:"pic_email"`
	PicPhone     string    `gorm:"type:varchar(20)" json:"pic_phone"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedUser  string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedUser  string    `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type MaterialCategory struct {
	Code        string         `gorm:"primaryKey;type:varchar(5)" json:"code"`
	Name        string         `gorm:"unique;not null;type:varchar(60)" json:"name"` // e.g., Senjata, Amunisi
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistMaterialCategory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	McCodeRef string    `gorm:"column:mc_code_ref;index;type:varchar(5)" json:"mc_code_ref"`
	Code      string    `gorm:"type:varchar(5)" json:"code"`
	Name      string    `gorm:"type:varchar(60)" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	CreatedUser string  `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string  `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt time.Time `json:"deleted_at"`
	DeletedUser string  `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistMaterialCategory) TableName() string {
	return "hist_material_categories"
}


// TestingPlan merepresentasikan table testing_plans
type TestingPlan struct {
	ID            uint          `gorm:"primaryKey" json:"id"`
	ApplicationID uint64          `gorm:"not null;type:bigint;index" json:"application_id"`
	AspectCode    string        `gorm:"type:varchar(50)" json:"aspect_code"`
	Aspect        ScoringAspect `gorm:"foreignKey:AspectCode;references:Code" json:"aspect"`
	LocationCode  string        `gorm:"type:varchar(5)" json:"location_code"`
	Location      Location      `gorm:"foreignKey:LocationCode;references:Code" json:"location"`
	ScheduledDate *time.Time    `json:"scheduled_date"`
	CreatedAt     time.Time     `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedUser   string        `gorm:"type:varchar(30)" json:"updated_user"`
}

func (TestingPlan) TableName() string {
	return "testing_plans"
}






type Origin struct {
	Code        string         `gorm:"primaryKey;type:varchar(5)" json:"code"` // e.g., IDN, USA, DEU
	Name        string         `gorm:"unique;not null;type:varchar(60)" json:"name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistOrigin struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OriginCode  string    `gorm:"index;type:varchar(5)" json:"origin_code"`
	Code        string    `gorm:"type:varchar(5)" json:"code"`
	Name        string    `gorm:"type:varchar(60)" json:"name"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedUser string    `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (o *Origin) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(o).Error
}
func (o *Origin) Update(db *gorm.DB) error { return db.Save(o).Error }
func (o *Origin) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&Origin{}).Error
}

type Brand struct {
	Code                 string           `gorm:"primaryKey;type:varchar(5)" json:"code"` // e.g., PINDD, LOCKH
	Name                 string           `gorm:"unique;not null;type:varchar(60)" json:"name"`
	MaterialCategoryCode string           `gorm:"type:varchar(5)" json:"material_category_code"`
	MaterialCategory     MaterialCategory `gorm:"foreignKey:MaterialCategoryCode" json:"material_category"`
	OriginCode           string           `gorm:"type:varchar(5)" json:"origin_code"`
	Origin               Origin           `gorm:"foreignKey:OriginCode" json:"origin"`
	CreatedAt            time.Time        `json:"created_at"`
	UpdatedAt            time.Time        `json:"updated_at"`
	CreatedUser          string           `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser          string           `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt            gorm.DeletedAt   `gorm:"index" json:"-"`
	DeletedUser          string           `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistBrand struct {
	ID                   uint      `gorm:"primaryKey" json:"id"`
	BrandCodeRef         string    `gorm:"column:brand_code_ref;index;type:varchar(5)" json:"brand_code_ref"`
	Code                 string    `gorm:"type:varchar(5)" json:"code"`
	Name                 string    `gorm:"type:varchar(60)" json:"name"`
	MaterialCategoryCode string    `gorm:"type:varchar(5)" json:"material_category_code"`
	OriginCode           string    `gorm:"type:varchar(5)" json:"origin_code"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
	CreatedUser          string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser          string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt            time.Time `json:"deleted_at"`
	DeletedUser          string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistBrand) TableName() string {
	return "hist_brands"
}


func (b *Brand) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(b).Error
}
func (b *Brand) Update(db *gorm.DB) error { return db.Save(b).Error }
func (b *Brand) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&Brand{}).Error
}

type Model struct {
	Code        string         `gorm:"primaryKey;type:varchar(5)" json:"code"`
	Name        string         `gorm:"unique;not null;type:varchar(60)" json:"name"`
	BrandCode   string         `gorm:"type:varchar(5)" json:"brand_code"`
	Brand       Brand          `gorm:"foreignKey:BrandCode;references:Code" json:"brand"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistModel struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ModelCode   string    `gorm:"index;type:varchar(5)" json:"model_code"`
	Code        string    `gorm:"type:varchar(5)" json:"code"`
	Name        string    `gorm:"type:varchar(60)" json:"name"`
	BrandCode   string    `gorm:"type:varchar(5)" json:"brand_code"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedUser string    `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (m *Model) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(m).Error
}
func (m *Model) Update(db *gorm.DB) error { return db.Save(m).Error }
func (m *Model) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&Model{}).Error
}

type Variant struct {
	Code        string         `gorm:"primaryKey;type:varchar(5)" json:"code"`
	Name        string         `gorm:"unique;not null;type:varchar(60)" json:"name"`
	ModelCode   string         `gorm:"type:varchar(5)" json:"model_code"`
	Model       Model          `gorm:"foreignKey:ModelCode;references:Code" json:"model"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistVariant struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	VariantCodeRef string    `gorm:"column:variant_code_ref;index;type:varchar(5)" json:"variant_code_ref"`
	Code           string    `gorm:"type:varchar(5)" json:"code"`
	Name           string    `gorm:"type:varchar(60)" json:"name"`
	ModelCode      string    `gorm:"type:varchar(5)" json:"model_code"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	CreatedUser    string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser    string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt      time.Time `json:"deleted_at"`
	DeletedUser    string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistVariant) TableName() string {
	return "hist_variants"
}


func (v *Variant) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(v).Error
}
func (v *Variant) Update(db *gorm.DB) error { return db.Save(v).Error }
func (v *Variant) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&Variant{}).Error
}

// --- Transaction Data ---

// type TestingApplication struct {


// TestingReportAi merepresentasikan tabel testing_report_ais
type TestingReportAi struct {
	ID            uint64         `gorm:"primaryKey;type:bigint" json:"id"`
	ApplicationID uint64         `gorm:"type:bigint;index;not null" json:"application_id"`
	ReportAi      string         `gorm:"type:text" json:"report_ai"`
	CreatedAt     time.Time      `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	CreatedUser   string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser   string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	DeletedUser   string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (TestingReportAi) TableName() string { return "lims.testing_report_ais" }

// TestingPqcAiAnomaly merepresentasikan tabel testing_pqc_ai_anomalies
type TestingPqcAiAnomaly struct {
	ID            uint64         `gorm:"primaryKey;type:bigint" json:"id"`
	ApplicationID uint64         `gorm:"type:bigint;index;not null" json:"application_id"`
	AspectFailure datatypes.JSON `gorm:"type:jsonb" json:"aspect_failure"`
	CreatedAt     time.Time      `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	CreatedUser   string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser   string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	DeletedUser   string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (TestingPqcAiAnomaly) TableName() string { return "lims.testing_pqc_ai_anomalies" }

// TestingApplication merepresentasikan table testing_applications
type TestingApplication struct {
	ID                    uint64              `gorm:"primaryKey;type:bigint" json:"id"`
	RegNumber             string              `gorm:"type:varchar(30);not null;index" json:"reg_number"`
	Status                string              `gorm:"type:varchar(15);index" json:"status"`
	PartnerID             uint64              `gorm:"type:bigint" json:"partner_id"`
	Partner               Partner             `gorm:"foreignKey:PartnerID" json:"partner"`
	RequestLetterPath     string              `gorm:"type:varchar(100)" json:"request_letter_path"`

	IsDocsComplete        bool                `json:"is_docs_complete"`
	VerificationNotes     string              `gorm:"type:varchar(225)" json:"verification_notes"`
	EquipmentNo           int                 `gorm:"default:1" json:"equipment_no"`
	EquipmentTotal        int                 `gorm:"default:1" json:"equipment_total"`
	ApprovalNotes         string              `gorm:"type:varchar(225)" json:"approval_notes"`
	TestPlanDocPath       string              `gorm:"type:varchar(225)" json:"test_plan_doc_path"`
	MethodologyCode       *string             `gorm:"type:varchar(5)" json:"methodology_code"`
	Methodology           Methodology         `gorm:"foreignKey:MethodologyCode" json:"methodology"`
	LabMethodologyCode    *string             `gorm:"type:varchar(5)" json:"lab_methodology_code"`
	LabMethodology        Methodology         `gorm:"foreignKey:LabMethodologyCode" json:"lab_methodology"`
	FieldMethodologyCode  *string             `gorm:"type:varchar(5)" json:"field_methodology_code"`
	FieldMethodology      Methodology         `gorm:"foreignKey:FieldMethodologyCode" json:"field_methodology"`
	PackageID             *uint               `gorm:"type:int" json:"package_id"`
	Package               *TestingPackage     `gorm:"foreignKey:PackageID" json:"package"`
	FinalScore            float64             `json:"final_score"`
	AnalysisNotes         string              `gorm:"type:varchar(225)" json:"analysis_notes"`
	FinalStatus           string              `gorm:"type:varchar(60)" json:"final_status"`
	ReportDocPath         string              `gorm:"type:varchar(225)" json:"report_doc_path"`
	CertificatePath       string              `gorm:"type:varchar(225)" json:"certificate_path"`
	CertificateNum        string              `gorm:"type:varchar(100)" json:"certificate_num"`
	ExpiryDate            *time.Time          `json:"expiry_date"`
	CamundaProcID         string              `gorm:"type:varchar(100);column:camunda_process_id" json:"camunda_process_id"`
	CreatedAt             time.Time           `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedAt             time.Time           `json:"updated_at"`
	CreatedUser           string              `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser           string              `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt             gorm.DeletedAt      `gorm:"index" json:"deleted_at"`
	AspectsPassed         *bool               `json:"aspects_passed"`
	LabTeams              []TesterApplication `gorm:"foreignKey:ApplicationID;where:team_type='LAB'" json:"lab_teams"`
	FieldTeams            []TesterApplication `gorm:"foreignKey:ApplicationID;where:team_type='FIELD'" json:"field_teams"`
	ExecutionResults      []TestingResult     `gorm:"foreignKey:ApplicationID" json:"execution_results"`
	TestingPlans          []TestingPlan       `gorm:"foreignKey:ApplicationID" json:"testing_plans"`
	TesterApplications    []TesterApplication  `gorm:"foreignKey:ApplicationID" json:"tester_applications"`
	AspectScores          []TestingAspectScore `gorm:"foreignKey:ApplicationID" json:"aspect_scores"`
	EquipmentID           *uint64              `gorm:"index" json:"equipment_id"`
	Equipment             TestingEquipment     `gorm:"foreignKey:EquipmentID" json:"equipment"`
	Invoice               *Invoice             `gorm:"foreignKey:ApplicationID" json:"invoice"`
	TestingReportAi       *TestingReportAi     `gorm:"foreignKey:ApplicationID" json:"testing_report_ai"`
	PqcAiAnomaly          *TestingPqcAiAnomaly `gorm:"foreignKey:ApplicationID" json:"testing_pqc_ai_anomaly"`
}

// removed TableName() to allow dynamic targeting in controllers

// MasterTester menyimpan data master tim penguji.
type MasterTester struct {
	TesterID        string         `gorm:"primaryKey;type:char(5)" json:"tester_id"`
	Name            string         `gorm:"type:varchar(60);not null" json:"name"`
	Position        string         `gorm:"type:varchar(20)" json:"position"`
	MethodologyCode string         `gorm:"type:char(5)" json:"methodology_code"`
	Methodology     Methodology    `gorm:"references:Code" json:"methodology"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	CreatedUser     string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser     string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (MasterTester) TableName() string { return "master_testers" }

type HistMasterTester struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	TesterIDRef     string    `gorm:"column:tester_id_ref;index;type:char(5)" json:"tester_id_ref"`
	TesterID        string    `gorm:"type:char(5)" json:"tester_id"`
	Name            string    `gorm:"type:varchar(60)" json:"name"`
	Position        string    `gorm:"type:varchar(20)" json:"position"`
	MethodologyCode string    `gorm:"type:char(5)" json:"methodology_code"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	CreatedUser     string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt       time.Time `json:"deleted_at"`
	DeletedUser     string    `gorm:"type:varchar(30)" json:"deleted_user"`
}


func (HistMasterTester) TableName() string { return "hist_master_testers" }

// TesterApplication menyimpan anggota tim uji per pengajuan.
type TesterApplication struct {
	ID              uint         `gorm:"primaryKey" json:"id"`
	ApplicationID   uint64       `gorm:"not null;type:bigint;index" json:"application_id"`
	AspectCode      string       `gorm:"type:varchar(50);index" json:"aspect_code"`
	MethodologyCode string       `gorm:"type:char(5)" json:"methodology_code"`
	Methodology     Methodology  `gorm:"references:Code" json:"methodology"`
	TesterID        string       `gorm:"type:char(5);not null" json:"tester_id"`
	Tester          MasterTester `gorm:"references:TesterID" json:"tester"`
	Position        string       `gorm:"type:varchar(50)" json:"position"`
	TeamType        string       `gorm:"type:varchar(10)" json:"team_type"` // LAB | FIELD
	CreatedAt       time.Time    `gorm:"primaryKey;not null" json:"created_at"`
	CreatedUser     string       `gorm:"type:varchar(30)" json:"created_user"`
}


type TestType struct {
	Code        string         `gorm:"primaryKey;type:varchar(5)" json:"code"`
	Name        string         `gorm:"unique;not null;type:varchar(60)" json:"name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistTestType struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	TestTypeCode string    `gorm:"column:test_type_code;index" json:"test_type_code"`
	Code         string    `gorm:"type:varchar(5)" json:"code"`
	Name         string    `gorm:"type:varchar(60)" json:"name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedUser  string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt    time.Time `json:"deleted_at"`
	DeletedUser  string    `gorm:"type:varchar(30)" json:"deleted_user"`
}


func (HistTestType) TableName() string { return "hist_test_types" }


func (t *TestType) GetAll(db *gorm.DB) ([]TestType, error) {
	var items []TestType
	err := db.Find(&items).Error
	return items, err
}

func (t *TestType) Create(db *gorm.DB) error {
	return db.Create(t).Error
}

func (t *TestType) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(t).Error
}

func (t *TestType) Update(db *gorm.DB) error {
	return db.Save(t).Error
}

func (t *TestType) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&TestType{}).Error
}


type Province struct {
	ProvinceCode string         `gorm:"primaryKey;column:province_code;type:varchar(5)" json:"province_code"`
	Name        string         `gorm:"type:varchar(60);not null" json:"province_name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistProvince struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	ProvinceCodeRef string    `gorm:"index;type:varchar(5)" json:"province_code_ref"`
	ProvinceCode    string    `gorm:"type:varchar(5)" json:"province_code"`
	ProvinceName    string    `gorm:"column:province_name;type:varchar(60)" json:"province_name"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	CreatedUser     string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedUser     string    `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (p *Province) GetByCode(db *gorm.DB, code string) error {
	return db.Where("province_code = ?", code).First(p).Error
}
func (p *Province) Create(db *gorm.DB) error { return db.Create(p).Error }
func (p *Province) Update(db *gorm.DB) error { return db.Save(p).Error }
func (p *Province) Delete(db *gorm.DB, code string) error {
	return db.Where("province_code = ?", code).Delete(&Province{}).Error
}

type City struct {
	CityCode     string         `gorm:"primaryKey;column:city_code;type:varchar(5)" json:"city_code"`
	Name         string         `gorm:"type:varchar(60);not null" json:"city_name"`
	ProvinceCode string         `gorm:"type:varchar(5);index" json:"province_code"`
	Province     Province       `gorm:"foreignKey:ProvinceCode;references:ProvinceCode" json:"province"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	CreatedUser  string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser  string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
	GMTOffset    int            `gorm:"type:int;default:7" json:"gmt_offset"` // GMT offset, e.g., 7 for WIB, 8 for WITA
}

type HistCity struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CityCodeRef string    `gorm:"column:city_code_ref;index;type:varchar(5)" json:"city_code_ref"`
	CityCode    string    `gorm:"column:city_code;type:varchar(5)" json:"city_code"`
	CityName    string    `gorm:"column:city_name;type:varchar(60)" json:"city_name"`
	ProvinceCode string   `gorm:"column:province_code;type:varchar(5)" json:"province_code"`
	GMTOffset    int      `gorm:"column:gmt_offset" json:"gmt_offset"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedUser  string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt    time.Time `json:"deleted_at"`
	DeletedUser  string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistCity) TableName() string {
	return "hist_cities"
}


func (c *City) GetByCode(db *gorm.DB, code string) error {
	return db.Where("city_code = ?", code).First(c).Error
}
func (c *City) Create(db *gorm.DB) error { return db.Create(c).Error }
func (c *City) Update(db *gorm.DB) error { return db.Save(c).Error }
func (c *City) Delete(db *gorm.DB, code string) error {
	return db.Where("city_code = ?", code).Delete(&City{}).Error
}

type Location struct {
	Code         string         `gorm:"primaryKey;type:varchar(5)" json:"code"`
	Name         string         `gorm:"unique;not null;type:varchar(60)" json:"name"`
	TestTypeCode string         `gorm:"type:varchar(5)" json:"test_type_code"`
	TestType     TestType       `gorm:"foreignKey:TestTypeCode" json:"test_type"`
	CityCode     string         `gorm:"type:varchar(5);index" json:"city_code"`
	City         City           `gorm:"foreignKey:CityCode;references:CityCode" json:"city"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	CreatedUser  string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser  string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistLocation struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	LocationCodeRef  string    `gorm:"column:location_code_ref;index;type:varchar(5)" json:"location_code_ref"`
	Code             string    `gorm:"type:varchar(5)" json:"code"`
	Name             string    `gorm:"type:varchar(60)" json:"name"`
	TestTypeCode     string    `gorm:"type:varchar(5)" json:"test_type_code"`
	CityCode         string    `gorm:"type:varchar(5)" json:"city_code"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	CreatedUser      string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser      string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt        time.Time `json:"deleted_at"`
	DeletedUser      string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistLocation) TableName() string {
	return "hist_locations"
}


func (l *Location) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(l).Error
}
func (l *Location) Update(db *gorm.DB) error { return db.Save(l).Error }
func (l *Location) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&Location{}).Error
}

type Methodology struct {
	Code             string         `gorm:"primaryKey;type:varchar(5)" json:"code"`
	Name             string         `gorm:"unique;not null;type:varchar(60)" json:"name"`
	TestTypeCode     string         `gorm:"type:varchar(5)" json:"test_type_code"`
	TestType         TestType       `gorm:"foreignKey:TestTypeCode" json:"test_type"`
	ScoringLevelCode string         `gorm:"type:char(5);default:'00000'" json:"scoring_level_code"` // Menentukan level kelulusan
	Price            float64        `gorm:"type:numeric(15,2);default:0" json:"price"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	CreatedUser      string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser      string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser      string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistMethodology struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	MethodCodeRef    string    `gorm:"column:method_code_ref;index;type:varchar(5)" json:"method_code_ref"`
	Code             string    `gorm:"type:varchar(5)" json:"code"`
	Name             string    `gorm:"type:varchar(60)" json:"name"`
	TestTypeCode     string    `gorm:"type:varchar(5)" json:"test_type_code"`
	ScoringLevelCode string    `gorm:"type:char(5)" json:"scoring_level_code"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	CreatedUser      string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser      string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt        time.Time `json:"deleted_at"`
	DeletedUser      string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistMethodology) TableName() string {
	return "hist_methodologies"
}


func (m *Methodology) GetByCode(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).First(m).Error
}
func (m *Methodology) Update(db *gorm.DB) error { return db.Save(m).Error }
func (m *Methodology) Delete(db *gorm.DB, code string) error {
	return db.Where("code = ?", code).Delete(&Methodology{}).Error
}

// SimulatorDataLog menyimpan data masukan dari simulator/peralatan militer sebelum dikonsumsi pengujian
type SimulatorDataLog struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	ApplicationID       uint64    `gorm:"type:bigint;index" json:"application_id"`
	SubAspectCode       string    `gorm:"type:varchar(50);index" json:"sub_aspect_code"`
	Score               float64   `json:"score"`
	MachineID           string    `gorm:"type:varchar(60)" json:"machine_id"`
	Notes               string    `gorm:"type:varchar(200)" json:"notes"`
	IsUsed              bool      `gorm:"default:false;index" json:"is_used"`
	UsedByApplicationID *uint64    `gorm:"type:bigint" json:"used_by_application_id"`
	CreatedAt           time.Time `gorm:"primaryKey;not null;index" json:"created_at"`
}

// TestingResult merepresentasikan hasil pengujian
type TestingResult struct {
	ID            uint              `gorm:"primaryKey" json:"id"`
	ApplicationID uint64              `gorm:"index;type:bigint" json:"application_id"`
	AspectCode    string            `gorm:"type:varchar(50)" json:"aspect_code"`
	Aspect        ScoringAspect     `gorm:"foreignKey:AspectCode;references:Code" json:"aspect"`
	SubAspectCode *string           `gorm:"type:varchar(50)" json:"sub_aspect_code"`
	SubAspect     *ScoringSubAspect `gorm:"foreignKey:SubAspectCode;references:Code" json:"sub_aspect"`
	Score         float64           `json:"score"`
	Notes         string            `gorm:"type:varchar(500)" json:"notes"`
	PhotoPath     string            `gorm:"type:varchar(255)" json:"photo_path"`
	IsDisabled    bool              `gorm:"column:is_disabled;default:false" json:"is_disabled"`
	CreatedAt     time.Time         `gorm:"primaryKey;not null" json:"created_at"`
}

// TestingAspectScore merepresentasikan hasil score per aspect (level 3)
type TestingAspectScore struct {
	ApplicationID uint64    `gorm:"primaryKey;type:bigint" json:"application_id"`
	AspectCode    string    `gorm:"primaryKey;type:varchar(50)" json:"aspect_code"`
	Score         float64   `json:"score"`
	CreatedAt     time.Time `gorm:"primaryKey;not null" json:"created_at"`
	CreatedUser   string    `gorm:"type:varchar(30)" json:"created_user"`
}

func (TestingAspectScore) TableName() string {
	return "testing_aspect_scores"
}

// TestingApplicationAudit untuk audit trail perubahan status
type TestingApplicationAudit struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	ApplicationID   uint64       `gorm:"index;type:bigint" json:"application_id"`
	RegNumber       string     `gorm:"type:varchar(30)" json:"reg_number"`
	ApplicationDate *time.Time `json:"application_date"`
	Status          string     `gorm:"type:varchar(15)" json:"status"`
	IPAddress       string     `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent       string     `gorm:"type:varchar(255)" json:"user_agent"`
	CreatedUser     string     `gorm:"type:varchar(30)" json:"created_user"`
	CreatedAt       time.Time  `gorm:"primaryKey;not null;index" json:"created_at"`
	// GORM auto akan route ke partitioned table berdasarkan created_at
}

// TableName override untuk menunjuk ke partitioned table
func (TestingApplicationAudit) TableName() string {
	return "testing_applications_audit"
}

type PartnerType struct {
	Code        string         `gorm:"primaryKey;type:varchar(5)" json:"code"`
	Name        string         `gorm:"unique;not null;type:varchar(60)" json:"name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistPartnerType struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PtCodeRef string    `gorm:"column:pt_code_ref;index;type:varchar(5)" json:"pt_code_ref"`
	Code      string    `gorm:"type:varchar(5)" json:"code"`
	Name      string    `gorm:"type:varchar(60)" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	CreatedUser string  `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string  `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt time.Time `json:"deleted_at"`
	DeletedUser string  `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistPartnerType) TableName() string {
	return "hist_partner_types"
}




type ApplicationStatus struct {
	StatusCode  string         `gorm:"primaryKey;type:varchar(15)" json:"status_code"`
	Description string         `gorm:"type:varchar(60);column:desc" json:"desc"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

type HistApplicationStatus struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	StatusCode  string    `gorm:"index;type:varchar(15)" json:"status_code"`
	Description string    `gorm:"type:varchar(60);column:desc" json:"desc"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   *time.Time `json:"deleted_at"`
	DeletedUser string    `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (HistApplicationStatus) TableName() string {
	return "hist_status_applications"
}

func (a *ApplicationStatus) GetByCode(db *gorm.DB, code string) error {
	return db.Where("status_code = ?", code).First(a).Error
}

func (a *ApplicationStatus) Create(db *gorm.DB) error {
	return db.Create(a).Error
}

func (a *ApplicationStatus) Update(db *gorm.DB) error {
	return db.Save(a).Error
}

func (a *ApplicationStatus) Delete(db *gorm.DB, code string) error {
	return db.Where("status_code = ?", code).Delete(&ApplicationStatus{}).Error
}

func (ApplicationStatus) TableName() string {
	return "status_applications"
}

// RegistrationCounter merepresentasikan table registrations_counters
type RegistrationCounter struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	Year       int  `gorm:"not null;index" json:"year"`
	CurrentVal int  `gorm:"not null" json:"current_val"`
}

func (RegistrationCounter) TableName() string {
	return "registrations_counters"
}

type ReimbursementCounter struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	Year       int  `gorm:"not null;index" json:"year"`
	CurrentVal int  `gorm:"not null" json:"current_val"`
}

func (ReimbursementCounter) TableName() string {
	return "reimbursement_counters"
}

type TravelRequestCounter struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	Year       int  `gorm:"not null;index" json:"year"`
	CurrentVal int  `gorm:"not null" json:"current_val"`
}

func (TravelRequestCounter) TableName() string {
	return "travel_request_counters"
}

type CashAdvanceCounter struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	Year       int  `gorm:"not null;index" json:"year"`
	CurrentVal int  `gorm:"not null" json:"current_val"`
}

func (CashAdvanceCounter) TableName() string {
	return "cash_advance_counters"
}


type MasterAssetStatus struct {
	AssetStatusCode string         `gorm:"primaryKey;type:varchar(10)" json:"asset_status_code"`
	AssetStatusName string         `gorm:"type:varchar(60);not null" json:"asset_status_name"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	CreatedUser     string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	DeletedUser     string         `gorm:"type:varchar(30)" json:"deleted_user"`
}

type HistMasterAssetStatus struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	AssetStatusCode string    `gorm:"type:varchar(10)" json:"asset_status_code"`
	AssetStatusName string    `gorm:"type:varchar(60)" json:"asset_status_name"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	CreatedUser     string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt       time.Time `json:"deleted_at"`
	DeletedUser     string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (HistMasterAssetStatus) TableName() string {
	return "hist_master_asset_statuses"
}


func (MasterAssetStatus) TableName() string {
	return "master_asset_statuses"
}

type AssetActivityLog struct {
	ID              uint             `gorm:"primaryKey" json:"id"`
	AssetID         uint64           `gorm:"index" json:"asset_id"`
	ActivityType    string           `gorm:"type:varchar(10)" json:"activity_type"` // MOVE | DISPO | CEKIN
	FromLocation    string           `gorm:"type:varchar(5)" json:"from_location"`
	ToLocation      string           `gorm:"type:varchar(5)" json:"to_location"`
	FromStatus      string           `gorm:"type:varchar(5)" json:"from_status"`
	ToStatus        string           `gorm:"type:varchar(5)" json:"to_status"`
	Notes           string           `gorm:"type:varchar(255)" json:"notes"`
	CreatedAt       time.Time        `gorm:"primaryKey;not null" json:"created_at"`
	CreatedUser     string           `gorm:"type:varchar(30)" json:"created_user"`
}

type AssetHandover struct {
	AssetID      uint64           `gorm:"primaryKey;type:bigint" json:"asset_id"`
	Asset        TestingEquipment `gorm:"foreignKey:AssetID" json:"asset"`
	HandoverNo   string           `gorm:"type:varchar(30);not null" json:"handover_no"`
	HandoverDate time.Time        `json:"handover_date"`
	PartnerID    *uint64          `gorm:"type:bigint" json:"partner_id"`
	Partner      Partner          `gorm:"foreignKey:PartnerID" json:"partner"`
	ReceiverName string           `gorm:"type:varchar(60)" json:"receiver_name"`
	Notes        string           `gorm:"type:varchar(255)" json:"notes"`
	CreatedAt    time.Time        `gorm:"primaryKey;not null" json:"created_at"`
	CreatedUser  string           `gorm:"type:varchar(30)" json:"created_user"`
}

func (AssetHandover) TableName() string {
	return "asset_handovers"
}

func (AssetActivityLog) TableName() string {
	return "asset_activity_logs"
}
type TestingEquipment struct {
	ID              uint64           `gorm:"primaryKey" json:"id"`
	EquipmentName   string           `gorm:"type:varchar(100);not null;index" json:"equipment_name"`
	CategoryCode    string           `gorm:"type:varchar(5)" json:"category_code"`
	Category        MaterialCategory `gorm:"foreignKey:CategoryCode;references:Code" json:"category"`
	BrandCode       string           `gorm:"type:varchar(5)" json:"brand_code"`
	Brand           Brand            `gorm:"foreignKey:BrandCode;references:Code" json:"brand"`
	ModelCode       string           `gorm:"type:varchar(5)" json:"model_code"`
	Model           Model            `gorm:"foreignKey:ModelCode;references:Code" json:"model"`
	VariantCode     string           `gorm:"type:varchar(5)" json:"variant_code"`
	Variant         Variant          `gorm:"foreignKey:VariantCode;references:Code" json:"variant"`
	BatchNumber     string           `gorm:"type:varchar(60)" json:"batch_number"`
	TechnicalSpec   string           `gorm:"type:varchar(100)" json:"technical_spec"`
	FactorySpecPath string           `gorm:"type:varchar(100)" json:"factory_spec_path"`
	QualityDocPath   string             `gorm:"type:varchar(100)" json:"quality_doc_path"`
	SerialNo         string             `gorm:"type:varchar(50)" json:"serial_no"`
	AssetStatusCode    string               `gorm:"type:varchar(10)" json:"asset_status_code"`
	AssetStatus      MasterAssetStatus  `gorm:"foreignKey:AssetStatusCode;references:AssetStatusCode" json:"asset_status"`
	AssetLocationCode string            `gorm:"type:varchar(5)" json:"asset_location_code"`
	AssetLocation    Location           `gorm:"foreignKey:AssetLocationCode;references:Code" json:"asset_location"`
	ApplicationID    *uint64            `gorm:"index" json:"application_id"`
	Application      *TestingApplication `gorm:"foreignKey:ApplicationID" json:"application"`
	PartnerCode      string             `gorm:"-" json:"partner_code"` // Virtual field for backward compatibility or computed
	RegistrationNo   string             `gorm:"-" json:"registration_no"`
	ReceivedDate     *time.Time         `gorm:"-" json:"received_date"`
	AppStatus        string             `gorm:"->" json:"app_status"`
	AppFinalStatus   string             `gorm:"->" json:"app_final_status"`
	AppRegNumber     string             `gorm:"->" json:"app_reg_number"`
	AppRegDate       *time.Time         `gorm:"->" json:"app_reg_date"`
	AppPartnerID     *uint64            `gorm:"->" json:"app_partner_id"`
	AppPartnerName   string             `gorm:"->" json:"app_partner_name"`
	CreatedAt        time.Time          `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedAt        time.Time          `json:"updated_at"`
	CreatedUser      string             `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser      string             `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt        gorm.DeletedAt     `gorm:"index" json:"deleted_at"`
}

// removed TableName() for dynamic partitioning

// ScoringAspect merepresentasikan table scoring_aspects
type ScoringAspect struct {
	Code            string             `gorm:"primaryKey;type:varchar(50);not null" json:"code"`
	Name            string             `gorm:"type:varchar(100);not null;unique" json:"name"`
	Description     string             `gorm:"type:varchar(255)" json:"description"`
	Weight          float64            `json:"weight"`
	Threshold       float64            `json:"threshold"`
	MethodologyCode string             `gorm:"type:varchar(5)" json:"methodology_code"`
	Methodology     Methodology        `gorm:"foreignKey:MethodologyCode" json:"methodology"`
	TestTypeCode    *string            `gorm:"type:varchar(5)" json:"test_type_code"`
	TestType        *TestType          `gorm:"foreignKey:TestTypeCode" json:"test_type"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
	CreatedUser     string             `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string             `gorm:"type:varchar(30)" json:"updated_user"`
	IsActive        bool               `gorm:"default:true" json:"is_active"`
	IsUsed          bool               `gorm:"default:true" json:"is_used"`
	SubAspects      []ScoringSubAspect `gorm:"foreignKey:AspectCode;references:Code" json:"sub_aspects"`
	DeletedUser     string             `gorm:"type:varchar(30)" json:"deleted_user"`
}

type HistScoringAspect struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	SaID            string    `gorm:"index;type:varchar(50)" json:"sa_id"`
	Code            string    `gorm:"type:varchar(50)" json:"code"`
	Name            string    `gorm:"type:varchar(100)" json:"name"`
	Description     string    `gorm:"type:varchar(255)" json:"description"`
	Weight          float64   `json:"weight"`
	Threshold       float64   `json:"threshold"`
	MethodologyCode string    `gorm:"type:varchar(5)" json:"methodology_code"`
	TestTypeCode    *string   `gorm:"type:varchar(5)" json:"test_type_code"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	CreatedUser     string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string    `gorm:"type:varchar(30)" json:"updated_user"`
	IsActive        bool      `json:"is_active"`
	IsUsed          bool      `json:"is_used"`
	DeletedUser     string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (ScoringAspect) TableName() string {
	return "scoring_aspects"
}

// ScoringSubAspect merepresentasikan table scoring_subs_aspects
type ScoringSubAspect struct {
	Code             string    `gorm:"primaryKey;type:varchar(5);not null" json:"code"`
	Name             string    `gorm:"type:varchar(100);not null;unique" json:"name"`
	AspectCode       string    `gorm:"not null;index" json:"aspect_code"`
	Description      string    `gorm:"type:varchar(255)" json:"description"`
	Weight           float64   `json:"weight"`
	StandardValue    float64   `gorm:"column:standard_value;type:numeric(15,4);default:0" json:"standard_value"`
	StandardValueMax float64   `gorm:"column:standard_value_max;type:numeric(15,4);default:0" json:"standard_value_max"`
	StandardOperator string    `gorm:"column:standard_operator;type:varchar(10);default:'>='" json:"standard_operator"`
	StandardUnit     string    `gorm:"column:standard_unit;type:varchar(20);default:''" json:"standard_unit"`
	IsSimulator      bool      `gorm:"default:false" json:"is_simulator"`
	IsActive         bool      `gorm:"default:true" json:"is_active"`
	OCRKeywords      string    `gorm:"type:varchar(5);index" json:"ocr_keywords"`
	OCRKeywords1     string    `gorm:"column:ocr_keywords_1;type:varchar(5);index" json:"ocr_keywords_1"`
	OCRKeywords2     string    `gorm:"column:ocr_keywords_2;type:varchar(5);index" json:"ocr_keywords_2"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	CreatedUser      string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser      string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedUser      string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

type HistScoringSubAspect struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	SsaID            string    `gorm:"index;type:varchar(5)" json:"ssa_id"`
	Code             string    `gorm:"type:varchar(5)" json:"code"`
	Name             string    `gorm:"type:varchar(100)" json:"name"`
	AspectCode       string    `gorm:"type:varchar(50)" json:"aspect_code"`
	Description      string    `gorm:"type:varchar(255)" json:"description"`
	Weight           float64   `json:"weight"`
	StandardValue    float64   `gorm:"column:standard_value;type:numeric(15,4);default:0" json:"standard_value"`
	StandardValueMax float64   `gorm:"column:standard_value_max;type:numeric(15,4);default:0" json:"standard_value_max"`
	StandardOperator string    `gorm:"column:standard_operator;type:varchar(10);default:'>='" json:"standard_operator"`
	StandardUnit     string    `gorm:"column:standard_unit;type:varchar(20);default:''" json:"standard_unit"`
	IsSimulator      bool      `json:"is_simulator"`
	IsActive         bool      `json:"is_active"`
	OCRKeywords      string    `gorm:"type:varchar(5)" json:"ocr_keywords"`
	OCRKeywords1     string    `gorm:"column:ocr_keywords_1;type:varchar(5)" json:"ocr_keywords_1"`
	OCRKeywords2     string    `gorm:"column:ocr_keywords_2;type:varchar(5)" json:"ocr_keywords_2"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	CreatedUser      string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser      string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedUser      string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (ScoringSubAspect) TableName() string {
	return "scoring_sub_aspects"
}

// ScoringSubAspectItem merepresentasikan table scoring_sub_aspect_items
type ScoringSubAspectItem struct {
	ID            uint             `gorm:"primaryKey" json:"id"`
	SubAspectCode string           `gorm:"type:varchar(5);not null;index" json:"sub_aspect_code"`
	SubAspect     ScoringSubAspect `gorm:"foreignKey:SubAspectCode;references:Code" json:"sub_aspect"`
	Name          string           `gorm:"type:varchar(100);not null" json:"name"`
	Score         float64          `json:"score"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`
	CreatedUser   string           `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser   string           `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt     *time.Time       `json:"deleted_at"`
	DeletedUser   string           `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (ScoringSubAspectItem) TableName() string {
	return "scoring_sub_aspect_items"
}

// HistScoringSubAspectItem merepresentasikan table hist_scoring_sub_aspect_items
type HistScoringSubAspectItem struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	SaiID         uint      `gorm:"index" json:"sai_id"`
	SubAspectCode string    `gorm:"type:varchar(5)" json:"sub_aspect_code"`
	Name          string    `gorm:"type:varchar(100)" json:"name"`
	Score         float64   `json:"score"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	CreatedUser   string    `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser   string    `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt     *time.Time `json:"deleted_at"`
	DeletedUser   string    `gorm:"type:varchar(30)" json:"deleted_user"`
}

// ScoringLevel merepresentasikan table scoring_levels
type ScoringLevel struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	LevelGroupCode string    `gorm:"type:char(5);index;default:'00000'" json:"level_group_code"`
	MinScore       float64   `gorm:"not null" json:"min_score"`
	MaxScore       float64   `gorm:"not null" json:"max_score"`
	Label          string    `gorm:"type:varchar(100);not null" json:"label"`
	Description    string    `gorm:"type:varchar(255)" json:"description"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	CreatedUser    string     `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser    string     `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt      *time.Time `json:"deleted_at"`
	DeletedUser    string     `gorm:"type:varchar(30)" json:"deleted_user"`
}

type HistScoringLevel struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	SlID           uint       `gorm:"index" json:"sl_id"`
	LevelGroupCode string     `gorm:"type:char(5)" json:"level_group_code"`
	MinScore       float64    `json:"min_score"`
	MaxScore       float64    `json:"max_score"`
	Label          string     `gorm:"type:varchar(100)" json:"label"`
	Description    string     `gorm:"type:varchar(255)" json:"description"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	CreatedUser    string     `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser    string     `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt      *time.Time `json:"deleted_at"`
	DeletedUser    string     `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (ScoringLevel) TableName() string {
	return "scoring_levels"
}

// TravelRequest merepresentasikan pengajuan Surat Perjalanan Dinas (SPD)
type TravelRequest struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	UserID          uint           `gorm:"index" json:"user_id"`
	User            User           `gorm:"foreignKey:UserID" json:"user"`
	NoSpd           string         `gorm:"type:varchar(30);index" json:"no_spd"` // Generated SPD Number
	RegNumber       string         `gorm:"type:varchar(30);index" json:"reg_number"` // Link to testing_applications
	LocationCode    string         `gorm:"type:varchar(5);index" json:"location_code"`
	Location        Location       `gorm:"foreignKey:LocationCode;references:Code" json:"location"`
	Purpose         string         `gorm:"type:varchar(255)" json:"purpose"`
	StartDate       time.Time      `json:"start_date"`
	EndDate         time.Time      `json:"end_date"`
	EstimatedBudget float64        `json:"estimated_budget"`
	Status          string         `gorm:"type:varchar(20);index;default:'DRAFT'" json:"status"` // DRAFT, PENDING, APPROVED, REJECTED
	Notes           string         `gorm:"type:varchar(500)" json:"notes"`
	CreatedAt       time.Time      `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	CreatedUser     string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (TravelRequest) TableName() string {
	return "travel_requests"
}

// CashAdvance merepresentasikan pengajuan uang muka / kasbon
type CashAdvance struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	NoCashAdvance   string         `gorm:"column:no_cash_advance;type:varchar(30);index" json:"no_cash_advance"`
	TravelRequestID *uint          `gorm:"index" json:"travel_request_id"`
	TravelRequest   *TravelRequest `gorm:"foreignKey:TravelRequestID" json:"travel_request"`
	UserID          uint           `gorm:"index" json:"user_id"`
	User            User           `gorm:"foreignKey:UserID" json:"user"`
	Title           string         `gorm:"type:varchar(100)" json:"title"`
	Date            time.Time      `json:"date"`
	Amount          float64        `json:"amount"`
	Status          string         `gorm:"type:varchar(20);index;default:'PENDING'" json:"status"` // PENDING, APPROVED, TRANSFERRED, REJECTED, SETTLED
	Notes           string         `gorm:"type:varchar(500)" json:"notes"`
	CreatedAt       time.Time      `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	CreatedUser     string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string         `gorm:"type:varchar(30)" json:"updated_user"`
}

// Reimbursement merepresentasikan pengajuan penggantian biaya
type Reimbursement struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	RegNumber       string         `gorm:"type:varchar(30);index" json:"reg_number"` // Serial like REIM-2026-00001
	TravelRequestID *uint          `gorm:"index" json:"travel_request_id"`
	TravelRequest   *TravelRequest `gorm:"foreignKey:TravelRequestID" json:"travel_request"`
	CashAdvanceID   *uint          `gorm:"index" json:"cash_advance_id"`
	CashAdvance     *CashAdvance   `gorm:"foreignKey:CashAdvanceID" json:"cash_advance"`
	UserID          uint           `gorm:"index" json:"user_id"`
	User            User           `gorm:"foreignKey:UserID" json:"user"`
	Title           string         `gorm:"type:varchar(100)" json:"title"`
	Date            time.Time      `json:"date"`
	Amount          float64        `json:"amount"`
	ReceiptPath     string         `gorm:"type:varchar(255)" json:"receipt_path"`
	Status          string         `gorm:"type:varchar(20);index;default:'PENDING'" json:"status"` // PENDING, APPROVED, REJECTED, PAID
	Notes           string         `gorm:"type:varchar(500)" json:"notes"`
	CreatedAt       time.Time      `gorm:"primaryKey;not null" json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	CreatedUser     string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser     string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Reimbursement) TableName() string {
	return "reimbursements"
}

// --- Testing Tools & Availability ---

type TestingTool struct {
	Code         string         `gorm:"primaryKey;type:varchar(10)" json:"code"`
	Name         string         `gorm:"type:varchar(100);not null" json:"name"`
	Type         string         `gorm:"type:varchar(10);not null" json:"type"` // USAGE | STOCK
	MinStock     int            `gorm:"default:0" json:"min_stock"`     // Safety stock threshold
	InitialStock int            `gorm:"default:0" json:"initial_stock"` // Total initial count
	CurrentStock int            `gorm:"default:0" json:"current_stock"` // Actual physical current count
	LocationCode string         `gorm:"type:varchar(5);index" json:"location_code"`
	Location     Location       `gorm:"foreignKey:LocationCode" json:"location"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	CreatedUser  string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser  string         `gorm:"type:varchar(30)" json:"deleted_user"`
}

func (TestingTool) TableName() string {
	return "testing_tools"
}

type TestingToolAvailability struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ToolCode  string    `gorm:"type:varchar(10);index" json:"tool_code"`
	Date      time.Time `gorm:"primaryKey;type:date;index" json:"date"`
	Hour      int       `gorm:"index" json:"hour"` // 0-23
	Status    string    `gorm:"type:varchar(15)" json:"status"` // AVAILABLE, BOOKED, MAINTENANCE
	BookedBy  uint      `json:"booked_by"` // User ID
	Quantity  int       `gorm:"default:1" json:"quantity"` // For STOCK type
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
}

func (TestingToolAvailability) TableName() string {
	return "testing_tool_availabilities"
}

type TestingToolReservation struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ToolCode      string    `gorm:"type:varchar(10);index" json:"tool_code"`
	UserID        uint      `gorm:"index" json:"user_id"`
	ApplicationID uint64    `gorm:"type:bigint;index" json:"application_id"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
	Quantity      int       `gorm:"default:1" json:"quantity"`
	Status        string    `gorm:"type:varchar(15);default:'BOOKED'" json:"status"` // BOOKED, CANCELLED
	CreatedAt     time.Time `gorm:"primaryKey;not null" json:"created_at"`
}

func (TestingToolReservation) TableName() string {
	return "testing_tool_reservations"
}

type TestingToolTransaction struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ToolCode      string    `gorm:"type:varchar(10);index" json:"tool_code"`
	Type          string    `gorm:"type:varchar(10)" json:"type"` // IN | OUT
	Quantity      int       `json:"quantity"`
	ReferenceType string    `gorm:"type:varchar(20)" json:"reference_type"` // PLANNING | ADJUSTMENT
	ReferenceID   uint      `json:"reference_id"`
	StockBefore   int       `json:"stock_before"`
	StockAfter    int       `json:"stock_after"`
	Notes         string    `gorm:"type:varchar(255)" json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
}

func (TestingToolTransaction) TableName() string {
	return "testing_tool_transactions"
}

type HistTestingTool struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	TtID         string         `gorm:"index;type:varchar(10)" json:"tt_id"`
	Code         string         `gorm:"type:varchar(10)" json:"code"`
	Name         string         `gorm:"type:varchar(100)" json:"name"`
	Type         string         `gorm:"type:varchar(10)" json:"type"`
	MinStock     int            `json:"min_stock"`
	InitialStock int            `json:"initial_stock"`
	CurrentStock int            `json:"current_stock"`
	LocationCode string         `gorm:"type:varchar(5)" json:"location_code"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	CreatedUser  string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser  string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	DeletedUser  string         `gorm:"type:varchar(30)" json:"deleted_user"`
}

type TestingPackage struct {
	ID            uint          `gorm:"primaryKey" json:"id"`
	PackageCode   string        `gorm:"unique;not null;type:varchar(10)" json:"package_code"`
	Name          string        `gorm:"type:varchar(100);not null" json:"name"`
	Description   string        `gorm:"type:text" json:"description"`
	BasePrice     float64       `gorm:"type:numeric(15,2);default:0" json:"base_price"`
	IsActive      bool          `gorm:"default:true" json:"is_active"`
	Methodologies []Methodology `gorm:"many2many:package_methodologies;foreignKey:ID;joinForeignKey:PackageID;References:Code;joinReferences:MethodologyCode" json:"methodologies"`
	
	// Many-to-many relationship for dynamic active aspects and sub-aspects per package (Option B)
	ActiveAspects    []ScoringAspect    `gorm:"many2many:package_active_aspects;foreignKey:ID;joinForeignKey:PackageID;References:Code;joinReferences:AspectCode" json:"active_aspects"`
	ActiveSubAspects []ScoringSubAspect `gorm:"many2many:package_active_sub_aspects;foreignKey:ID;joinForeignKey:PackageID;References:Code;joinReferences:SubAspectCode" json:"active_sub_aspects"`
	
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	CreatedUser   string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser   string         `gorm:"type:varchar(30)" json:"updated_user"`
}

type HistTestingPackage struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TpID        uint      `gorm:"column:tp_id;index" json:"tp_id"`
	PackageCode string    `gorm:"type:varchar(10)" json:"package_code"`
	Name        string    `gorm:"type:varchar(100)" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	BasePrice   float64   `gorm:"type:numeric(15,2)" json:"base_price"`
	ActionType  string    `gorm:"type:varchar(10)" json:"action_type"`
	CreatedAt   time.Time `json:"created_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
}

type HistPackageActiveAspect struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PackageID   uint      `gorm:"index" json:"package_id"`
	AspectCode  string    `gorm:"type:varchar(50)" json:"aspect_code"`
	ActionType  string    `gorm:"type:varchar(10)" json:"action_type"` // 'INSERT', 'DELETE'
	CreatedAt   time.Time `json:"created_at"`
	CreatedUser string    `gorm:"type:varchar(30)" json:"created_user"`
}

func (HistPackageActiveAspect) TableName() string {
	return "hist_package_active_aspects"
}

type HistPackageActiveSubAspect struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	PackageID     uint      `gorm:"index" json:"package_id"`
	SubAspectCode string    `gorm:"type:varchar(5)" json:"sub_aspect_code"`
	ActionType    string    `gorm:"type:varchar(10)" json:"action_type"` // 'INSERT', 'DELETE'
	CreatedAt     time.Time `json:"created_at"`
	CreatedUser   string    `gorm:"type:varchar(30)" json:"created_user"`
}

func (HistPackageActiveSubAspect) TableName() string {
	return "hist_package_active_sub_aspects"
}

type Invoice struct {
	ID             uint64             `gorm:"primaryKey;autoIncrement" json:"id"`
	ApplicationID  uint64             `gorm:"type:bigint;index" json:"application_id"`
	Application    TestingApplication `gorm:"foreignKey:ApplicationID" json:"application"`
	InvoiceNumber  string             `gorm:"type:varchar(50);not null;uniqueIndex:idx_invoice_num_created" json:"invoice_number"`
	TotalAmount    float64            `gorm:"type:numeric(15,2);not null" json:"total_amount"`
	DiscountAmount float64            `gorm:"type:numeric(15,2);default:0" json:"discount_amount"`
	TaxAmount      float64            `gorm:"type:numeric(15,2);default:0" json:"tax_amount"`
	FinalAmount    float64            `gorm:"type:numeric(15,2);not null" json:"final_amount"`
	Status         string             `gorm:"type:varchar(20);default:'UNPAID'" json:"status"`
	DueDate        *time.Time         `json:"due_date"`
	CreatedAt      time.Time          `gorm:"not null;uniqueIndex:idx_invoice_num_created" json:"created_at"`
	CreatedUser    string             `gorm:"type:varchar(30)" json:"created_user"`
}

type Payment struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	InvoiceID     uint64    `gorm:"type:bigint" json:"invoice_id"`
	Invoice       Invoice   `gorm:"foreignKey:InvoiceID" json:"invoice"`
	PaymentDate   time.Time `gorm:"not null" json:"payment_date"`
	Amount        float64   `gorm:"type:numeric(15,2);not null" json:"amount"`
	PaymentMethod string    `gorm:"type:varchar(30)" json:"payment_method"`
	EvidencePath  string    `gorm:"type:varchar(225)" json:"evidence_path"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedUser   string    `gorm:"type:varchar(30)" json:"created_user"`
}

type OCRScoreMapping struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	OCRValue    string         `gorm:"unique;not null;type:varchar(50);index" json:"ocr_value"`
	MappedValue string         `gorm:"type:varchar(50);not null" json:"mapped_value"`
	Description string         `gorm:"type:varchar(255)" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	CreatedUser string         `gorm:"type:varchar(30)" json:"created_user"`
	UpdatedUser string         `gorm:"type:varchar(30)" json:"updated_user"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	DeletedUser string         `gorm:"type:varchar(30)" json:"deleted_user,omitempty"`
}

func (OCRScoreMapping) TableName() string {
	return "ocr_score_mappings"
}

// UserActivityLog records actions performed by users for rate-limit auditing
type UserActivityLog struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	Process   string    `gorm:"type:varchar(10);not null" json:"process"`
	Activity  string    `gorm:"type:varchar(100);not null" json:"activity"`
	IPAddress string    `gorm:"type:varchar(15)" json:"ip_address"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (UserActivityLog) TableName() string {
	return "user_activity_logs"
}
