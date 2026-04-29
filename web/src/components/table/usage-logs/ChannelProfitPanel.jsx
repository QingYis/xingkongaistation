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

import React from 'react';
import { Empty, Table, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const ChannelProfitPanel = ({
  isAdminUser,
  stat,
  loadingStat,
  t,
  formatQuotaAsUsd,
  formatCoverageRate,
}) => {
  if (!isAdminUser) {
    return null;
  }

  const data = stat?.channels || [];

  const columns = [
    {
      title: t('渠道'),
      dataIndex: 'channel_name',
      render: (_, record) =>
        `${record.channel_id} - ${record.channel_name || t('未知渠道')}`,
    },
    {
      title: t('收入'),
      dataIndex: 'quota',
      render: (value) => formatQuotaAsUsd(value),
    },
    {
      title: t('上游成本'),
      dataIndex: 'upstream_cost_quota',
      render: (value) => formatQuotaAsUsd(value),
    },
    {
      title: t('利润'),
      dataIndex: 'profit_quota',
      render: (value) => formatQuotaAsUsd(value),
    },
    {
      title: t('请求数'),
      dataIndex: 'request_count',
    },
    {
      title: t('成本覆盖率'),
      dataIndex: 'cost_coverage_rate',
      render: (value) => formatCoverageRate(value),
    },
  ];

  return (
    <div className='mb-4'>
      <div className='flex items-center justify-between mb-2'>
        <Text strong>{t('按渠道成本与利润')}</Text>
        {stat?.cost_coverage_rate < 1 && (
          <Text type='tertiary'>{t('仅统计已记录上游成本的请求')}</Text>
        )}
      </div>
      <Table
        size='small'
        bordered={false}
        pagination={false}
        loading={loadingStat}
        columns={columns}
        dataSource={data}
        rowKey='channel_id'
        empty={
          <Empty
            image={null}
            description={t('暂无渠道成本数据')}
            style={{ padding: 24 }}
          />
        }
      />
    </div>
  );
};

export default ChannelProfitPanel;
