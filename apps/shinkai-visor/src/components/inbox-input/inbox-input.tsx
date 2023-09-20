import { Button, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../../store';
import { sendMessage } from '../../store/inbox/inbox-actions';

type InboxInputFieldType = {
  message: string;
};

export const InboxInput = ({ inboxId }: { inboxId: string }) => {
  const history = useHistory();
  const [form] = Form.useForm<InboxInputFieldType>();
  const intl = useIntl();
  const createInboxStatus = useSelector((state: RootState) => state.inbox?.create?.status);
  const createdInbox = useSelector((state: RootState) => state.inbox?.create?.data);
  const dispatch = useDispatch();
  const [submittable, setSubmittable] = useState(false);
  const currentFormValue = Form.useWatch([], form);
  const isCreatingInbox = () => {
    return createInboxStatus === 'loading';
  }
  const submit = () => {
    if (currentFormValue.message) {
        dispatch(sendMessage({ inboxId, message: currentFormValue.message }));
        form.setFieldsValue({ message: '' });
    }
  }
  useEffect(() => {
    setSubmittable(!!currentFormValue?.message);
  }, [currentFormValue]);
  useEffect(() => {
    switch (createInboxStatus) {
      case 'succeeded':
        if (createdInbox?.inbox?.id) {
          history.replace(`/inboxes/${encodeURIComponent(createdInbox?.inbox?.id)}`);
        }
        break;
    }
  }, [createInboxStatus, history, createdInbox]);
  return (
    <div className="w-full flex flex-row place-content-between">
      <Form
        autoComplete="off"
        disabled={createInboxStatus === 'loading'}
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
              disabled={isCreatingInbox() || !submittable}
              htmlType="submit"
              loading={isCreatingInbox()}
              onClick={() => submit()}
              type="primary"
            >
              <FormattedMessage id="create-inbox" />
            </Button>
          </div>
        </Form.Item>
    </div>
  );
};
