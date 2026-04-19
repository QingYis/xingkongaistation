package middleware

import (
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

func TestDetectRequestProtocolByPath(t *testing.T) {
	gin.SetMode(gin.TestMode)

	testCases := []struct {
		name     string
		path     string
		headers  map[string]string
		expected types.RelayFormat
	}{
		{
			name:     "claude path prefers claude protocol",
			path:     "/v1/messages",
			expected: types.RelayFormatClaude,
		},
		{
			name:     "openai chat path prefers openai protocol",
			path:     "/v1/chat/completions",
			expected: types.RelayFormatOpenAI,
		},
		{
			name:     "gemini path prefers gemini protocol",
			path:     "/v1beta/models/gemini-2.5-flash:generateContent",
			expected: types.RelayFormatGemini,
		},
		{
			name: "/custom path falls back to claude headers",
			path: "/custom/messages",
			headers: map[string]string{
				"x-api-key":         "sk-test",
				"anthropic-version": "2023-06-01",
			},
			expected: types.RelayFormatClaude,
		},
		{
			name:     "unknown path defaults to openai",
			path:     "/custom/path",
			expected: types.RelayFormatOpenAI,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req := httptest.NewRequest("POST", tc.path, nil)
			for k, v := range tc.headers {
				req.Header.Set(k, v)
			}
			ctx.Request = req

			if got := detectRequestProtocol(ctx); got != tc.expected {
				t.Fatalf("detectRequestProtocol() = %q, want %q", got, tc.expected)
			}
		})
	}
}
