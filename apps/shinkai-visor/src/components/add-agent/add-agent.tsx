import { Button, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState, useTypedDispatch } from '../../store';
import { addAgent } from '../../store/agents/agents-actions';

type AddAgentFieldType = {
  agentName: string;
  externalUrl: string;
  apiKey: string;
  model: Models;
};

enum Models {
  OpenAI,
  SleepApi,
}

export const AddAgent = () => {
  const history = useHistory();
  const [form] = Form.useForm<AddAgentFieldType>();
  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();
  const isLoading = useSelector(
    (state: RootState) => state.agents?.add?.status === 'loading'
  );
  const dispatch = useTypedDispatch();
  const [submittable, setSubmittable] = useState(false);
  const currentFormValue = Form.useWatch([], form);
  const submit = () => {
    dispatch(
      addAgent({
        agent: {
          agentName: currentFormValue.agentName,
          externalUrl: currentFormValue.externalUrl,
          apiKey: currentFormValue.apiKey,
          model:
            currentFormValue.model === Models.OpenAI
              ? { OpenAI: { model_type: 'gpt-3.5-turbo' } }
              : { SleepAPI: {} },
        },
      })
    )
      .unwrap()
      .then(() => {
        history.replace('/agents');
      })
      .catch(() => {
        messageApi.open({
          type: 'error',
          content: 'Error adding agent',
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
          <Form.Item<AddAgentFieldType>
            name="agentName"
            rules={[{ required: true }]}
          >
            <Input placeholder={intl.formatMessage({ id: 'agent-name' })} />
          </Form.Item>
          <Form.Item<AddAgentFieldType>
            name="externalUrl"
            rules={[{ required: true }]}
          >
            <Input placeholder={intl.formatMessage({ id: 'external-url' })} />
          </Form.Item>
          <Form.Item<AddAgentFieldType>
            name="apiKey"
            rules={[{ required: true }]}
          >
            <Input placeholder={intl.formatMessage({ id: 'api-key' })} />
          </Form.Item>
          <Form.Item<AddAgentFieldType>
            name="model"
            rules={[{ required: true }]}
          >
            <Select
              getPopupContainer={(trigger) => trigger.parentElement}
              options={[
                {
                  value: Models.OpenAI,
                  label: intl.formatMessage({ id: 'openai' }),
                },
                {
                  value: Models.SleepApi,
                  label: intl.formatMessage({ id: 'sleep-api' }),
                },
              ]}
            />
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
            <FormattedMessage id="add-agent" />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
