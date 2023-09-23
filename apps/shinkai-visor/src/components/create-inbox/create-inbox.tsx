import { Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState, useTypedDispatch } from '../../store';
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
  const createInboxStatus = useSelector(
    (state: RootState) => state.inbox?.create?.status
  );
  const dispatch = useTypedDispatch();
  const [submittable, setSubmittable] = useState(false);
  const node = useSelector((state: RootState) => state.node.data);
  const currentFormValue = Form.useWatch([], form);
  const isCreatingInbox = () => {
    return createInboxStatus === 'loading';
  };
  const submit = () => {
    dispatch(
      createInbox({
        receiverIdentity: currentFormValue.receiverIdentity,
        message: currentFormValue.message,
      })
    )
      .unwrap()
      .then((createdInbox) => {
        history.replace(
          `/inboxes/${encodeURIComponent(createdInbox.inbox.id)}`
        );
      })
      .catch(() => {
        messageApi.open({
          type: 'error',
          content: 'Error creating inbox',
        });
      });
  };
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
  return (
    <div className="h-full">
      {contextHolder}
      <Form
        autoComplete="off"
        className="h-full flex flex-col grow place-content-between"
        disabled={createInboxStatus === 'loading'}
        form={form}
        onSubmitCapture={() => submit()}
      >
        <div className="flex flex-col grow">
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
            <Input placeholder={intl.formatMessage({ id: 'message.one' })} />
          </Form.Item>
        </div>

        <Form.Item>
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
        </Form.Item>
      </Form>
    </div>
  );
};
