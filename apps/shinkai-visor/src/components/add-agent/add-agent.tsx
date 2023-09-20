import { Button, Form, Input, message,Select } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../../store';
import { addAgent } from '../../store/agents/agents-actions';

type AddAgentFieldType = {
  agentName: string;
  externalUrl: string;
  apiKey: string;
  model: Models,
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
  const addAgentStatus = useSelector((state: RootState) => state.agents?.add?.status);
  const dispatch = useDispatch();
  const [submittable, setSubmittable] = useState(false);
  const node = useSelector((state: RootState) => state.node.data);
  const currentFormValue = Form.useWatch([], form);
  const isAddingAgent = () => {
    return addAgentStatus === 'loading';
  }
  const submit = () => {
    dispatch(addAgent({ agent: {
      agentName: currentFormValue.agentName,
      externalUrl: currentFormValue.externalUrl,
      apiKey: currentFormValue.apiKey,
      model: currentFormValue.model === Models.OpenAI ? { OpenAI: { model_type: 'gpt-3.5-turbo' }} : { SleepAPI: {} },
    }}));
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
    switch (addAgentStatus) {
      case 'failed':
        messageApi.open({
          type: 'error',
          content: 'Error adding agent',
        });
        break;
      case 'succeeded':
        history.replace('/agents');
        break;
    }
  }, [addAgentStatus, messageApi, history]);
  return (
    <div className="h-full flex flex-col grow place-content-between">
      {contextHolder}
      <Form
        autoComplete="off"
        disabled={addAgentStatus === 'loading'}
        form={form}
      >
        <Form.Item<AddAgentFieldType>
          name="agentName"
          rules={[{ required: true }]}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'agent-name' })}
          />
        </Form.Item>
        <Form.Item<AddAgentFieldType>
          name="externalUrl"
          rules={[{ required: true }]}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'external-url' })}
          />
        </Form.Item>
        <Form.Item<AddAgentFieldType>
          name="apiKey"
          rules={[{ required: true }]}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'api-key' })}
          />
        </Form.Item>
        <Form.Item<AddAgentFieldType>
          name="model"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: Models.OpenAI, label: intl.formatMessage({ id: 'openai' }) },
              { value: Models.SleepApi, label: intl.formatMessage({ id: 'sleep-api' }) },
            ]}
          />
        </Form.Item>
      </Form>
      <Form.Item>
          <div className="flex flex-col space-y-1">
            <Button
              className="w-full"
              disabled={isAddingAgent() || !submittable}
              htmlType="submit"
              loading={isAddingAgent()}
              onClick={() => submit()}
              type="primary"
            >
              <FormattedMessage id="add-agent" />
            </Button>
          </div>
        </Form.Item>
    </div>
  );
};
