import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, message, Spin } from 'antd';
import { UserOutlined, ApiOutlined, KeyOutlined, RocketOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { dashboardService } from '../../services/tauri';
import type { SystemStatus, DashboardStats, QuotaDataPoint } from '../../types/api';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quotaData, setQuotaData] = useState<QuotaDataPoint[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statusResult, statsResult] = await Promise.all([
        dashboardService.getSystemStatus(),
        dashboardService.getDashboardStats(),
      ]);

      setSystemStatus(statusResult);
      setStats(statsResult);

      const endTimestamp = dayjs().unix();
      const startTimestamp = dayjs().subtract(30, 'days').unix();

      try {
        const quotaResult = await dashboardService.getQuotaData(startTimestamp, endTimestamp);
        setQuotaData(quotaResult);
      } catch (error) {
        console.error('Failed to load quota data:', error);
      }
    } catch (error) {
      message.error(`加载数据失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getUptime = () => {
    if (!systemStatus) return '未知';
    const uptimeSeconds = dayjs().unix() - systemStatus.start_time;
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  const quotaChartConfig = {
    data: quotaData,
    xField: 'date',
    yField: 'quota',
    smooth: true,
    point: {
      size: 3,
      shape: 'circle',
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: true,
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => {
          const num = parseFloat(v);
          if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
          } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
          }
          return v;
        },
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: '配额使用',
          value: datum.quota.toLocaleString(),
        };
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">仪表板</h1>
        <p className="text-gray-500">系统运行状态概览</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats?.user_count || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="渠道总数"
              value={stats?.channel_count || 0}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="令牌总数"
              value={stats?.token_count || 0}
              prefix={<KeyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="系统运行时间"
              value={getUptime()}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="系统信息">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="text-gray-500">版本号</div>
            <div className="text-lg font-semibold">{systemStatus?.version || '未知'}</div>
          </Col>
          <Col span={12}>
            <div className="text-gray-500">启动时间</div>
            <div className="text-lg font-semibold">
              {systemStatus?.start_time
                ? dayjs.unix(systemStatus.start_time).format('YYYY-MM-DD HH:mm:ss')
                : '未知'}
            </div>
          </Col>
        </Row>
      </Card>

      {quotaData.length > 0 && (
        <Card title="配额使用趋势（最近 30 天）">
          <Line {...quotaChartConfig} />
        </Card>
      )}
    </div>
  );
}
