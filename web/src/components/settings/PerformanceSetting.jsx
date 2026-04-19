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
import { Card, Spin } from '@douyinfe/semi-ui';
import SettingsPerformance from '../../pages/Setting/Performance/SettingsPerformance';
import { API, showError, toBoolean } from '../../helpers';

const PerformanceSetting = () => {
  let [inputs, setInputs] = useState({
    'performance_setting.disk_cache_enabled': false,
    'performance_setting.disk_cache_threshold_mb': 10,
    'performance_setting.disk_cache_max_size_mb': 1024,
    'performance_setting.disk_cache_path': '',
    'ChannelSmartRoutingEnabled': false,
  });

  let [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (success) {
      // 保留初始默认值，用 API 返回值覆盖
      let newInputs = {
        'performance_setting.disk_cache_enabled': false,
        'performance_setting.disk_cache_threshold_mb': 10,
        'performance_setting.disk_cache_max_size_mb': 1024,
        'performance_setting.disk_cache_path': '',
        'ChannelSmartRoutingEnabled': false,
      };
      data.forEach((item) => {
        // 根据初始默认值类型决定如何解析
        if (typeof newInputs[item.key] === 'boolean') {
          newInputs[item.key] = toBoolean(item.value);
        } else if (typeof newInputs[item.key] === 'number') {
          newInputs[item.key] = parseInt(item.value) || newInputs[item.key];
        } else {
          newInputs[item.key] = item.value;
        }
      });
      setInputs(newInputs);
    } else {
      showError(message);
    }
  };

  async function onRefresh() {
    try {
      setLoading(true);
      await getOptions();
    } catch (error) {
      showError('刷新失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <>
      <Spin spinning={loading} size='large'>
        {/* 性能设置 */}
        <Card style={{ marginTop: '10px' }}>
          <SettingsPerformance options={inputs} refresh={onRefresh} />
        </Card>
      </Spin>
    </>
  );
};

export default PerformanceSetting;
