import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { UserOutlined, LockOutlined, ApiOutlined } from '@ant-design/icons';
import { authService } from '../../services/tauri';
import { useAuthStore } from '../../stores/authStore';
import type { LoginRequest } from '../../types/api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCredentials, setBaseUrl } = useAuthStore();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const credentials = await authService.login(values);
      setCredentials(credentials);
      setBaseUrl(values.base_url);
      message.success('登录成功！');
      navigate('/dashboard');
    } catch (error) {
      message.error(`登录失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card 
        className="w-full max-w-md shadow-2xl"
        bordered={false}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <ApiOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            New-API 管理客户端
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            请登录以继续
          </p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="服务器地址"
            name="base_url"
            rules={[
              { required: true, message: '请输入服务器地址' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
            initialValue="https://"
          >
            <Input 
              prefix={<ApiOutlined />} 
              placeholder="https://your-api.com" 
            />
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名" 
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 text-lg font-medium"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Space split="|">
            <span>New-API Desktop Client</span>
            <span>v0.1.0</span>
          </Space>
        </div>
      </Card>
    </div>
  );
}
