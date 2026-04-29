package types

import "fmt"

type GroupRatioInfo struct {
	GroupRatio        float64
	GroupSpecialRatio float64
	HasSpecialRatio   bool
}

type ChannelModelCostConfig struct {
	Enabled          bool    `json:"enabled"`
	BillingType      string  `json:"billing_type"`
	InputPrice       float64 `json:"input_price"`
	OutputPrice      float64 `json:"output_price"`
	CacheReadPrice   float64 `json:"cache_read_price"`
	CacheWritePrice  float64 `json:"cache_write_price"`
	AudioInputPrice  float64 `json:"audio_input_price"`
	AudioOutputPrice float64 `json:"audio_output_price"`
	ImagePrice       float64 `json:"image_price"`
	CallPrice        float64 `json:"call_price"`
	Currency         string  `json:"currency"`
}

type PriceData struct {
	FreeModel              bool
	ModelPrice             float64
	ModelRatio             float64
	CompletionRatio        float64
	CacheRatio             float64
	CacheCreationRatio     float64
	CacheCreation5mRatio   float64
	CacheCreation1hRatio   float64
	ImageRatio             float64
	AudioRatio             float64
	AudioCompletionRatio   float64
	OtherRatios            map[string]float64
	UsePrice               bool
	Quota                  int // 按次计费的最终额度（MJ / Task）
	QuotaToPreConsume      int // 按量计费的预消耗额度
	GroupRatioInfo         GroupRatioInfo
	UpstreamCostConfig     *ChannelModelCostConfig
	UpstreamCostModel      string
	UpstreamCostConfigured bool
	UpstreamCostSource     string
}

func (p *PriceData) AddOtherRatio(key string, ratio float64) {
	if p.OtherRatios == nil {
		p.OtherRatios = make(map[string]float64)
	}
	if ratio <= 0 {
		return
	}
	p.OtherRatios[key] = ratio
}

func (p *PriceData) ToSetting() string {
	return fmt.Sprintf("ModelPrice: %f, ModelRatio: %f, CompletionRatio: %f, CacheRatio: %f, GroupRatio: %f, UsePrice: %t, CacheCreationRatio: %f, CacheCreation5mRatio: %f, CacheCreation1hRatio: %f, QuotaToPreConsume: %d, ImageRatio: %f, AudioRatio: %f, AudioCompletionRatio: %f", p.ModelPrice, p.ModelRatio, p.CompletionRatio, p.CacheRatio, p.GroupRatioInfo.GroupRatio, p.UsePrice, p.CacheCreationRatio, p.CacheCreation5mRatio, p.CacheCreation1hRatio, p.QuotaToPreConsume, p.ImageRatio, p.AudioRatio, p.AudioCompletionRatio)
}
