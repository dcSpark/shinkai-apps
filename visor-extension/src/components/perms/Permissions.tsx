import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { fetchAllPerms } from '../../agrihan';
import './perms.css';
import Sigil from '../ui/svg/Sigil';
import { Chip } from './PermissionsPrompt';
import { whatShip, processName } from '../../utils';
import { motion } from 'framer-motion';
import { Messaging } from '../../messaging';
import { EncryptedShipCredentials, PermissionsGraph, Permission } from '../../types';
import deleteIcon from '../../icons/delete-icon.svg';
import arrowIcon from '../../icons/arrow-down.svg';
import illustrationEmpty from '../../icons/illustration-empty.svg';

interface PermissionsProps {
  ship: EncryptedShipCredentials;
  shipURL: string;
  perms?: any;
}

export default function Permissions({ ship, shipURL, ...props }: PermissionsProps) {
  useEffect(() => {
    let isMounted = true;
    fetchAllPerms(shipURL).then(res => {
      if (isMounted) setPerms(res.bucket);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [perms, setPerms] = useState<PermissionsGraph>({});
  const [query, search] = useState('');
  const domains = Object.keys(perms).sort();
  const displayName = processName(ship.shipName);
  const shipname =
    whatShip(ship.shipName) === 'moon' ? (
      <p className="moonname shipname">
        <span>~{displayName.slice(0, -14)}</span>
        <span>{displayName.slice(-14)}</span>
      </p>
    ) : (
      <p className="shipname">~{displayName}</p>
    );

  function doDeleteDomain(domain: string) {
    Messaging.sendToBackground({
      action: 'remove_whole_domain',
      data: { url: shipURL, ship: ship.shipName, domain: domain },
    })
      .then(res => {
        fetchAllPerms(shipURL).then(res => {
          setPerms(res.bucket);
        });
      })
      .catch(err => console.log(err, 'error'));
  }
  function revokePerm(domain: string, perm: Permission) {
    Messaging.sendToBackground({
      action: 'revoke_perm',
      data: {
        url: shipURL,
        ship: ship.shipName,
        request: { key: domain, permissions: [perm] },
      },
    })
      .then(res => {
        fetchAllPerms(shipURL).then(res => {
          setPerms(res.bucket);
        });
      })
      .catch(err => console.log(err, 'error'));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="permissions flex-grow-wrapper"
    >
      <h1 className="title-page">Permissions</h1>
      <div className="ship-data">{shipname}</div>
      <div className="permission-search">
        <input
          onChange={e => search(e.currentTarget.value)}
          value={query}
          placeholder="Search"
          type="text"
        />
      </div>
      <div className="permslist perms-flex-grow-wrapper">
        {!domains.length ? (
          <div className="centered empty-container">
            <img src={illustrationEmpty} alt="" />
            <p>No permissions granted</p>
          </div>
        ) : !query.length ? (
          domains.map(domain => (
            <Domain
              shipURL={shipURL}
              ship={ship}
              key={domain}
              domain={domain}
              perms={perms[domain]}
              deleteDomain={doDeleteDomain}
              revokePerm={revokePerm}
            />
          ))
        ) : (
          domains
            .filter(d => d.includes(query))
            .map(domain => (
              <Domain
                shipURL={shipURL}
                ship={ship}
                key={domain}
                domain={domain}
                perms={perms[domain]}
                deleteDomain={doDeleteDomain}
                revokePerm={revokePerm}
              />
            ))
        )}
      </div>
    </motion.div>
  );
}

interface DomainProps {
  domain: string;
  ship: EncryptedShipCredentials;
  shipURL: string;
  perms: Permission[];
  deleteDomain: (domain: string) => void;
  revokePerm: (domain: string, perm: Permission) => void;
}
function Domain({ ship, shipURL, domain, perms, deleteDomain, revokePerm }: DomainProps) {
  const [toDisplay, display] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [revokingPerm, setRevoking] = useState<Permission>(null);
  const displayterms =
    toDisplay == domain ? (
      <DisplayPerms promptRevokePerm={(perm: Permission) => promptRevoke(perm)} perms={perms} />
    ) : (
      <div />
    );

  const [tooltip, setTooltip] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState(null);
  const toolTipParent = useRef(null);

  const extName = perms.find(perm => perm.includes('extName'));

  function handleHover() {
    const cords = toolTipParent.current.getBoundingClientRect();
    const height = cords.top - 40;
    setTooltip(true);
    setTooltipStyles({ top: `${height}px`, left: '2rem' });
  }
  function handleUnhover() {
    setTooltip(false);
  }

  function uncollapse(domain: string) {
    if (toDisplay == domain) display('');
    else display(domain);
  }

  function promptDelete() {
    console.log('deleting domain');
    setRevoking(null);
    setDeleting(true);
  }
  function promptRevoke(perm: Permission) {
    console.log('revoking perm');
    setDeleting(false);
    setRevoking(perm);
  }
  function dispatchDeleteDomain() {
    deleteDomain(domain);
    setDeleting(false);
  }
  function dispatchRevokePerm() {
    revokePerm(domain, revokingPerm);
    setRevoking(null);
  }
  return (
    <div className="domain-wrapper perms-flex-grow-wrapper">
      <div className={toDisplay === domain ? 'domain border-none' : 'domain'}>
        <div role="button" className="collapse-header" onClick={() => uncollapse(domain)}>
          <img
            className={toDisplay === domain ? 'arrow-up' : 'arrow-down'}
            src={arrowIcon}
            alt=""
          />
          <p
            ref={toolTipParent}
            onMouseLeave={handleUnhover}
            onMouseEnter={handleHover}
            className="domain-text"
          >
            {extName ? JSON.parse(extName).extName : domain}
          </p>
          {extName && tooltip && (
            <div style={tooltipStyles} className="extension-id-tooltip">
              <p>{domain}</p>
            </div>
          )}
        </div>
        <button className="minibutton" onClick={promptDelete}>
          <img src={deleteIcon} alt="trash" />
        </button>
      </div>
      {displayterms}
      {deleting && (
        <ConfirmationPrompt
          message={`Revoke Permissions?`}
          cancel={() => setDeleting(false)}
          confirm={dispatchDeleteDomain}
        >
          <p className="description subtitle">{extName ? JSON.parse(extName).extName : domain}</p>
        </ConfirmationPrompt>
      )}
      {revokingPerm && (
        <ConfirmationPrompt
          message={`Revoke ${revokingPerm} permission?`}
          cancel={() => setRevoking(null)}
          confirm={dispatchRevokePerm}
        />
      )}
    </div>
  );
}

interface DPProps {
  perms: Permission[];
  promptRevokePerm: (perm: Permission) => void;
}
function DisplayPerms({ perms, promptRevokePerm }: DPProps) {
  if (perms.length)
    return (
      <div className="grantedperms flex-grow">
        {perms
          .filter((per: any) => !per.includes('extName'))
          .map((perm: any) => (
            <IndividualPerm key={perm} promptRevokePerm={promptRevokePerm} perm={perm} />
          ))}
      </div>
    );
  else return <p>No permissions</p>;
}
interface IPProps {
  perm: Permission;
  promptRevokePerm: (perm: Permission) => void;
}
function IndividualPerm({ perm, promptRevokePerm }: IPProps) {
  const revoke = () => promptRevokePerm(perm);
  return (
    <>
      <div onClick={revoke} className="permission-string" key={perm}>
        <Chip type={'old'} perm={perm} />
      </div>
    </>
  );
}
interface ConfirmationProps {
  message: string;
  children?: React.ReactNode;
  cancel: () => void;
  confirm: () => void;
}
function ConfirmationPrompt({ message, children, cancel, confirm }: ConfirmationProps) {
  return (
    <div className="perm-deletion-confirmation-container">
      <div className="perm-deletion-confirmation-prompt">
        <p className="title">{message}</p>
        {children}
        <div className="two-buttons">
          <button className="red-bg left" onClick={cancel}>
            No
          </button>
          <button className="linear-button right" onClick={confirm}>
            {' '}
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
