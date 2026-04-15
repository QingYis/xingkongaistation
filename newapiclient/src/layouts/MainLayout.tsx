import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ApiOutlined,
  RobotOutlined,
  GiftOutlined,
  KeyOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/tauri';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: '用户管理',
    children: [
      { key: '/users', label: '用户列表' },
      { key: '/users/create', label: '创建用户' },
    ],
  },
  {
    key: 'channels',
    icon: <ApiOutlined />,
    label: '渠道管理',
    children: [
      { key: '/channels', label: '渠道列表' },
      { key: '/channels/create', label: '添加渠道' },
    ],
  },
  {
    key: 'models',
    icon: <RobotOutlined />,
    label: '模型管理',
    children: [
      { key: '/models', label: '模型列表' },
      { key: '/models/sync', label: '同步模型' },
    ],
  },
  {
    key: 'redemptions',
    icon: <GiftOutlined />,
    label: '兑换码管理',
    children: [
      { key: '/redemptions', label: '兑换码列表' },
      { key: '/redemptions/create', label: '批量创建' },
    ],
  },
  {
    key: 'tokens',
    icon: <KeyOutlined />,
    label: '令牌管理',
    children: [
      { key: '/tokens', label: '令牌列表' },
    ],
  },
  {
    key: 'logs',
    icon: <FileTextOutlined />,
    label: '日志查询',
    children: [
      { key: '/logs', label: '日志列表' },
      { key: '/logs/stats', label: '统计分析' },
    ],
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { credentials, logout: storeLogout } = useAuthStore();
  const { token } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    try {
      if (credentials) {
        await authService.logout(credentials.username);
      }
      storeLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          {!collapsed ? (
            <h1 className="text-white text-lg font-bold">New-API</h1>
          ) : (
            <ApiOutlined className="text-white text-2xl" />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        >
          <div className="flex items-center">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-xl cursor-pointer hover:text-primary-500"
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-xl cursor-pointer hover:text-primary-500"
                onClick={() => setCollapsed(true)}
              />
            )}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span className="font-medium">{credentials?.username}</span>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
