import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { validate } from '../../storage';
import './perms.css';
import { Messaging } from '../../messaging';
import { PermissionRequest, Permission } from '../../types';
import { motion } from 'framer-motion';
import cancelIcon from '../../icons/cancel-icon.svg';
import { permDescriptions } from '../../utils';

interface PermissionsPromptProps {
  perms: PermissionRequest;
}

export default function PermissionsPrompt(props: PermissionsPromptProps) {
  const history = useHistory();
  const [perms, setPerms] = useState(props.perms);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const [requesterType, setRequesterType] = useState('');
  const [requester, setRequester] = useState('');

  useEffect(() => {
    if (!perms.permissions.length) deny();
  }, [perms]);

  useEffect(() => {
    if (perms.name)
      setRequesterType('Extension: '), setRequester(`${perms.name} (id: ${perms.key})`);
    else setRequesterType('Website: '), setRequester(`${perms.key}`);
  }, []);

  function removePerm(perm: Permission) {
    const new_perms = {
      key: perms.key,
      permissions: perms.permissions.filter(p => p != perm),
      existing: perms.existing,
    };
    setPerms(new_perms);
  }

  async function grant() {
    const valid = await validate(pw);
    if (valid) {
      setError('');
      Messaging.sendToBackground({
        action: 'grant_perms',
        data: { request: perms },
      })
        .then(res => {
          history.push('/');
          window.close();
        })
        .catch(err => setError('Connection error'));
    } else setError('Wrong Password');
  }
  function deny() {
    Messaging.sendToBackground({ action: 'deny_perms' }).then(res => {
      history.push('/');
      window.close();
    });
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="permissions padding flex-grow-wrapper"
    >
      <h3 className="title-page centered">Permissions Requested</h3>
      <a
        href={perms.key}
        title={perms.key}
        rel="noopener noreferrer"
        target="_blank"
        className="requesting-domain"
      >
        {requester}
      </a>
      <p className="description margin-0 centered">requested the following permissions:</p>
      <div className="permission-request-list">
        <ul>
          {perms.permissions.map(perm => {
            return (
              <li key={perm}>
                <Chip type={'new'} perm={perm} description="description" destroyPerm={removePerm} />
              </li>
            );
          })}
        </ul>
      </div>
      {/* {perms.existing && <Existing {...props}/>} */}
      <p className="title-footer">Grant Permissions</p>
      <div className="block-footer">
        <div className="perm-req-password-box">
          <input
            onChange={e => setPw(e.currentTarget.value)}
            type="password"
            placeholder="Master Password"
          />
          <p className="errorMessage">{error}</p>
        </div>
        <div className="two-buttons">
          <button className="linear-red-bg" onClick={deny} type="submit">
            Deny
          </button>
          <div className="separator" />
          <button className="single-button" onClick={grant} type="submit">
            Grant
          </button>
        </div>
      </div>
    </motion.div>
  );
}
interface ExistingProps {
  perms: PermissionRequest;
}
function Existing(props: ExistingProps) {
  return (
    <>
      <p>Following permissions already granted:</p>
      <ul>
        {props.perms?.existing.map(perm => (
          <li key={perm}>
            <Chip type={'old'} perm={perm} />{' '}
          </li>
        ))}
      </ul>
    </>
  );
}
type chipType = 'new' | 'old';
interface ChipProps {
  description?: string;
  perm: Permission;
  destroyPerm?: (perm: Permission) => void;
  type: chipType;
}
export function Chip(props: ChipProps) {
  function destroy() {
    props.destroyPerm(props.perm);
  }
  return (
    <div className="chip">
      <div className="vertical">
        <label className="perm-label">{props.perm}</label>
        {/* //TODO: add corresponding description to each permission */}
        <p className="perm-description">{permDescriptions[props.perm]}</p>
      </div>
      {/* This is not working as a checkbox, like the new mockups. */}
      {props.type == 'new' && (
        <span className="close " onClick={destroy}>
          <img src={cancelIcon} alt="alert" />
        </span>
      )}
      {props.type == 'old' && (
        <div className="flex">
          <img src={cancelIcon} alt="alert" />
          {/* <p className="revoke">Revoke</p> */}
        </div>
      )}
    </div>
  );
}
