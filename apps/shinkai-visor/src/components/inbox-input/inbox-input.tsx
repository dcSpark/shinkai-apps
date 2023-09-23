import { SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

type InboxInputFieldType = {
  message: string;
};
type InboxInputProps = {
  onSubmit: (value: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
};
export const InboxInput = (props: InboxInputProps) => {
  const [form] = Form.useForm<InboxInputFieldType>();
  const intl = useIntl();
  const [submittable, setSubmittable] = useState(false);
  const currentFormValue = Form.useWatch([], form);
  const submit = () => {
    const value = currentFormValue?.message?.trim();
    if (value) {
      props.onSubmit(value);
      form.setFieldValue('message', '');
    }
  };
  useEffect(() => {
    setSubmittable(!!currentFormValue?.message?.trim());
  }, [currentFormValue]);
  return (
    <div className="w-full flex flex-row place-content-between space-x-3">
      <Space.Compact block>
        <Form
          autoComplete="off"
          className="grow"
          disabled={props.disabled}
          form={form}
          onSubmitCapture={() => submit()}
        >
          <Form.Item<InboxInputFieldType> name="message" required={false}>
            <Input placeholder={intl.formatMessage({ id: 'message.one' })} />
          </Form.Item>
        </Form>
        <Form.Item>
          <Button
            disabled={props.disabled || !submittable}
            htmlType="submit"
            icon={<SendOutlined />}
            loading={props.loading}
            onClick={() => submit()}
            type="primary"
          ></Button>
        </Form.Item>
      </Space.Compact>
    </div>
  );
};
