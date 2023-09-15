import { Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../../store';
import { createInbox } from '../../store/inbox/inbox-actions';

type CreateInboxFieldType = {
  receiverIdentity: string;
  message: string;
};

export const CreateInbox = () => {
  const history = useHistory();
  const [form] = Form.useForm<CreateInboxFieldType>();
  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();
  const createInboxStatus = useSelector((state: RootState) => state.inbox?.create?.status);
  const createdInbox = useSelector((state: RootState) => state.inbox?.create?.data);
  const dispatch = useDispatch();
  const [submittable, setSubmittable] = useState(false);
  const node = useSelector((state: RootState) => state.node.data);
  const currentFormValue = Form.useWatch([], form);
  const isCreatingInbox = () => {
    return createInboxStatus === 'loading';
  }
  const submit = () => {
    dispatch(createInbox({ receiverIdentity: currentFormValue.receiverIdentity, message: currentFormValue.message }));
  }
  useEffect(() => {
    form.validateFields({ validateOnly: true, recursive: true }).then(
      () => {
        setSubmittable(true);
      },
      () => {
        setSubmittable(false);
      }
    );
  }, [form, currentFormValue]);
  useEffect(() => {
    if (!node) {
      return;
    }
    const defaultReceiverIdentity = `${node.nodeData.shinkaiIdentity}/${node.nodeData.profile}/device/${node.userData.registrationName}`;
    form.setFieldValue('receiverIdentity', defaultReceiverIdentity);
  }, [form, node]);
  useEffect(() => {
    switch (createInboxStatus) {
      case 'failed':
        messageApi.open({
          type: 'error',
          content: 'Error creating inbox',
        });
        break;
      case 'succeeded':
        if (createdInbox?.inbox?.id) {
          history.replace(`/inboxes/${encodeURIComponent(createdInbox?.inbox?.id)}`);
        }
        break;
    }
  }, [createInboxStatus, messageApi, history, createdInbox]);
  return (
    <div className="h-full flex flex-col grow place-content-center">
      {contextHolder}
      <Form
        autoComplete="off"
        disabled={createInboxStatus === 'loading'}
        form={form}
      >
        <Form.Item<CreateInboxFieldType>
          name="receiverIdentity"
          rules={[{ required: true }]}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'message-receiver' })}
          />
        </Form.Item>
        <Form.Item<CreateInboxFieldType>
          name="message"
          rules={[{ required: true }]}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'message.one' })}
          />
        </Form.Item>

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
      </Form>
    </div>
  );
};
