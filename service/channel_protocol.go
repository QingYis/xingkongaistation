package service

import "github.com/QuantumNous/new-api/types"

// IsProtocolMatch 判断渠道协议是否与请求协议匹配（向后兼容包装）
func IsProtocolMatch(channelType int, requestProtocol types.RelayFormat) bool {
	return types.IsProtocolMatch(channelType, requestProtocol)
}