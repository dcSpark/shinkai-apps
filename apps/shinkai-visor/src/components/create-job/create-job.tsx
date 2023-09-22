import { Button, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState, useTypedDispatch } from '../../store';
import { getAgents } from '../../store/agents/agents-actions';
import { createJob } from '../../store/jobs/jobs-actions';

type CreateJobFieldType = {
  agent: string;
  content: string;
};

export const CreateJob = () => {
  const history = useHistory();
  const [form] = Form.useForm<CreateJobFieldType>();
  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();
  const isLoading = useSelector(
    (state: RootState) => state.jobs?.create?.status === 'loading'
  );
  const dispatch = useTypedDispatch();
  const [submittable, setSubmittable] = useState(false);
  const currentFormValue = Form.useWatch([], form);
  const agents = useSelector((state: RootState) => state.agents?.agents?.data);
  const submit = () => {
    dispatch(
      createJob({
        agentId: currentFormValue.agent,
        content: currentFormValue.content,
      })
    )
      .unwrap()
      .then(() => {
        history.replace('/inboxes');
      })
      .catch(() => {
        messageApi.open({
          type: 'error',
          content: 'Error creating job',
        });
      });
  };
  useEffect(() => {
    dispatch(getAgents());
  }, [dispatch]);
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
  return (
    <div className="h-full">
      {contextHolder}
      <Form
        autoComplete="off"
        className="h-full flex flex-col grow place-content-between"
        disabled={isLoading}
        form={form}
        onSubmitCapture={() => submit()}
      >
        <div className="flex flex-col grow">
          <Form.Item<CreateJobFieldType>
            name="agent"
            rules={[{ required: true }]}
          >
            <Select
              options={agents?.map((agent) => ({
                value: agent.id,
                label: (agent.full_identity_name as any)?.subidentity_name,
              }))}
            />
          </Form.Item>
          <Form.Item<CreateJobFieldType>
            name="content"
            rules={[{ required: true }]}
          >
            <Input placeholder={intl.formatMessage({ id: 'tmwtd' })} />
          </Form.Item>
        </div>
        <Form.Item>
          <Button
            className="w-full"
            disabled={isLoading || !submittable}
            htmlType="submit"
            loading={isLoading}
            onClick={() => submit()}
            type="primary"
          >
            <FormattedMessage id="create-job" />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
