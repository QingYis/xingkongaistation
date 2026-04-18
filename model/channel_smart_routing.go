package model

import (
	"errors"
	"fmt"
	"math/rand"
	"sort"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/QuantumNous/new-api/types"
)

// GetRandomSatisfiedChannelWithSmartRouting 智能路由版本的渠道选择
// 根据请求协议优先选择协议匹配的渠道
// retry=0: 第一优先级（协议匹配的渠道）
// retry=1: 第二优先级（协议不匹配的渠道）
// retry>=2: 系统重试（所有渠道，不区分协议）
func GetRandomSatisfiedChannelWithSmartRouting(group string, model string, retry int, requestProtocol types.RelayFormat) (*Channel, error) {
	// 如果内存缓存未启用，回退到数据库查询
	if !common.MemoryCacheEnabled {
		return GetChannel(group, model, retry)
	}

	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	// 查找支持该模型的渠道
	channels := group2model2channels[group][model]
	if len(channels) == 0 {
		normalizedModel := ratio_setting.FormatMatchingModelName(model)
		channels = group2model2channels[group][normalizedModel]
	}

	if len(channels) == 0 {
		return nil, nil
	}

	// 单个渠道直接返回
	if len(channels) == 1 {
		if channel, ok := channelsIDM[channels[0]]; ok {
			return channel, nil
		}
		return nil, fmt.Errorf("数据库一致性错误，渠道# %d 不存在，请联系管理员修复", channels[0])
	}

	// retry >= 2 时，使用系统重试机制（所有渠道随机，不区分协议）
	if retry >= 2 {
		return selectChannelByPriority(channels, retry-2) // 调整 retry 值
	}

	// retry = 0 或 1 时，使用智能路由
	// retry = 0: 协议匹配的渠道
	// retry = 1: 协议不匹配的渠道
	protocolMatch := (retry == 0)

	// 按协议匹配过滤渠道
	var filteredChannels []int
	for _, channelId := range channels {
		if channel, ok := channelsIDM[channelId]; ok {
			isMatch := types.IsProtocolMatch(channel.Type, requestProtocol)
			if isMatch == protocolMatch {
				filteredChannels = append(filteredChannels, channelId)
			}
		}
	}

	// 如果没有匹配的渠道，返回 nil（触发下一次重试）
	if len(filteredChannels) == 0 {
		return nil, nil
	}

	// 从过滤后的渠道中选择（使用优先级 0，因为已经通过 retry 区分了协议匹配）
	return selectChannelByPriority(filteredChannels, 0)
}

// selectChannelByPriority 根据优先级和权重选择渠道
// 这是从 GetRandomSatisfiedChannel 提取的通用逻辑
func selectChannelByPriority(channels []int, retry int) (*Channel, error) {
	// 收集所有唯一的优先级
	uniquePriorities := make(map[int]bool)
	for _, channelId := range channels {
		if channel, ok := channelsIDM[channelId]; ok {
			uniquePriorities[int(channel.GetPriority())] = true
		} else {
			return nil, fmt.Errorf("数据库一致性错误，渠道# %d 不存在，请联系管理员修复", channelId)
		}
	}

	// 排序优先级（从高到低）
	var sortedUniquePriorities []int
	for priority := range uniquePriorities {
		sortedUniquePriorities = append(sortedUniquePriorities, priority)
	}
	sort.Sort(sort.Reverse(sort.IntSlice(sortedUniquePriorities)))

	// 限制 retry 值
	if retry >= len(uniquePriorities) {
		retry = len(uniquePriorities) - 1
	}
	targetPriority := int64(sortedUniquePriorities[retry])

	// 选择目标优先级的渠道
	var sumWeight = 0
	var targetChannels []*Channel
	for _, channelId := range channels {
		if channel, ok := channelsIDM[channelId]; ok {
			if channel.GetPriority() == targetPriority {
				sumWeight += channel.GetWeight()
				targetChannels = append(targetChannels, channel)
			}
		} else {
			return nil, fmt.Errorf("数据库一致性错误，渠道# %d 不存在，请联系管理员修复", channelId)
		}
	}

	if len(targetChannels) == 0 {
		return nil, errors.New(fmt.Sprintf("no channel found, priority: %d", targetPriority))
	}

	// 权重平滑处理
	smoothingFactor := 1
	smoothingAdjustment := 0

	if sumWeight == 0 {
		sumWeight = len(targetChannels) * 100
		smoothingAdjustment = 100
	} else if sumWeight/len(targetChannels) < 10 {
		smoothingFactor = 100
	}

	// 根据权重随机选择
	totalWeight := sumWeight * smoothingFactor
	randomWeight := rand.Intn(totalWeight)

	for _, channel := range targetChannels {
		randomWeight -= channel.GetWeight()*smoothingFactor + smoothingAdjustment
		if randomWeight < 0 {
			return channel, nil
		}
	}

	return nil, errors.New("channel not found")
}