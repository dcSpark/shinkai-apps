import { Button, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { useQuery } from '../../hooks/use-query';
import { RootState, useTypedDispatch } from '../../store';
import { getAgents } from '../../store/agents/agents-actions';
import { createJob } from '../../store/jobs/jobs-actions';

type CreateJobFieldType = {
  agent: string;
  content: string;
};

export const CreateJob = () => {
  const history = useHistory();
  const query = useQuery();
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
  useEffect(() => {
    if (agents?.length === 1) {
      form.setFieldValue('agent', agents[0].id);
    }
  }, [agents, form]);
  const submit = () => {
    let content = currentFormValue.content;
    if (query.has('context')) {
      content = `${currentFormValue.content} - ${query.get('context')}`;
    }
    dispatch(
      createJob({
        agentId: currentFormValue.agent,
        content,
      })
    )
      .unwrap()
      .then((value) => {
        const jobId = encodeURIComponent(`job_inbox::${value.job.id}::false`);
        history.replace(`/inboxes/${jobId}`);
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
              getPopupContainer={(trigger) => trigger.parentElement}
              options={agents?.map((agent) => ({
                value: agent.id,
                label: (agent.full_identity_name as any)?.subidentity_name,
              }))}
            />
          </Form.Item>
          {query.has('context') && (
            <blockquote className="max-h-28 p-4 mb-5 border-l-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800">
              <p className="italic dark:text-white text-ellipsis overflow-hidden h-full">
                {query.get('context')}
              </p>
            </blockquote>
          )}
          <Form.Item<CreateJobFieldType>
            name="content"
            rules={[{ required: true }]}
          >
            <Input autoFocus placeholder={intl.formatMessage({ id: 'tmwtd' })} />
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
