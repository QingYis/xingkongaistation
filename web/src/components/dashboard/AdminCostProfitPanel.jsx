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
import { Card, Empty, Table, Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const AdminCostProfitPanel = ({
  visible,
  loading,
  stat,
  formatQuotaAsUsd,
  formatCoverageRate,
  CARD_PROPS,
  t,
}) => {
  if (!visible) {
    return null;
  }

  const channels = stat?.channels || [];
  const hasData = (stat?.total_consume_count || 0) > 0 || channels.length > 0;

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
      <Card
        {...CARD_PROPS}
        title={t('渠道成本与利润')}
        className='!rounded-2xl'
      >
        {!hasData && !loading ? (
          <Empty
            title={t('暂无渠道成本数据')}
            description={t('当前筛选范围内没有可用于成本与利润统计的请求记录')}
          />
        ) : (
          <>
            <div className='flex flex-wrap gap-3 mb-3'>
              <div className='px-4 py-3 rounded-xl bg-blue-50'>
                <div className='text-xs text-gray-500'>{t('收入')}</div>
                <div className='font-semibold'>
                  {formatQuotaAsUsd(stat?.quota || 0)}
                </div>
              </div>
              <div className='px-4 py-3 rounded-xl bg-orange-50'>
                <div className='text-xs text-gray-500'>{t('上游成本')}</div>
                <div className='font-semibold'>
                  {formatQuotaAsUsd(stat?.upstream_cost_quota || 0)}
                </div>
              </div>
              <div className='px-4 py-3 rounded-xl bg-green-50'>
                <div className='text-xs text-gray-500'>{t('利润')}</div>
                <div className='font-semibold'>
                  {formatQuotaAsUsd(stat?.profit_quota || 0)}
                </div>
              </div>
              <div className='px-4 py-3 rounded-xl bg-gray-50'>
                <div className='text-xs text-gray-500'>{t('成本覆盖率')}</div>
                <div className='font-semibold'>
                  {formatCoverageRate(stat?.cost_coverage_rate || 0)}
                </div>
              </div>
            </div>
            {stat?.cost_coverage_rate < 1 && (
              <Text type='tertiary' className='block mb-3'>
                {t('仅统计已记录上游成本的请求')}
              </Text>
            )}
            <Table
              size='small'
              bordered={false}
              loading={loading}
              columns={columns}
              dataSource={channels}
              rowKey='channel_id'
              pagination={false}
              empty={
                <Empty
                  image={null}
                  description={t('暂无渠道成本数据')}
                  style={{ padding: 24 }}
                />
              }
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminCostProfitPanel;
