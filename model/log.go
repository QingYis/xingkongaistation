package model

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"

	"github.com/bytedance/gopkg/util/gopool"
	"gorm.io/gorm"
)

type Log struct {
	Id                 int    `json:"id" gorm:"index:idx_created_at_id,priority:1;index:idx_user_id_id,priority:2"`
	UserId             int    `json:"user_id" gorm:"index;index:idx_user_id_id,priority:1"`
	CreatedAt          int64  `json:"created_at" gorm:"bigint;index:idx_created_at_id,priority:2;index:idx_created_at_type"`
	Type               int    `json:"type" gorm:"index:idx_created_at_type"`
	Content            string `json:"content"`
	Username           string `json:"username" gorm:"index;index:index_username_model_name,priority:2;default:''"`
	TokenName          string `json:"token_name" gorm:"index;default:''"`
	ModelName          string `json:"model_name" gorm:"index;index:index_username_model_name,priority:1;default:''"`
	Quota              int    `json:"quota" gorm:"default:0"`
	PromptTokens       int    `json:"prompt_tokens" gorm:"default:0"`
	CompletionTokens   int    `json:"completion_tokens" gorm:"default:0"`
	UseTime            int    `json:"use_time" gorm:"default:0"`
	IsStream           bool   `json:"is_stream"`
	ChannelId          int    `json:"channel" gorm:"index"`
	ChannelName        string `json:"channel_name" gorm:"->"`
	TokenId            int    `json:"token_id" gorm:"default:0;index"`
	Group              string `json:"group" gorm:"index"`
	Ip                 string `json:"ip" gorm:"index;default:''"`
	RequestId          string `json:"request_id,omitempty" gorm:"type:varchar(64);index:idx_logs_request_id;default:''"`
	Other              string `json:"other"`
	UpstreamCostQuota  int64  `json:"upstream_cost_quota" gorm:"type:bigint;not null;default:0"`
	UpstreamCostSource string `json:"upstream_cost_source" gorm:"type:varchar(16);not null;default:'unknown'"`
}

// don't use iota, avoid change log type value
const (
	LogTypeUnknown = 0
	LogTypeTopup   = 1
	LogTypeConsume = 2
	LogTypeManage  = 3
	LogTypeSystem  = 4
	LogTypeError   = 5
	LogTypeRefund  = 6
)

const (
	UpstreamCostSourceExact    = "exact"
	UpstreamCostSourceEstimated = "estimated"
	UpstreamCostSourceUnknown  = "unknown"
)

type ChannelProfitStatItem struct {
	ChannelId         int     `json:"channel_id"`
	ChannelName       string  `json:"channel_name"`
	Quota             int64   `json:"quota"`
	UpstreamCostQuota int64   `json:"upstream_cost_quota"`
	ProfitQuota       int64   `json:"profit_quota"`
	RequestCount      int64   `json:"request_count"`
	KnownCostCount    int64   `json:"known_cost_count"`
	CostCoverageRate  float64 `json:"cost_coverage_rate"`
}

func formatUserLogs(logs []*Log, startIdx int) {
	for i := range logs {
		logs[i].ChannelName = ""
		var otherMap map[string]interface{}
		otherMap, _ = common.StrToMap(logs[i].Other)
		if otherMap != nil {
			// Remove admin-only debug fields.
			delete(otherMap, "admin_info")
			// delete(otherMap, "reject_reason")
			delete(otherMap, "stream_status")
		}
		logs[i].Other = common.MapToJsonStr(otherMap)
		logs[i].Id = startIdx + i + 1
	}
}

func GetLogByTokenId(tokenId int) (logs []*Log, err error) {
	err = LOG_DB.Model(&Log{}).Where("token_id = ?", tokenId).Order("id desc").Limit(common.MaxRecentItems).Find(&logs).Error
	formatUserLogs(logs, 0)
	return logs, err
}

func RecordLog(userId int, logType int, content string) {
	if logType == LogTypeConsume && !common.LogConsumeEnabled {
		return
	}
	username, _ := GetUsernameById(userId, false)
	log := &Log{
		UserId:    userId,
		Username:  username,
		CreatedAt: common.GetTimestamp(),
		Type:      logType,
		Content:   content,
	}
	err := LOG_DB.Create(log).Error
	if err != nil {
		common.SysLog("failed to record log: " + err.Error())
	}
}

func RecordErrorLog(c *gin.Context, userId int, channelId int, modelName string, tokenName string, content string, tokenId int, useTimeSeconds int,
	isStream bool, group string, other map[string]interface{}) {
	logger.LogInfo(c, fmt.Sprintf("record error log: userId=%d, channelId=%d, modelName=%s, tokenName=%s, content=%s", userId, channelId, modelName, tokenName, content))
	username := c.GetString("username")
	requestId := c.GetString(common.RequestIdKey)
	otherStr := common.MapToJsonStr(other)
	// 判断是否需要记录 IP
	needRecordIp := false
	if settingMap, err := GetUserSetting(userId, false); err == nil {
		if settingMap.RecordIpLog {
			needRecordIp = true
		}
	}
	log := &Log{
		UserId:           userId,
		Username:         username,
		CreatedAt:        common.GetTimestamp(),
		Type:             LogTypeError,
		Content:          content,
		PromptTokens:     0,
		CompletionTokens: 0,
		TokenName:        tokenName,
		ModelName:        modelName,
		Quota:            0,
		ChannelId:        channelId,
		TokenId:          tokenId,
		UseTime:          useTimeSeconds,
		IsStream:         isStream,
		Group:            group,
		Ip: func() string {
			if needRecordIp {
				return c.ClientIP()
			}
			return ""
		}(),
		RequestId: requestId,
		Other:     otherStr,
	}
	err := LOG_DB.Create(log).Error
	if err != nil {
		logger.LogError(c, "failed to record log: "+err.Error())
	}
}

type RecordConsumeLogParams struct {
	ChannelId          int                    `json:"channel_id"`
	PromptTokens       int                    `json:"prompt_tokens"`
	CompletionTokens   int                    `json:"completion_tokens"`
	ModelName          string                 `json:"model_name"`
	TokenName          string                 `json:"token_name"`
	Quota              int                    `json:"quota"`
	Content            string                 `json:"content"`
	TokenId            int                    `json:"token_id"`
	UseTimeSeconds     int                    `json:"use_time_seconds"`
	IsStream           bool                   `json:"is_stream"`
	Group              string                 `json:"group"`
	Other              map[string]interface{} `json:"other"`
	UpstreamCostQuota  int64                  `json:"upstream_cost_quota"`
	UpstreamCostSource string                 `json:"upstream_cost_source"`
}

func RecordConsumeLog(c *gin.Context, userId int, params RecordConsumeLogParams) {
	if !common.LogConsumeEnabled {
		return
	}
	logger.LogInfo(c, fmt.Sprintf("record consume log: userId=%d, params=%s", userId, common.GetJsonString(params)))
	username := c.GetString("username")
	requestId := c.GetString(common.RequestIdKey)
	otherStr := common.MapToJsonStr(params.Other)
	// 判断是否需要记录 IP
	needRecordIp := false
	if settingMap, err := GetUserSetting(userId, false); err == nil {
		if settingMap.RecordIpLog {
			needRecordIp = true
		}
	}
	log := &Log{
		UserId:             userId,
		Username:           username,
		CreatedAt:          common.GetTimestamp(),
		Type:               LogTypeConsume,
		Content:            params.Content,
		PromptTokens:       params.PromptTokens,
		CompletionTokens:   params.CompletionTokens,
		TokenName:          params.TokenName,
		ModelName:          params.ModelName,
		Quota:              params.Quota,
		ChannelId:          params.ChannelId,
		TokenId:            params.TokenId,
		UseTime:            params.UseTimeSeconds,
		IsStream:           params.IsStream,
		Group:              params.Group,
		UpstreamCostQuota:  params.UpstreamCostQuota,
		UpstreamCostSource: params.UpstreamCostSource,
		Ip: func() string {
			if needRecordIp {
				return c.ClientIP()
			}
			return ""
		}(),
		RequestId: requestId,
		Other:     otherStr,
	}
	err := LOG_DB.Create(log).Error
	if err != nil {
		logger.LogError(c, "failed to record log: "+err.Error())
	}
	if common.DataExportEnabled {
		gopool.Go(func() {
			LogQuotaData(userId, username, params.ModelName, params.Quota, common.GetTimestamp(), params.PromptTokens+params.CompletionTokens)
		})
	}
}

type RecordTaskBillingLogParams struct {
	UserId             int
	LogType            int
	Content            string
	ChannelId          int
	ModelName          string
	Quota              int
	TokenId            int
	Group              string
	Other              map[string]interface{}
	UpstreamCostQuota  int64
	UpstreamCostSource string
}

func RecordTaskBillingLog(params RecordTaskBillingLogParams) {
	if params.LogType == LogTypeConsume && !common.LogConsumeEnabled {
		return
	}
	username, _ := GetUsernameById(params.UserId, false)
	tokenName := ""
	if params.TokenId > 0 {
		if token, err := GetTokenById(params.TokenId); err == nil {
			tokenName = token.Name
		}
	}
	log := &Log{
		UserId:             params.UserId,
		Username:           username,
		CreatedAt:          common.GetTimestamp(),
		Type:               params.LogType,
		Content:            params.Content,
		TokenName:          tokenName,
		ModelName:          params.ModelName,
		Quota:              params.Quota,
		ChannelId:          params.ChannelId,
		TokenId:            params.TokenId,
		Group:              params.Group,
		Other:              common.MapToJsonStr(params.Other),
		UpstreamCostQuota:  params.UpstreamCostQuota,
		UpstreamCostSource: params.UpstreamCostSource,
	}
	err := LOG_DB.Create(log).Error
	if err != nil {
		common.SysLog("failed to record task billing log: " + err.Error())
	}
}

func GetAllLogs(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, startIdx int, num int, channel int, group string, requestId string) (logs []*Log, total int64, err error) {
	var tx *gorm.DB
	if logType == LogTypeUnknown {
		tx = LOG_DB
	} else {
		tx = LOG_DB.Where("logs.type = ?", logType)
	}

	if modelName != "" {
		tx = tx.Where("logs.model_name like ?", modelName)
	}
	if username != "" {
		tx = tx.Where("logs.username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("logs.token_name = ?", tokenName)
	}
	if requestId != "" {
		tx = tx.Where("logs.request_id = ?", requestId)
	}
	if startTimestamp != 0 {
		tx = tx.Where("logs.created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("logs.created_at <= ?", endTimestamp)
	}
	if channel != 0 {
		tx = tx.Where("logs.channel_id = ?", channel)
	}
	if group != "" {
		tx = tx.Where("logs."+logGroupCol+" = ?", group)
	}
	err = tx.Model(&Log{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = tx.Order("logs.id desc").Limit(num).Offset(startIdx).Find(&logs).Error
	if err != nil {
		return nil, 0, err
	}

	channelIds := types.NewSet[int]()
	for _, log := range logs {
		if log.ChannelId != 0 {
			channelIds.Add(log.ChannelId)
		}
	}

	if channelIds.Len() > 0 {
		var channels []struct {
			Id   int    `gorm:"column:id"`
			Name string `gorm:"column:name"`
		}
		if common.MemoryCacheEnabled {
			// Cache get channel
			for _, channelId := range channelIds.Items() {
				if cacheChannel, err := CacheGetChannel(channelId); err == nil {
					channels = append(channels, struct {
						Id   int    `gorm:"column:id"`
						Name string `gorm:"column:name"`
					}{
						Id:   channelId,
						Name: cacheChannel.Name,
					})
				}
			}
		} else {
			// Bulk query channels from DB
			if err = DB.Table("channels").Select("id, name").Where("id IN ?", channelIds.Items()).Find(&channels).Error; err != nil {
				return logs, total, err
			}
		}
		channelMap := make(map[int]string, len(channels))
		for _, channel := range channels {
			channelMap[channel.Id] = channel.Name
		}
		for i := range logs {
			logs[i].ChannelName = channelMap[logs[i].ChannelId]
		}
	}

	return logs, total, err
}

const logSearchCountLimit = 10000

func GetUserLogs(userId int, logType int, startTimestamp int64, endTimestamp int64, modelName string, tokenName string, startIdx int, num int, group string, requestId string) (logs []*Log, total int64, err error) {
	var tx *gorm.DB
	if logType == LogTypeUnknown {
		tx = LOG_DB.Where("logs.user_id = ?", userId)
	} else {
		tx = LOG_DB.Where("logs.user_id = ? and logs.type = ?", userId, logType)
	}

	if modelName != "" {
		modelNamePattern, err := sanitizeLikePattern(modelName)
		if err != nil {
			return nil, 0, err
		}
		tx = tx.Where("logs.model_name LIKE ? ESCAPE '!'", modelNamePattern)
	}
	if tokenName != "" {
		tx = tx.Where("logs.token_name = ?", tokenName)
	}
	if requestId != "" {
		tx = tx.Where("logs.request_id = ?", requestId)
	}
	if startTimestamp != 0 {
		tx = tx.Where("logs.created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("logs.created_at <= ?", endTimestamp)
	}
	if group != "" {
		tx = tx.Where("logs."+logGroupCol+" = ?", group)
	}
	err = tx.Model(&Log{}).Limit(logSearchCountLimit).Count(&total).Error
	if err != nil {
		common.SysError("failed to count user logs: " + err.Error())
		return nil, 0, errors.New("查询日志失败")
	}
	err = tx.Order("logs.id desc").Limit(num).Offset(startIdx).Find(&logs).Error
	if err != nil {
		common.SysError("failed to search user logs: " + err.Error())
		return nil, 0, errors.New("查询日志失败")
	}

	formatUserLogs(logs, startIdx)
	return logs, total, err
}

type Stat struct {
	Quota             int64                 `json:"quota"`
	Rpm               int64                 `json:"rpm"`
	Tpm               int64                 `json:"tpm"`
	UpstreamCostQuota int64                 `json:"upstream_cost_quota"`
	ProfitQuota       int64                 `json:"profit_quota"`
	KnownCostCount    int64                 `json:"known_cost_count"`
	TotalConsumeCount int64                 `json:"total_consume_count"`
	CostCoverageRate  float64               `json:"cost_coverage_rate"`
	Channels          []ChannelProfitStatItem `json:"channels"`
}

func populateChannelNames(stats []ChannelProfitStatItem) error {
	if len(stats) == 0 {
		return nil
	}
	channelIds := make([]int, 0, len(stats))
	seen := make(map[int]struct{}, len(stats))
	for _, stat := range stats {
		if stat.ChannelId == 0 {
			continue
		}
		if _, ok := seen[stat.ChannelId]; ok {
			continue
		}
		seen[stat.ChannelId] = struct{}{}
		channelIds = append(channelIds, stat.ChannelId)
	}
	if len(channelIds) == 0 {
		return nil
	}
	var channels []struct {
		Id   int    `gorm:"column:id"`
		Name string `gorm:"column:name"`
	}
	if common.MemoryCacheEnabled {
		for _, channelId := range channelIds {
			if cacheChannel, err := CacheGetChannel(channelId); err == nil {
				channels = append(channels, struct {
					Id   int    `gorm:"column:id"`
					Name string `gorm:"column:name"`
				}{
					Id:   channelId,
					Name: cacheChannel.Name,
				})
			}
		}
	} else {
		if err := DB.Table("channels").Select("id, name").Where("id IN ?", channelIds).Find(&channels).Error; err != nil {
			return err
		}
	}
	channelMap := make(map[int]string, len(channels))
	for _, channel := range channels {
		channelMap[channel.Id] = channel.Name
	}
	for i := range stats {
		stats[i].ChannelName = channelMap[stats[i].ChannelId]
	}
	return nil
}

func buildAdminLogProfitBaseQuery(startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int, group string) (*gorm.DB, error) {
	tx := LOG_DB.Table("logs")
	if username != "" {
		tx = tx.Where("username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}
	if modelName != "" {
		modelNamePattern, filterErr := sanitizeLikePattern(modelName)
		if filterErr != nil {
			return nil, filterErr
		}
		tx = tx.Where("model_name LIKE ? ESCAPE '!'", modelNamePattern)
	}
	if channel != 0 {
		tx = tx.Where("channel_id = ?", channel)
	}
	if group != "" {
		tx = tx.Where(logGroupCol+" = ?", group)
	}
	tx = tx.Where("type = ?", LogTypeConsume)
	return tx, nil
}

func GetAdminLogProfitSummary(startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int, group string) (stat Stat, err error) {
	tx, err := buildAdminLogProfitBaseQuery(startTimestamp, endTimestamp, modelName, username, tokenName, channel, group)
	if err != nil {
		return stat, err
	}

	type statRow struct {
		Quota             int64 `gorm:"column:quota"`
		UpstreamCostQuota int64 `gorm:"column:upstream_cost_quota"`
		KnownCostCount    int64 `gorm:"column:known_cost_count"`
		TotalConsumeCount int64 `gorm:"column:total_consume_count"`
	}
	var statResult statRow
	if err := tx.Select("COALESCE(SUM(quota), 0) AS quota, COALESCE(SUM(upstream_cost_quota), 0) AS upstream_cost_quota, COALESCE(SUM(CASE WHEN upstream_cost_source <> ? THEN 1 ELSE 0 END), 0) AS known_cost_count, COUNT(*) AS total_consume_count", UpstreamCostSourceUnknown).Scan(&statResult).Error; err != nil {
		common.SysError("failed to query admin log profit summary: " + err.Error())
		return stat, errors.New("查询统计数据失败")
	}

	stat.Quota = statResult.Quota
	stat.UpstreamCostQuota = statResult.UpstreamCostQuota
	stat.ProfitQuota = stat.Quota - stat.UpstreamCostQuota
	stat.KnownCostCount = statResult.KnownCostCount
	stat.TotalConsumeCount = statResult.TotalConsumeCount
	if stat.TotalConsumeCount > 0 {
		stat.CostCoverageRate = float64(stat.KnownCostCount) / float64(stat.TotalConsumeCount)
	}

	var channelRows []ChannelProfitStatItem
	if err := tx.Select("channel_id, COALESCE(SUM(quota), 0) AS quota, COALESCE(SUM(upstream_cost_quota), 0) AS upstream_cost_quota, COUNT(*) AS request_count, COALESCE(SUM(CASE WHEN upstream_cost_source <> ? THEN 1 ELSE 0 END), 0) AS known_cost_count", UpstreamCostSourceUnknown).Group("channel_id").Order("quota DESC").Scan(&channelRows).Error; err != nil {
		common.SysError("failed to query channel profit summary: " + err.Error())
		return stat, errors.New("查询统计数据失败")
	}
	for i := range channelRows {
		channelRows[i].ProfitQuota = channelRows[i].Quota - channelRows[i].UpstreamCostQuota
		if channelRows[i].RequestCount > 0 {
			channelRows[i].CostCoverageRate = float64(channelRows[i].KnownCostCount) / float64(channelRows[i].RequestCount)
		}
	}
	if err := populateChannelNames(channelRows); err != nil {
		return stat, err
	}
	stat.Channels = channelRows
	return stat, nil
}

func GetAdminLogProfitStat(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int, group string) (stat Stat, err error) {
	stat, err = GetAdminLogProfitSummary(startTimestamp, endTimestamp, modelName, username, tokenName, channel, group)
	if err != nil {
		return stat, err
	}

	rpmQuery := LOG_DB.Table("logs").Select("COUNT(*) AS rpm, COALESCE(SUM(prompt_tokens), 0) + COALESCE(SUM(completion_tokens), 0) AS tpm")
	if username != "" {
		rpmQuery = rpmQuery.Where("username = ?", username)
	}
	if tokenName != "" {
		rpmQuery = rpmQuery.Where("token_name = ?", tokenName)
	}
	if modelName != "" {
		modelNamePattern, filterErr := sanitizeLikePattern(modelName)
		if filterErr != nil {
			return stat, filterErr
		}
		rpmQuery = rpmQuery.Where("model_name LIKE ? ESCAPE '!'", modelNamePattern)
	}
	if channel != 0 {
		rpmQuery = rpmQuery.Where("channel_id = ?", channel)
	}
	if group != "" {
		rpmQuery = rpmQuery.Where(logGroupCol+" = ?", group)
	}
	rpmQuery = rpmQuery.Where("type = ?", LogTypeConsume)
	rpmQuery = rpmQuery.Where("created_at >= ?", time.Now().Add(-60*time.Second).Unix())
	if err := rpmQuery.Scan(&stat).Error; err != nil {
		common.SysError("failed to query admin log rpm/tpm stat: " + err.Error())
		return stat, errors.New("查询统计数据失败")
	}
	return stat, nil
}

func SumUsedQuota(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int, group string) (stat Stat, err error) {
	tx := LOG_DB.Table("logs").Select("sum(quota) quota")

	// 为rpm和tpm创建单独的查询
	rpmTpmQuery := LOG_DB.Table("logs").Select("count(*) rpm, sum(prompt_tokens) + sum(completion_tokens) tpm")

	if username != "" {
		tx = tx.Where("username = ?", username)
		rpmTpmQuery = rpmTpmQuery.Where("username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
		rpmTpmQuery = rpmTpmQuery.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}
	if modelName != "" {
		modelNamePattern, err := sanitizeLikePattern(modelName)
		if err != nil {
			return stat, err
		}
		tx = tx.Where("model_name LIKE ? ESCAPE '!'", modelNamePattern)
		rpmTpmQuery = rpmTpmQuery.Where("model_name LIKE ? ESCAPE '!'", modelNamePattern)
	}
	if channel != 0 {
		tx = tx.Where("channel_id = ?", channel)
		rpmTpmQuery = rpmTpmQuery.Where("channel_id = ?", channel)
	}
	if group != "" {
		tx = tx.Where(logGroupCol+" = ?", group)
		rpmTpmQuery = rpmTpmQuery.Where(logGroupCol+" = ?", group)
	}

	tx = tx.Where("type = ?", LogTypeConsume)
	rpmTpmQuery = rpmTpmQuery.Where("type = ?", LogTypeConsume)

	// 只统计最近60秒的rpm和tpm
	rpmTpmQuery = rpmTpmQuery.Where("created_at >= ?", time.Now().Add(-60*time.Second).Unix())

	// 执行查询
	if err := tx.Scan(&stat).Error; err != nil {
		common.SysError("failed to query log stat: " + err.Error())
		return stat, errors.New("查询统计数据失败")
	}
	if err := rpmTpmQuery.Scan(&stat).Error; err != nil {
		common.SysError("failed to query rpm/tpm stat: " + err.Error())
		return stat, errors.New("查询统计数据失败")
	}

	return stat, nil
}

func SumUsedToken(logType int, startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string) (token int) {
	tx := LOG_DB.Table("logs").Select("ifnull(sum(prompt_tokens),0) + ifnull(sum(completion_tokens),0)")
	if username != "" {
		tx = tx.Where("username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}
	if modelName != "" {
		tx = tx.Where("model_name = ?", modelName)
	}
	tx.Where("type = ?", LogTypeConsume).Scan(&token)
	return token
}

func DeleteOldLog(ctx context.Context, targetTimestamp int64, limit int) (int64, error) {
	var total int64 = 0

	for {
		if nil != ctx.Err() {
			return total, ctx.Err()
		}

		result := LOG_DB.Where("created_at < ?", targetTimestamp).Limit(limit).Delete(&Log{})
		if nil != result.Error {
			return total, result.Error
		}

		total += result.RowsAffected

		if result.RowsAffected < int64(limit) {
			break
		}
	}

	return total, nil
}
