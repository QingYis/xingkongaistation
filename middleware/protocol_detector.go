package middleware

import (
	"strings"

	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

// detectRequestProtocol 检测请求使用的协议类型
// 优先根据请求路径识别客户端协议，无法确定时再回退到请求头判断。
func detectRequestProtocol(c *gin.Context) types.RelayFormat {
	path := ""
	if c != nil && c.Request != nil && c.Request.URL != nil {
		path = c.Request.URL.Path
	}

	switch {
	case strings.HasPrefix(path, "/v1/messages"):
		return types.RelayFormatClaude
	case strings.HasPrefix(path, "/v1beta/models/"), strings.HasPrefix(path, "/v1/models/"):
		return types.RelayFormatGemini
	case strings.HasPrefix(path, "/v1/chat/completions"),
		strings.HasPrefix(path, "/v1/completions"),
		strings.HasPrefix(path, "/v1/responses"),
		strings.HasPrefix(path, "/v1/embeddings"),
		strings.HasPrefix(path, "/v1/audio/"),
		strings.HasPrefix(path, "/v1/images/"),
		strings.HasPrefix(path, "/v1/moderations"),
		strings.HasPrefix(path, "/v1/realtime"):
		return types.RelayFormatOpenAI
	}

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