import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../../services/tauri';
import type { User } from '../../types/api';
import { UserRole, UserStatus } from '../../types/api';

export default function UserList() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = searchKeyword
        ? await userService.searchUsers(searchKeyword, page, pageSize)
        : await userService.getUsers(page, pageSize);
      setUsers(result.items);
      setTotal(result.total);
    } catch (error) {
      message.error(`加载用户列表失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleDelete = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      message.success('删除成功');
      loadUsers();
    } catch (error) {
      message.error(`删除失败: ${error}`);
    }
  };

  const getRoleTag = (role: number) => {
    switch (role) {
      case UserRole.Root:
        return <Tag color="red">超级管理员</Tag>;
      case UserRole.Admin:
        return <Tag color="blue">管理员</Tag>;
      default:
        return <Tag>普通用户</Tag>;
    }
  };

  const getStatusTag = (status: number) => {
    return status === UserStatus.Enabled ? (
      <Tag color="success">启用</Tag>
    ) : (
      <Tag color="error">禁用</Tag>
    );
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '额度',
      dataIndex: 'quota',
      key: 'quota',
      render: (quota) => quota.toLocaleString(),
    },
    {
      title: '已用额度',
      dataIndex: 'used_quota',
      key: 'used_quota',
      render: (used) => used.toLocaleString(),
    },
    {
      title: '分组',
      dataIndex: 'group',
      key: 'group',
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      key: 'created_time',
      render: (time) => new Date(time * 1000).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">用户管理</h1>
          <p className="text-gray-500">管理系统用户</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          创建用户
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="搜索用户名"
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button onClick={handleSearch}>搜索</Button>
        {searchKeyword && (
          <Button
            onClick={() => {
              setSearchKeyword('');
              setPage(1);
              loadUsers();
            }}
          >
            清除
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
