package model

import (
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/types"
	"gorm.io/gorm"
)

type ChannelCostConfigAudit struct {
	Id               int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	CreatedAt        int64  `json:"created_at" gorm:"bigint;index:idx_channel_cost_audit_channel_time,priority:2;index:idx_channel_cost_audit_model_time,priority:3"`
	ChannelId        int    `json:"channel_id" gorm:"index:idx_channel_cost_audit_channel_time,priority:1;index:idx_channel_cost_audit_model_time,priority:1"`
	ChannelName      string `json:"channel_name" gorm:"type:varchar(255);default:''"`
	OperatorUserId   int    `json:"operator_user_id" gorm:"index"`
	OperatorUsername string `json:"operator_username" gorm:"type:varchar(255);default:'';index"`
	Action           string `json:"action" gorm:"type:varchar(16);default:''"`
	ModelName        string `json:"model_name" gorm:"type:varchar(255);default:'';index:idx_channel_cost_audit_model_time,priority:2"`
	BeforeConfig     string `json:"before_config" gorm:"type:text"`
	AfterConfig      string `json:"after_config" gorm:"type:text"`
	ChangeSummary    string `json:"change_summary" gorm:"type:text"`
}

type ChannelCostAuditPage struct {
	Items []*ChannelCostConfigAudit `json:"items"`
	Total int64                     `json:"total"`
}

type ChannelCostConfigChange struct {
	Action       string
	ModelName    string
	BeforeConfig *types.ChannelModelCostConfig
	AfterConfig  *types.ChannelModelCostConfig
}

func DiffChannelModelCostConfigs(before map[string]types.ChannelModelCostConfig, after map[string]types.ChannelModelCostConfig) []ChannelCostConfigChange {
	changes := make([]ChannelCostConfigChange, 0)
	seen := make(map[string]struct{})
	for modelName, beforeConfig := range before {
		seen[modelName] = struct{}{}
		afterConfig, ok := after[modelName]
		if !ok {
			copiedBefore := beforeConfig
			changes = append(changes, ChannelCostConfigChange{
				Action:       "delete",
				ModelName:    modelName,
				BeforeConfig: &copiedBefore,
			})
			continue
		}
		if !channelModelCostConfigEqual(beforeConfig, afterConfig) {
			copiedBefore := beforeConfig
			copiedAfter := afterConfig
			changes = append(changes, ChannelCostConfigChange{
				Action:       "update",
				ModelName:    modelName,
				BeforeConfig: &copiedBefore,
				AfterConfig:  &copiedAfter,
			})
		}
	}
	for modelName, afterConfig := range after {
		if _, ok := seen[modelName]; ok {
			continue
		}
		copiedAfter := afterConfig
		changes = append(changes, ChannelCostConfigChange{
			Action:      "create",
			ModelName:   modelName,
			AfterConfig: &copiedAfter,
		})
	}
	return changes
}

func channelModelCostConfigEqual(a, b types.ChannelModelCostConfig) bool {
	left, err := common.Marshal(a)
	if err != nil {
		return false
	}
	right, err := common.Marshal(b)
	if err != nil {
		return false
	}
	return string(left) == string(right)
}

func marshalChannelModelCostConfig(config *types.ChannelModelCostConfig) string {
	if config == nil {
		return ""
	}
	bytes, err := common.Marshal(config)
	if err != nil {
		return ""
	}
	return string(bytes)
}

func summarizeChannelModelCostChange(beforeConfig *types.ChannelModelCostConfig, afterConfig *types.ChannelModelCostConfig) string {
	if beforeConfig == nil && afterConfig == nil {
		return ""
	}
	if beforeConfig == nil {
		return "创建成本配置"
	}
	if afterConfig == nil {
		return "删除成本配置"
	}
	changes := make([]string, 0)
	appendFloatChange := func(label string, before float64, after float64) {
		if before != after {
			changes = append(changes, fmt.Sprintf("%s %.6f -> %.6f", label, before, after))
		}
	}
	appendStringChange := func(label string, before string, after string) {
		if before != after {
			changes = append(changes, fmt.Sprintf("%s %s -> %s", label, before, after))
		}
	}
	appendBoolChange := func(label string, before bool, after bool) {
		if before != after {
			changes = append(changes, fmt.Sprintf("%s %t -> %t", label, before, after))
		}
	}
	appendBoolChange("enabled", beforeConfig.Enabled, afterConfig.Enabled)
	appendStringChange("billing_type", beforeConfig.BillingType, afterConfig.BillingType)
	appendStringChange("currency", beforeConfig.Currency, afterConfig.Currency)
	appendFloatChange("input_price", beforeConfig.InputPrice, afterConfig.InputPrice)
	appendFloatChange("output_price", beforeConfig.OutputPrice, afterConfig.OutputPrice)
	appendFloatChange("cache_read_price", beforeConfig.CacheReadPrice, afterConfig.CacheReadPrice)
	appendFloatChange("cache_write_price", beforeConfig.CacheWritePrice, afterConfig.CacheWritePrice)
	appendFloatChange("audio_input_price", beforeConfig.AudioInputPrice, afterConfig.AudioInputPrice)
	appendFloatChange("audio_output_price", beforeConfig.AudioOutputPrice, afterConfig.AudioOutputPrice)
	appendFloatChange("image_price", beforeConfig.ImagePrice, afterConfig.ImagePrice)
	appendFloatChange("call_price", beforeConfig.CallPrice, afterConfig.CallPrice)
	if len(changes) == 0 {
		return "更新成本配置"
	}
	return strings.Join(changes, ", ")
}

func RecordChannelCostConfigAudits(tx *gorm.DB, channel *Channel, operatorUserId int, operatorUsername string, changes []ChannelCostConfigChange) error {
	if len(changes) == 0 {
		return nil
	}
	useDB := DB
	if tx != nil {
		useDB = tx
	}
	audits := make([]ChannelCostConfigAudit, 0, len(changes))
	for _, change := range changes {
		audits = append(audits, ChannelCostConfigAudit{
			CreatedAt:        common.GetTimestamp(),
			ChannelId:        channel.Id,
			ChannelName:      channel.Name,
			OperatorUserId:   operatorUserId,
			OperatorUsername: operatorUsername,
			Action:           change.Action,
			ModelName:        change.ModelName,
			BeforeConfig:     marshalChannelModelCostConfig(change.BeforeConfig),
			AfterConfig:      marshalChannelModelCostConfig(change.AfterConfig),
			ChangeSummary:    summarizeChannelModelCostChange(change.BeforeConfig, change.AfterConfig),
		})
	}
	return useDB.Create(&audits).Error
}

func normalizeChannelModelCostConfigs(configs map[string]types.ChannelModelCostConfig) map[string]types.ChannelModelCostConfig {
	if len(configs) == 0 {
		return map[string]types.ChannelModelCostConfig{}
	}
	normalized := make(map[string]types.ChannelModelCostConfig, len(configs))
	for modelName, config := range configs {
		name := strings.TrimSpace(modelName)
		if name == "" {
			continue
		}
		if config.Currency == "" {
			config.Currency = "USD"
		}
		normalized[name] = config
	}
	return normalized
}

func ValidateChannelModelCostConfigs(configs map[string]types.ChannelModelCostConfig) error {
	for modelName, config := range configs {
		if strings.TrimSpace(modelName) == "" {
			return fmt.Errorf("模型名称不能为空")
		}
		switch config.BillingType {
		case "per_token", "per_call":
		default:
			return fmt.Errorf("模型 %s 的计费方式无效", modelName)
		}
		if config.Currency == "" {
			config.Currency = "USD"
		}
		for _, value := range []float64{config.InputPrice, config.OutputPrice, config.CacheReadPrice, config.CacheWritePrice, config.AudioInputPrice, config.AudioOutputPrice, config.ImagePrice, config.CallPrice} {
			if value < 0 {
				return fmt.Errorf("模型 %s 的成本不能为负数", modelName)
			}
		}
	}
	return nil
}

func GetChannelCostConfigAuditPage(channelId int, modelName string, operatorUsername string, startTimestamp int64, endTimestamp int64, offset int, limit int) (ChannelCostAuditPage, error) {
	page := ChannelCostAuditPage{Items: make([]*ChannelCostConfigAudit, 0)}
	db := DB.Model(&ChannelCostConfigAudit{}).Where("channel_id = ?", channelId)
	if modelName != "" {
		db = db.Where("model_name = ?", modelName)
	}
	if operatorUsername != "" {
		db = db.Where("operator_username = ?", operatorUsername)
	}
	if startTimestamp > 0 {
		db = db.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp > 0 {
		db = db.Where("created_at <= ?", endTimestamp)
	}
	if err := db.Count(&page.Total).Error; err != nil {
		return page, err
	}
	if limit <= 0 {
		limit = 20
	}
	if err := db.Order("created_at desc, id desc").Offset(offset).Limit(limit).Find(&page.Items).Error; err != nil {
		return page, err
	}
	return page, nil
}

func ParseChannelModelCostConfig(configJSON string) (*types.ChannelModelCostConfig, error) {
	if strings.TrimSpace(configJSON) == "" {
		return nil, nil
	}
	var config types.ChannelModelCostConfig
	if err := common.UnmarshalJsonStr(configJSON, &config); err != nil {
		return nil, err
	}
	return &config, nil
}

func FormatChannelModelCostConfig(config *types.ChannelModelCostConfig) string {
	if config == nil {
		return "{}"
	}
	bytes, err := common.Marshal(config)
	if err != nil {
		return "{}"
	}
	return string(bytes)
}
