import React, { useCallback, useMemo } from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Input from '../Input';
import { MenuItem, ContextMenuItem } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  metadata?: Object;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  contextItems: (items: ContextMenuItem[]) => void;
  selectedToInput: MenuItem;
  selected: MenuItem;
  argPreview?: Boolean;
  landscapeFork: string;
}

const GroupsInput = (props: InputProps) => {
  const [our, setOur] = useState(null);
  const [url, setUrl] = useState(null);
  const [contextItems, setContextItems] = useState([] as ContextMenuItem[]);
  const [groups, setGroups] = useState([] as ContextMenuItem[]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      if (isSubscribed) {
        setOur(res.active.shipName);
        setUrl(res.airlock.url);
      }
    });
    return () => {
      isSubscribed = false;
    };
  });

  useEffect(() => {
    if (props.metadata) {
      if (groups.length == 0) {
        const groups = Object.values(props.metadata)
          .filter(data => data['app-name'] == 'groups')
          .map(
            group =>
              ({
                commandTitle: 'Groups',
                title: (group.group as string).substring(6),
                description: group.metadata.description,
                creatorId: group.metadata?.creator,
              } as ContextMenuItem)
          );
        setGroups(groups);
        setContextItems(groups);
      }
    }
  }, [props.metadata]);

  const handleInputChange = (change: any) => {
    if (change.target) {
      const inp = change.target.innerText.toLowerCase();

      if (inp.length > 0) {
        const filtered = groups.filter(group => group.title.toLowerCase().includes(inp));

        if (contextItems.length == filtered.length) {
          return;
        } else {
          setContextItems(filtered);
        }
      }
    }
  };

  useEffect(() => {
    if (contextItems) props.contextItems(contextItems);
  }, [contextItems]);

  useEffect(() => {
    let isSubscribed = true;

    if (props.sendCommand) {
      if (!props.selected?.title) {
        props.airlockResponse({ type: 'internal', message: 'Please select a group' });
      } else {
        const data = {
          url:
            props.landscapeFork == 'escape'
              ? `${url}/apps/escape/~landscape/ship/${props.selected.title}`
              : `${url}/apps/landscape/~landscape/ship/${props.selected.title}`,
        };
        Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data });
        props.clearSelected(true);
      }
    }

    return () => {
      isSubscribed = false;
    };
  }, [props.sendCommand]);

  return (
    <Input {...props} response={false} inputChange={(change: any) => handleInputChange(change)} />
  );
};

export default GroupsInput;
