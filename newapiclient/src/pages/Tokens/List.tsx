import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag, Popconfirm, Input, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { tokenService } from '../../services/tauri';
import type { Token } from '../../types/api';
import dayjs from 'dayjs';
import TokenFormModal from './TokenFormModal';

export default function TokenList() {
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<Token | null>(null);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const result = searchKeyword
        ? await tokenService.searchTokens(searchKeyword, page, pageSize)
        : await tokenService.getTokens(page, pageSize);
      setTokens(result.items);
      setTotal(result.total);
    } catch (error) {
      message.error(`加载令牌列表失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, [page, pageSize, searchKeyword]);

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPage(1);
  };

  const handleDelete = async (tokenId: number) => {
    try {
      await tokenService.deleteToken(tokenId);
      message.success('删除成功');
      loadTokens();
    } catch (error) {
      message.error(`删除失败: ${error}`);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的令牌');
      return;
    }

    try {
      await tokenService.deleteTokensBatch(selectedRowKeys);
      message.success(`成功删除 ${selectedRowKeys.length} 个令牌`);
      setSelectedRowKeys([]);
      loadTokens();
    } catch (error) {
      message.error(`批量删除失败: ${error}`);
    }
  };

  const handleViewKey = async (tokenId: number) => {
    try {
      const key = await tokenService.getTokenKey(tokenId);
      Modal.info({
        title: '令牌密钥',
        content: (
          <div>
            <code className="bg-gray-100 px-2 py-1 rounded block my-2">{key}</code>
            <Button
              type="link"
              onClick={() => {
                navigator.clipboard.writeText(key);
                message.success('已复制到剪贴板');
              }}
            >
              复制
            </Button>
          </div>
        ),
      });
    } catch (error) {
      message.error(`获取密钥失败: ${error}`);
    }
  };

  const handleEdit = (token: Token) => {
    setEditingToken(token);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingToken(null);
    setFormModalOpen(true);
  };

  const getStatusTag = (status: number) => {
    return status === 1 ? (
      <Tag color="success">启用</Tag>
    ) : (
      <Tag color="error">禁用</Tag>
    );
  };

  const columns: ColumnsType<Token> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '剩余额度',
      dataIndex: 'remain_quota',
      key: 'remain_quota',
      render: (quota, record) =>
        record.unlimited_quota ? (
          <Tag color="blue">无限制</Tag>
        ) : (
          quota.toLocaleString()
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      key: 'created_time',
      render: (time) => dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '过期时间',
      dataIndex: 'expired_time',
      key: 'expired_time',
      render: (time) =>
        time === 0 ? '永不过期' : dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewKey(record.id)}
          >
            查看密钥
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个令牌吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
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
          <h1 className="text-2xl font-bold mb-2">令牌管理</h1>
          <p className="text-gray-500">管理 API 访问令牌</p>
        </div>
        <Space>
          <Input.Search
            placeholder="搜索令牌名称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`确定要删除选中的 ${selectedRowKeys.length} 个令牌吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button icon={<DeleteOutlined />} danger>
                批量删除
              </Button>
            </Popconfirm>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建令牌
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tokens}
        rowKey="id"
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
        }}
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

      <TokenFormModal
        open={formModalOpen}
        token={editingToken}
        onCancel={() => {
          setFormModalOpen(false);
          setEditingToken(null);
        }}
        onSuccess={() => {
          setFormModalOpen(false);
          setEditingToken(null);
          loadTokens();
        }}
      />
    </div>
  );
}
