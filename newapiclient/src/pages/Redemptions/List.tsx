import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { redemptionService } from '../../services/tauri';
import type { Redemption } from '../../types/api';
import { RedemptionStatus } from '../../types/api';

export default function RedemptionList() {
  const [loading, setLoading] = useState(false);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const loadRedemptions = async () => {
    setLoading(true);
    try {
      const result = await redemptionService.getRedemptions(page, pageSize);
      setRedemptions(result.items);
      setTotal(result.total);
    } catch (error) {
      message.error(`加载兑换码列表失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRedemptions();
  }, [page, pageSize]);

  const handleDelete = async (redemptionId: number) => {
    try {
      await redemptionService.deleteRedemption(redemptionId);
      message.success('删除成功');
      loadRedemptions();
    } catch (error) {
      message.error(`删除失败: ${error}`);
    }
  };

  const handleCleanInvalid = async () => {
    try {
      const count = await redemptionService.cleanInvalidRedemptions();
      message.success(`已清除 ${count} 个失效兑换码`);
      loadRedemptions();
    } catch (error) {
      message.error(`清除失败: ${error}`);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case RedemptionStatus.Enabled:
        return <Tag color="success">可用</Tag>;
      case RedemptionStatus.Used:
        return <Tag color="default">已使用</Tag>;
      case RedemptionStatus.Disabled:
        return <Tag color="error">已禁用</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    message.success('已复制到剪贴板');
  };

  const columns: ColumnsType<Redemption> = [
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
      title: '兑换码',
      dataIndex: 'key',
      key: 'key',
      render: (key) => (
        <Space>
          <code className="bg-gray-100 px-2 py-1 rounded">{key}</code>
          <Button
            type="link"
            size="small"
            onClick={() => handleCopyKey(key)}
          >
            复制
          </Button>
        </Space>
      ),
    },
    {
      title: '额度',
      dataIndex: 'quota',
      key: 'quota',
      render: (quota) => quota.toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      key: 'created_time',
      render: (time) => new Date(time * 1000).toLocaleString(),
    },
    {
      title: '过期时间',
      dataIndex: 'expired_time',
      key: 'expired_time',
      render: (time) => time === 0 ? '永不过期' : new Date(time * 1000).toLocaleString(),
    },
    {
      title: '兑换时间',
      dataIndex: 'redeemed_time',
      key: 'redeemed_time',
      render: (time) => time === 0 ? '-' : new Date(time * 1000).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这个兑换码吗？"
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
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">兑换码管理</h1>
          <p className="text-gray-500">管理系统兑换码</p>
        </div>
        <Space>
          <Popconfirm
            title="确定要清除所有失效的兑换码吗？"
            description="这将删除所有已使用、已禁用和已过期的兑换码"
            onConfirm={handleCleanInvalid}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<ClearOutlined />}>
              清除失效
            </Button>
          </Popconfirm>
          <Button type="primary" icon={<PlusOutlined />}>
            批量创建
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={redemptions}
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
        scroll={{ x: 1400 }}
      />
    </div>
  );
}
