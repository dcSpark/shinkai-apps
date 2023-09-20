import { SendOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../store';
import { sendMessage } from '../../store/inbox/inbox-actions';

type InboxInputFieldType = {
  message: string;
};

export const InboxInput = ({ inboxId }: { inboxId: string }) => {
  const [form] = Form.useForm<InboxInputFieldType>();
  const intl = useIntl();
  const sendMessageStatus = useSelector((state: RootState) => state.inbox?.sendMessage[inboxId]?.status);
  const dispatch = useDispatch();
  const [submittable, setSubmittable] = useState(false);
  const currentFormValue = Form.useWatch([], form);
  const isSendingMessage = () => {
    return sendMessageStatus === 'loading';
  }
  const submit = () => {
    if (currentFormValue.message) {
        dispatch(sendMessage({ inboxId, message: currentFormValue.message }));
    }
  }
  useEffect(() => {
    setSubmittable(!!currentFormValue?.message);
  }, [currentFormValue]);
  useEffect(() => {
    switch (sendMessageStatus) {
      case 'succeeded':
        form.setFieldsValue({ message: '' });
        break;
    }
  }, [sendMessageStatus, form]);
  return (
    <div className="w-full flex flex-row place-content-between space-x-3">
      <Form
        autoComplete="off"
        className="grow"
        disabled={isSendingMessage()}
        form={form}
      >
        <Form.Item<InboxInputFieldType>
          name="message"
          required={false}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'message.one' })}
          />
        </Form.Item>
      </Form>
      <Form.Item>
          <div className="flex flex-col space-y-1">
            <Button
              className="w-full"
              disabled={isSendingMessage() || !submittable}
              htmlType="submit"
              icon={<SendOutlined />}
              loading={isSendingMessage()}
              onClick={() => submit()}
              type="primary"
            >
            </Button>
          </div>
        </Form.Item>
    </div>
  );
};
