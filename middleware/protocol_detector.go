package middleware

import (
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

// detectRequestProtocol 检测请求使用的协议类型
// 通过请求头判断客户端使用的是 OpenAI 还是 Claude 协议
func detectRequestProtocol(c *gin.Context) types.RelayFormat {
	// Claude 协议特征：同时存在 x-api-key 和 anthropic-version 请求头
	if c.GetHeader("x-api-key") != "" && c.GetHeader("anthropic-version") != "" {
		return types.RelayFormatClaude
	}
	
	// Gemini 协议特征：x-goog-api-key 请求头
	if c.GetHeader("x-goog-api-key") != "" {
		return types.RelayFormatGemini
	}
	
	// 默认为 OpenAI 协议
	return types.RelayFormatOpenAI
}