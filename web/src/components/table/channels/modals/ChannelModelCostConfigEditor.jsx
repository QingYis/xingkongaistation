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

import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IconDelete,
  IconPlus,
  IconSearch,
} from '@douyinfe/semi-icons';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';

const { Text } = Typography;
const PRICE_SUFFIX = '$/1M tokens';

const EMPTY_MODEL = {
  model_name: '',
  enabled: true,
  billing_type: 'per_token',
  input_price: '',
  output_price: '',
  cache_read_price: '',
  cache_write_price: '',
  image_price: '',
  audio_input_price: '',
  audio_output_price: '',
  call_price: '',
  currency: 'USD',
};

const hasValue = (value) =>
  value !== '' && value !== null && value !== undefined && value !== false;

const normalizeValue = (value) =>
  value === '' || value === null || value === undefined ? '' : String(value);

const PriceInput = ({
  label,
  value,
  placeholder,
  onChange,
  suffix = PRICE_SUFFIX,
  extraText = '',
  disabled = false,
}) => (
  <div style={{ marginBottom: 16 }}>
    <div className='mb-1 font-medium text-gray-700'>{label}</div>
    <Input
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      suffix={suffix}
      disabled={disabled}
    />
    {extraText ? (
      <div className='mt-1 text-xs text-gray-500'>{extraText}</div>
    ) : null}
  </div>
);

const buildSummaryText = (model, t) => {
  if (model.billing_type === 'per_call' && hasValue(model.call_price)) {
    return `${t('按次')} $${model.call_price} / ${t('次')}`;
  }
  if (hasValue(model.input_price)) {
    const extraCount = [
      model.output_price,
      model.cache_read_price,
      model.cache_write_price,
      model.image_price,
      model.audio_input_price,
      model.audio_output_price,
    ].filter(hasValue).length;
    const extraLabel = extraCount > 0 ? `，${t('额外价格项')} ${extraCount}` : '';
    return `${t('输入')} $${model.input_price}${extraLabel}`;
  }
  return t('未设置价格');
};

const ChannelModelCostConfigEditor = ({
  value,
  onChange,
  candidateModelNames = [],
  t,
}) => {
  const isMobile = useIsMobile();
  const [selectedModelName, setSelectedModelName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  const modelOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (candidateModelNames || [])
            .map((item) => String(item || '').trim())
            .filter(Boolean),
        ),
      ).map((name) => ({
        label: name,
        value: name,
      })),
    [candidateModelNames],
  );

  const models = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const filteredModels = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return models;
    return models.filter((item) =>
      String(item.model_name || '').toLowerCase().includes(keyword),
    );
  }, [models, searchText]);

  const selectedModel = useMemo(() => {
    if (selectedModelName) {
      return (
        models.find((item) => item.model_name === selectedModelName) || null
      );
    }
    return models[0] || null;
  }, [models, selectedModelName]);

  const updateModel = (modelName, patch) => {
    onChange(
      models.map((item) =>
        item.model_name === modelName ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeModel = (modelName) => {
    const next = models.filter((item) => item.model_name !== modelName);
    onChange(next);
    if (selectedModelName === modelName) {
      setSelectedModelName(next[0]?.model_name || '');
    }
  };

  const addModel = () => {
    const modelName = newModelName.trim();
    if (!modelName) return;
    if (models.some((item) => item.model_name === modelName)) {
      setSelectedModelName(modelName);
      setAddVisible(false);
      setNewModelName('');
      return;
    }
    const nextModel = { ...EMPTY_MODEL, model_name: modelName };
    const next = [...models, nextModel];
    onChange(next);
    setSelectedModelName(modelName);
    setAddVisible(false);
    setNewModelName('');
  };

  const columns = [
    {
      title: t('模型名称'),
      dataIndex: 'model_name',
      key: 'model_name',
      render: (_, record) => (
        <Button
          theme='borderless'
          type='tertiary'
          onClick={() => setSelectedModelName(record.model_name)}
          style={{
            padding: 0,
            color:
              record.model_name === selectedModel?.model_name
                ? 'var(--semi-color-primary)'
                : undefined,
          }}
        >
          {record.model_name}
        </Button>
      ),
    },
    {
      title: t('计费方式'),
      key: 'billing_type',
      render: (_, record) => (
        <Tag color={record.billing_type === 'per_call' ? 'teal' : 'violet'}>
          {record.billing_type === 'per_call'
            ? t('按次计费')
            : t('按量计费')}
        </Tag>
      ),
    },
    {
      title: t('价格摘要'),
      key: 'summary',
      render: (_, record) => buildSummaryText(record, t),
    },
    {
      title: t('操作'),
      key: 'action',
      render: (_, record) => (
        <Button
          size='small'
          type='danger'
          icon={<IconDelete />}
          onClick={() => removeModel(record.model_name)}
        />
      ),
    },
  ];

  return (
    <>
      <Space vertical align='start' style={{ width: '100%' }}>
        <Space wrap className='mt-2'>
          <Button icon={<IconPlus />} onClick={() => setAddVisible(true)}>
            {t('添加模型')}
          </Button>
          <Input
            prefix={<IconSearch />}
            placeholder={t('搜索模型名称')}
            value={searchText}
            onChange={(nextValue) => setSearchText(nextValue)}
            style={{ width: isMobile ? '100%' : 220 }}
            showClear
          />
        </Space>

        <div
          style={{
            width: '100%',
            display: 'grid',
            gap: 16,
            gridTemplateColumns: isMobile
              ? 'minmax(0, 1fr)'
              : 'minmax(360px, 1fr) minmax(560px, 1.25fr)',
          }}
        >
          <Card
            bodyStyle={{ padding: 0 }}
            style={isMobile ? { order: 2 } : undefined}
          >
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={columns}
                dataSource={filteredModels}
                rowKey='model_name'
                pagination={false}
                empty={
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    {t('暂无模型')}
                  </div>
                }
                onRow={(record) => ({
                  style: {
                    background:
                      record.model_name === selectedModel?.model_name
                        ? 'var(--semi-color-primary-light-default)'
                        : undefined,
                    boxShadow:
                      record.model_name === selectedModel?.model_name
                        ? 'inset 4px 0 0 var(--semi-color-primary)'
                        : undefined,
                  },
                  onClick: () => setSelectedModelName(record.model_name),
                })}
                scroll={isMobile ? { x: 680 } : undefined}
              />
            </div>
          </Card>

          <Card
            style={isMobile ? { order: 1 } : undefined}
            title={selectedModel ? selectedModel.model_name : t('模型成本编辑器')}
            headerExtraContent={
              selectedModel ? (
                <Tag
                  color={
                    selectedModel.billing_type === 'per_call' ? 'teal' : 'violet'
                  }
                >
                  {selectedModel.billing_type === 'per_call'
                    ? t('按次计费')
                    : t('按量计费')}
                </Tag>
              ) : null
            }
          >
            {!selectedModel ? (
              <Empty
                title={t('暂无模型')}
                description={t('请先新增模型或从左侧列表选择一个模型')}
              />
            ) : (
              <div>
                <div className='mb-4'>
                  <div className='mb-2 font-medium text-gray-700'>
                    {t('模型')}
                  </div>
                  <Select
                    value={selectedModel.model_name}
                    optionList={modelOptions}
                    onChange={(nextValue) => {
                      const trimmed = String(nextValue || '').trim();
                      if (!trimmed || trimmed === selectedModel.model_name) return;
                      if (models.some((item) => item.model_name === trimmed)) {
                        setSelectedModelName(trimmed);
                        return;
                      }
                      onChange(
                        models.map((item) =>
                          item.model_name === selectedModel.model_name
                            ? { ...item, model_name: trimmed }
                            : item,
                        ),
                      );
                      setSelectedModelName(trimmed);
                    }}
                    style={{ width: '100%' }}
                    placeholder={t('从该渠道支持模型中选择')}
                    filter
                    showClear={false}
                  />
                  <div className='mt-2 text-xs text-gray-500'>
                    {t('模型成本配置支持直接从该渠道“基础配置”中的模型列表里选取。')}
                  </div>
                </div>

                <div className='mb-4'>
                  <div className='mb-2 font-medium text-gray-700'>
                    {t('计费方式')}
                  </div>
                  <RadioGroup
                    type='button'
                    value={selectedModel.billing_type}
                    onChange={(event) =>
                      updateModel(selectedModel.model_name, {
                        billing_type: event.target.value,
                      })
                    }
                  >
                    <Radio value='per_token'>{t('按量计费')}</Radio>
                    <Radio value='per_call'>{t('按次计费')}</Radio>
                  </RadioGroup>
                </div>

                {selectedModel.billing_type === 'per_call' ? (
                  <PriceInput
                    label={t('固定价格')}
                    value={normalizeValue(selectedModel.call_price)}
                    placeholder={t('输入每次调用价格')}
                    suffix={t('$/次')}
                    onChange={(nextValue) =>
                      updateModel(selectedModel.model_name, {
                        call_price: nextValue,
                      })
                    }
                    extraText={t('适合 MJ / 任务类等按次收费模型。')}
                  />
                ) : (
                  <>
                    <Card
                      bodyStyle={{ padding: 16 }}
                      style={{
                        marginBottom: 16,
                        background: 'var(--semi-color-fill-0)',
                      }}
                    >
                      <div className='font-medium mb-3'>{t('基础价格')}</div>
                      <PriceInput
                        label={t('输入价格')}
                        value={normalizeValue(selectedModel.input_price)}
                        placeholder={t('输入 $/1M tokens')}
                        onChange={(nextValue) =>
                          updateModel(selectedModel.model_name, {
                            input_price: nextValue,
                          })
                        }
                      />
                      <PriceInput
                        label={t('输出价格')}
                        value={normalizeValue(selectedModel.output_price)}
                        placeholder={t('输入 $/1M tokens')}
                        onChange={(nextValue) =>
                          updateModel(selectedModel.model_name, {
                            output_price: nextValue,
                          })
                        }
                      />
                      <PriceInput
                        label={t('缓存读取价格')}
                        value={normalizeValue(selectedModel.cache_read_price)}
                        placeholder={t('输入 $/1M tokens')}
                        onChange={(nextValue) =>
                          updateModel(selectedModel.model_name, {
                            cache_read_price: nextValue,
                          })
                        }
                      />
                      <PriceInput
                        label={t('缓存创建价格')}
                        value={normalizeValue(selectedModel.cache_write_price)}
                        placeholder={t('输入 $/1M tokens')}
                        onChange={(nextValue) =>
                          updateModel(selectedModel.model_name, {
                            cache_write_price: nextValue,
                          })
                        }
                      />
                    </Card>

                    <Card
                      bodyStyle={{ padding: 16 }}
                      style={{
                        marginBottom: 16,
                        background: 'var(--semi-color-fill-0)',
                      }}
                    >
                      <div className='mb-3'>
                        <div className='font-medium'>{t('扩展价格')}</div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {t('这些价格都是可选项，不填也可以。')}
                        </div>
                      </div>
                      <PriceInput
                        label={t('图片输入价格')}
                        value={normalizeValue(selectedModel.image_price)}
                        placeholder={t('输入 $/1M tokens')}
                        onChange={(nextValue) =>
                          updateModel(selectedModel.model_name, {
                            image_price: nextValue,
                          })
                        }
                      />
                      <PriceInput
                        label={t('音频输入价格')}
                        value={normalizeValue(selectedModel.audio_input_price)}
                        placeholder={t('输入 $/1M tokens')}
                        onChange={(nextValue) =>
                          updateModel(selectedModel.model_name, {
                            audio_input_price: nextValue,
                          })
                        }
                      />
                      <PriceInput
                        label={t('音频补全价格')}
                        value={normalizeValue(selectedModel.audio_output_price)}
                        placeholder={t('输入 $/1M tokens')}
                        onChange={(nextValue) =>
                          updateModel(selectedModel.model_name, {
                            audio_output_price: nextValue,
                          })
                        }
                      />
                    </Card>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </Space>

      <Modal
        title={t('添加模型')}
        visible={addVisible}
        onCancel={() => {
          setAddVisible(false);
          setNewModelName('');
        }}
        onOk={addModel}
      >
        <Select
          value={newModelName}
          placeholder={t('从该渠道支持模型中选择')}
          optionList={modelOptions}
          onChange={(nextValue) => setNewModelName(String(nextValue || ''))}
          filter
          style={{ width: '100%' }}
        />
      </Modal>
    </>
  );
};

export default ChannelModelCostConfigEditor;
