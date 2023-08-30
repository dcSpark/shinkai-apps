import * as React from 'react';
import { EncryptedLLMCredentials } from '../../types';
import { Messaging } from '../../messaging';
import { getIcon } from '../../utils';
import { useHistory } from 'react-router-dom';
import './list.css';

interface LLMProps {
  active: EncryptedLLMCredentials;
  llm: EncryptedLLMCredentials;
}
export default function LLM(props: LLMProps) {
  const history = useHistory();
  const displayName = props.llm.llmName;

  function select(): void {
    Messaging.sendToBackground({
      action: 'select_llm',
      data: { ship: props.llm },
    }).then(res => history.push(`/llm/${props.llm.llmName}`));
  }

  return (
    <div
      onClick={select}
      className={props.active?.llmName == props.llm.llmName ? ' ship active-ship' : 'ship'}
    >
      <div
        className={
          props.active?.llmName == props.llm.llmName ? 'active-label' : 'inactive-label'
        }
      >
        Connected
      </div>
      <div className="vertical name-container">
        {displayName}
        <div className="type-label">
          <img src={getIcon(props.llm.llmName)} className="type-icon" />
          <p>Standard</p>
        </div>
      </div>
    </div>
  );
}
