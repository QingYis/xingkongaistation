/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState } from 'react';
import { API, showError } from '../../../../helpers';
import { Button, SideSheet, Table, Typography } from '@douyinfe/semi-ui';
import { IconClose } from '@douyinfe/semi-icons';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const { Text } = Typography;

const ChannelCostHistorySideSheet = ({ visible, channelId, onClose, t }) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadData = async () => {
    if (!visible || !channelId) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/channel/${channelId}/cost_history`);
      if (res?.data?.success) {
        setData(res.data.data?.items || []);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [visible, channelId]);

  const columns = [
    { title: t('时间'), dataIndex: 'created_at', render: (value) => new Date(value * 1000).toLocaleString() },
    { title: t('操作人'), dataIndex: 'operator_username' },
    { title: t('模型'), dataIndex: 'model_name' },
    { title: t('操作'), dataIndex: 'action' },
    { title: t('摘要'), dataIndex: 'change_summary' },
  ];

  return (
    <SideSheet
      placement='right'
      visible={visible}
      width={isMobile ? '100%' : 720}
      title={t('上游成本变更历史')}
      closeIcon={<Button type='tertiary' icon={<IconClose />} onClick={onClose} />}
      onCancel={onClose}
    >
      <div className='p-2 space-y-3'>
        <Text type='tertiary'>{t('展示该渠道模型成本配置的最近变更记录')}</Text>
        <Table
          size='small'
          columns={columns}
          dataSource={data}
          rowKey='id'
          loading={loading}
          pagination={false}
          expandedRowRender={(record) => (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div>
                <Text strong>{t('变更前')}</Text>
                <pre className='text-xs whitespace-pre-wrap break-all mt-1'>{record.before_config || '{}'}</pre>
              </div>
              <div>
                <Text strong>{t('变更后')}</Text>
                <pre className='text-xs whitespace-pre-wrap break-all mt-1'>{record.after_config || '{}'}</pre>
              </div>
            </div>
          )}
        />
      </div>
    </SideSheet>
  );
};

export default ChannelCostHistorySideSheet;
