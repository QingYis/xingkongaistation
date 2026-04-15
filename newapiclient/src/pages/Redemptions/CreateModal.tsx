import { Modal, Form, Input, InputNumber, DatePicker, message } from 'antd';
import { useState } from 'react';
import { redemptionService } from '../../services/tauri';
import type { CreateRedemptionRequest } from '../../types/api';
import dayjs from 'dayjs';

interface CreateModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CreateModal({ open, onCancel, onSuccess }: CreateModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const request: CreateRedemptionRequest = {
        name: values.name,
        quota: values.quota,
        count: values.count,
        expired_time: values.expired_time ? dayjs(values.expired_time).unix() : 0,
      };

      const keys = await redemptionService.createRedemptions(request);
      message.success(`成功创建 ${keys.length} 个兑换码`);

      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(`创建失败: ${error}`);
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
      title="批量创建兑换码"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="创建"
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
          rules={[{ required: true, message: '请输入兑换码名称' }]}
        >
          <Input placeholder="例如: 新用户福利" />
        </Form.Item>

        <Form.Item
          label="额度"
          name="quota"
          rules={[
            { required: true, message: '请输入额度' },
            { type: 'number', min: 1, message: '额度必须大于0' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="单个兑换码的额度"
            min={1}
          />
        </Form.Item>

        <Form.Item
          label="生成数量"
          name="count"
          rules={[
            { required: true, message: '请输入生成数量' },
            { type: 'number', min: 1, max: 100, message: '数量必须在1-100之间' }
          ]}
          initialValue={1}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="批量生成的兑换码数量"
            min={1}
            max={100}
          />
        </Form.Item>

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
