import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, message, Popconfirm, Table, Space, Progress } from 'antd';
import { DeleteOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { settingsService } from '../../services/tauri';
import type { PerformanceStats, LogFile } from '../../types/api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [perfStats, setPerfStats] = useState<PerformanceStats | null>(null);
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, files] = await Promise.all([
        settingsService.getPerformanceStats(),
        settingsService.getLogFiles(),
      ]);
      setPerfStats(stats);
      setLogFiles(files);
    } catch (error) {
      message.error(`加载数据失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearCache = async () => {
    try {
      await settingsService.clearDiskCache();
      message.success('磁盘缓存已清除');
      loadData();
    } catch (error) {
      message.error(`清除缓存失败: ${error}`);
    }
  };

  const handleForceGC = async () => {
    try {
      await settingsService.forceGC();
      message.success('垃圾回收已执行');
      loadData();
    } catch (error) {
      message.error(`执行垃圾回收失败: ${error}`);
    }
  };

  const handleCleanupLogs = async () => {
    try {
      await settingsService.cleanupLogFiles();
      message.success('日志文件已清理');
      loadData();
    } catch (error) {
      message.error(`清理日志失败: ${error}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const logColumns: ColumnsType<LogFile> = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => formatBytes(size),
    },
    {
      title: '修改时间',
      dataIndex: 'modified_time',
      key: 'modified_time',
      render: (time) => dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">系统设置</h1>
        <p className="text-gray-500">系统性能监控和管理（仅 Root 用户）</p>
      </div>

      {/* 性能统计 */}
      <Card title="性能统计" loading={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="CPU 使用率"
                value={perfStats?.cpu_usage.toFixed(2) || 0}
                suffix="%"
                valueStyle={{ color: (perfStats?.cpu_usage || 0) > 80 ? '#cf1322' : '#3f8600' }}
              />
              <Progress
                percent={perfStats?.cpu_usage || 0}
                status={(perfStats?.cpu_usage || 0) > 80 ? 'exception' : 'normal'}
                showInfo={false}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="内存使用率"
                value={perfStats?.memory_usage.toFixed(2) || 0}
                suffix="%"
                valueStyle={{ color: (perfStats?.memory_usage || 0) > 80 ? '#cf1322' : '#3f8600' }}
              />
              <Progress
                percent={perfStats?.memory_usage || 0}
                status={(perfStats?.memory_usage || 0) > 80 ? 'exception' : 'normal'}
                showInfo={false}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="磁盘使用率"
                value={perfStats?.disk_usage.toFixed(2) || 0}
                suffix="%"
                valueStyle={{ color: (perfStats?.disk_usage || 0) > 80 ? '#cf1322' : '#3f8600' }}
              />
              <Progress
                percent={perfStats?.disk_usage || 0}
                status={(perfStats?.disk_usage || 0) > 80 ? 'exception' : 'normal'}
                showInfo={false}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Goroutines"
                value={perfStats?.goroutines || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 系统操作 */}
      <Card title="系统操作">
        <Space size="large">
          <Popconfirm
            title="确定要清除磁盘缓存吗？"
            description="这将清除所有缓存数据"
            onConfirm={handleClearCache}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} type="primary">
              清除磁盘缓存
            </Button>
          </Popconfirm>

          <Popconfirm
            title="确定要执行垃圾回收吗？"
            description="这将强制执行 Go 垃圾回收"
            onConfirm={handleForceGC}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<ThunderboltOutlined />}>
              强制垃圾回收
            </Button>
          </Popconfirm>

          <Button icon={<ReloadOutlined />} onClick={loadData}>
            刷新数据
          </Button>
        </Space>
      </Card>

      {/* 日志文件管理 */}
      <Card
        title="日志文件管理"
        extra={
          <Popconfirm
            title="确定要清理所有日志文件吗？"
            description="这将删除所有旧的日志文件"
            onConfirm={handleCleanupLogs}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger>
              清理日志文件
            </Button>
          </Popconfirm>
        }
      >
        <Table
          columns={logColumns}
          dataSource={logFiles}
          rowKey="name"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
