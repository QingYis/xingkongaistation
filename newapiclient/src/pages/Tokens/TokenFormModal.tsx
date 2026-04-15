import { Modal, Form, Input, InputNumber, DatePicker, Switch, message } from 'antd';
import { useState, useEffect } from 'react';
import { tokenService } from '../../services/tauri';
import type { Token, CreateTokenRequest, UpdateTokenRequest } from '../../types/api';
import dayjs from 'dayjs';

interface TokenFormModalProps {
  open: boolean;
  token: Token | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TokenFormModal({ open, token, onCancel, onSuccess }: TokenFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [unlimitedQuota, setUnlimitedQuota] = useState(false);

  useEffect(() => {
    if (open && token) {
      form.setFieldsValues({
        name: token.name,
        remain_quota: token.remain_quota,
        unlimited_quota: token.unlimited_quota,
        expired_time: token.expired_time > 0 ? dayjs.unix(token.expired_time) : null,
      });
      setUnlimitedQuota(token.unlimited_quota);
    } else if (open) {
      form.resetFields();
      setUnlimitedQuota(false);
    }
  }, [open, token, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (token) {
        const request: UpdateTokenRequest = {
          id: token.id,
          name: values.name,
          remain_quota: unlimitedQuota ? 0 : values.remain_quota,
          unlimited_quota: unlimitedQuota,
          expired_time: values.expired_time ? dayjs(values.expired_time).unix() : 0,
        };
        await tokenService.updateToken(request);
        message.success('更新成功');
      } else {
        const request: CreateTokenRequest = {
          name: values.name,
          remain_quota: unlimitedQuota ? 0 : values.remain_quota,
          unlimited_quota: unlimitedQuota,
          expired_time: values.expired_time ? dayjs(values.expired_time).unix() : 0,
        };
        await tokenService.createToken(request);
        message.success('创建成功');
      }

      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(`${token ? '更新' : '创建'}失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={token ? '编辑令牌' : '创建令牌'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={token ? '更新' : '创建'}
      cancelText="取消"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: '请输入令牌名称' }]}
        >
          <Input placeholder="例如: 生产环境令牌" />
        </Form.Item>

        <Form.Item
          label="无限额度"
          name="unlimited_quota"
          valuePropName="checked"
        >
          <Switch onChange={setUnlimitedQuota} />
        </Form.Item>

        {!unlimitedQuota && (
          <Form.Item
            label="剩余额度"
            name="remain_quota"
            rules={[
              { required: true, message: '请输入剩余额度' },
              { type: 'number', min: 0, message: '额度不能为负数' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="令牌可用额度"
              min={0}
            />
          </Form.Item>
        )}

        <Form.Item
          label="过期时间"
          name="expired_time"
          tooltip="不设置则永不过期"
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="选择过期时间（可选）"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
