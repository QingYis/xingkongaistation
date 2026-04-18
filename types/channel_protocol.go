package types

import "github.com/QuantumNous/new-api/constant"

// GetChannelNativeProtocol 返回渠道的原生协议类型
// 用于智能路由判断渠道是否与请求协议匹配
func GetChannelNativeProtocol(channelType int) RelayFormat {
	switch channelType {
	case constant.ChannelTypeAnthropic:
		return RelayFormatClaude
	case constant.ChannelTypeGemini:
		return RelayFormatGemini
	case constant.ChannelTypeOpenAI,
		constant.ChannelTypeAzure,
		constant.ChannelTypeOpenAIMax,
		constant.ChannelTypeOhMyGPT,
		constant.ChannelTypeCustom,
		constant.ChannelTypeAILS,
		constant.ChannelTypeAIProxy,
		constant.ChannelTypeAPI2GPT,
		constant.ChannelTypeAIGC2D,
		constant.ChannelTypeZhipu,
		constant.ChannelTypeZhipu_v4,
		constant.ChannelTypeAli,
		constant.ChannelTypeXunfei,
		constant.ChannelType360,
		constant.ChannelTypeOpenRouter,
		constant.ChannelTypeAIProxyLibrary,
		constant.ChannelTypeFastGPT,
		constant.ChannelTypeTencent,
		constant.ChannelTypeMoonshot,
		constant.ChannelTypePerplexity,
		constant.ChannelTypeLingYiWanWu,
		constant.ChannelTypeCohere,
		constant.ChannelTypeMiniMax,
		constant.ChannelTypeDify,
		constant.ChannelTypeJina,
		constant.ChannelCloudflare,
		constant.ChannelTypeSiliconFlow,
		constant.ChannelTypeMistral,
		constant.ChannelTypeDeepSeek,
		constant.ChannelTypeMokaAI,
		constant.ChannelTypeVolcEngine,
		constant.ChannelTypeXinference,
		constant.ChannelTypeXai,
		constant.ChannelTypeCoze,
		constant.ChannelTypeSubmodel,
		constant.ChannelTypeCodex:
		return RelayFormatOpenAI
	case constant.ChannelTypeBaidu,
		constant.ChannelTypeBaiduV2:
		return RelayFormatOpenAI
	case constant.ChannelTypeAws,
		constant.ChannelTypeVertexAi:
		return RelayFormatOpenAI
	default:
		return RelayFormatOpenAI
	}
}

// IsProtocolMatch 判断渠道协议是否与请求协议匹配
func IsProtocolMatch(channelType int, requestProtocol RelayFormat) bool {
	if requestProtocol == "" {
		return true
	}
	return GetChannelNativeProtocol(channelType) == requestProtocol
}