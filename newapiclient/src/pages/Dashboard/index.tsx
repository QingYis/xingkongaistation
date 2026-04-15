import { Card, Row, Col, Statistic, Space } from 'antd';
import {
  UserOutlined,
  ApiOutlined,
  KeyOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">仪表盘</h1>
        <p className="text-gray-500">系统概览和关键指标</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="card-hover">
            <Statistic
              title="用户总数"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="card-hover">
            <Statistic
              title="渠道总数"
              value={0}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="card-hover">
            <Statistic
              title="令牌总数"
              value={0}
              prefix={<KeyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="card-hover">
            <Statistic
              title="今日请求"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="使用趋势" bordered={false}>
            <div className="h-64 flex items-center justify-center text-gray-400">
              图表区域 - 待实现
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="快捷操作" bordered={false}>
            <Space direction="vertical" className="w-full">
              <div className="p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                <UserOutlined className="mr-2" />
                创建用户
              </div>
              <div className="p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                <ApiOutlined className="mr-2" />
                添加渠道
              </div>
              <div className="p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                <KeyOutlined className="mr-2" />
                创建令牌
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="最近活动" bordered={false}>
        <div className="h-48 flex items-center justify-center text-gray-400">
          活动日志 - 待实现
        </div>
      </Card>
    </div>
  );
}
