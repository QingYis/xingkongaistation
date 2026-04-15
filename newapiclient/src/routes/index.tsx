import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import UserList from '../pages/Users/List';
import RedemptionList from '../pages/Redemptions/List';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: <UserList />,
      },
      {
        path: 'redemptions',
        element: <RedemptionList />,
      },
      // 其他路由待添加
      {
        path: 'channels',
        element: <div>渠道列表 - 待实现</div>,
      },
      {
        path: 'models',
        element: <div>模型列表 - 待实现</div>,
      },
      {
        path: 'tokens',
        element: <div>令牌列表 - 待实现</div>,
      },
      {
        path: 'logs',
        element: <div>日志列表 - 待实现</div>,
      },
      {
        path: 'settings',
        element: <div>设置 - 待实现</div>,
      },
    ],
  },
]);
