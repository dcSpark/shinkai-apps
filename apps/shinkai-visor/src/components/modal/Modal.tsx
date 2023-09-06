import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { shinkaiVisor } from '@shinkai/sv-core';
import Shinkai from '@urbit/http-api';
import { Messaging } from '../../messaging';
import { VisorSubscription } from '../../types';
import Inputbox from './Inputbox';
import Body from './Body';
import { Poke } from './commands/Poke';
import { Scry } from './commands/Scry';
import { Subscribe } from './commands/Subscribe';
import { Spider } from './commands/Spider';
import { Terminal } from './commands/Terminal';
import { DM } from './commands/DM';
import { Notifications } from './commands/Notifications';
import { MenuItem, Command } from './types';
import { Groups } from './commands/Groups';
import { History } from './commands/History';
import { Home } from './commands/Home';
import { Bitcoin } from './commands/Bitcoin';

const initialCommands: Command[] = [
  History,
  Home,
  Poke,
  Scry,
  Subscribe,
  Spider,
  Terminal,
  DM,
  Groups,
  Notifications,
  Bitcoin,
];

const Modal = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState(null);
  const [contextItems, setContextItems] = useState(null);
  const [baseFocus, setBaseFocus] = useState(null);
  const [dims, setDims] = useState(null);
  const [selectedToInput, setSelectedToInput] = useState(null);
  const [keyDown, setKeyDown] = useState(null);
  const [nextArg, setNextArg] = useState(null);
  const [previousArg, setPreviousArg] = useState(null);
  const [sendCommand, setSendCommand] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [airlockResponse, setAirlockResponse] = useState(null);
  const [clearSelected, setClearSelected] = useState(null);
  const [spaceAllowed, setSpaceAllowed] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [termSubscribed, setTermSubscribed] = useState(null);
  const [termLines, setTermLines] = useState([] as string[]);
  const [prefilledArgs, setPrefilledArgs] = useState(null);
  const [argPreview, setArgPreview] = useState(null);
  const [firstSelected, setFirstSelected] = useState(null);
  const [connectShip, setConnectShip] = useState(
    'Please connect to a ship to use the Visor Command Launcher'
  );
  const [landscapeFork, setLandscapeFork] = useState(null);

  const [commands, setCommands] = useState([
    History,
    Home,
    Poke,
    Scry,
    Subscribe,
    Spider,
    Terminal,
    DM,
    Groups,
    Notifications,
    Bitcoin,
  ] as MenuItem[]);

  useEffect(() => {
    setNextArg(null);
    setPreviousArg(null);
    setSendCommand(null);
    setBaseFocus(false);
    setFirstSelected(false);
  }, [nextArg, previousArg, sendCommand, baseFocus, firstSelected]);
  useEffect(() => {
    if (clearSelected) {
      setSelectedToInput(null);
      setSelected('');
      setBaseFocus(true);
      setContextItems(null);
      setClearSelected(null);
      setArgPreview(false);
      setFirstSelected(false);
      setCommands(initialCommands.map(({ prefilledArguments, ...attr }) => attr));
    }
  }, [clearSelected]);

  useEffect(() => {
    let subscription: any;
    let number = 0;

    if (isConnected) {
      if (!metadata) {
        subscription = shinkaiVisor.on('sse', ['metadata-update', 'associations'], (data: any) => {
          setMetadata(data);
          shinkaiVisor.off(subscription);
          shinkaiVisor.unsubscribe(number).then(res => console.log(''));
        });

        const setData = () => {
          shinkaiVisor.subscribe({ app: 'metadata-store', path: '/all' }).then(res => {
            number = res.response;
          });
        };
        shinkaiVisor.require(['subscribe'], setData);

        const landscapeFork = () => {
          shinkaiVisor.scry({ app: 'hood', path: '/kiln/vats' }).then(res => {
            if (res.response['escape']) {
              setLandscapeFork('escape');
            } else setLandscapeFork('landscape');
          });
        };
        shinkaiVisor.require(['scry'], landscapeFork);
      }
    }
  }, [isConnected]);

  useEffect(() => {
    let subId: number;
    let number = 0;
    let activeSubs: [any] = [0];

    window.addEventListener('message', handleHerm);

    if (isConnected) {
      const setData = () => {
        shinkaiVisor.subscribe({ app: 'herm', path: '/session//view' }).then((res: any) => {
          if (res.response == 'piggyback') {
            setTermSubscribed(true);
            number = res.subscriber;
          } else {
            number = res.subscriber;
            setTermSubscribed(true);
          }
        });
      };
      shinkaiVisor.require(['subscribe'], setData);
    }

    return () => {
      if (isConnected) {
        Messaging.sendToBackground({ action: 'active_subscriptions' }).then(res => {
          activeSubs = res.filter((sub: any) => sub.subscription.app == 'herm');
          if (activeSubs.length > 1) {
            window.removeEventListener('message', handleHerm);
            Messaging.sendToBackground({ action: 'remove_subscription', data: number });
          } else {
            window.removeEventListener('message', handleHerm);
            shinkaiVisor.unsubscribe(activeSubs[0].airlockID);
          }
        });
      }
    };
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      setBaseFocus(true);
    }
  }, [isConnected]);

  const handleHerm = useCallback(
    (message: any) => {
      if (
        message.data.app == 'shinkaiVisorEvent' &&
        message.data.event.data &&
        message.data.event.data.lin
      ) {
        const dojoLine = message.data.event.data.lin.join('');
        if (!(dojoLine.includes('dojo>') || dojoLine[0] === ';' || dojoLine[0] === '>')) {
          setTermLines(previousState => [...previousState, dojoLine]);
        } else return;
      }
    },
    [termLines]
  );

  const handleMessage = (e: any) => {
    if (e.data == 'focus') {
      rootRef.current.focus();
      if (selectedToInput) {
        rootRef.current.focus();
      } else setBaseFocus(true);
    } else if (e.data == 'closing') {
      setClearSelected(true);
    } else return;
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });

  useEffect(() => {
    if (argPreview) {
      setSelectedToInput(selected);
    }
  }, [selected]);

  useEffect(() => {
    const sub = shinkaiVisor.on('connected', [], () => {
      handleConnection();
    });
    handleConnection();
    return () => shinkaiVisor.off(sub);
  });

  const handleConnection = () => {
    if (isConnected) {
      return;
    } else {
      shinkaiVisor.isConnected().then((connected: any) => {
        if (connected.response) {
          setIsConnected(true);
          setConnectShip(null);
        }
      });
    }
  };

  const handleSelectCurrentItem = (selected: MenuItem) => {
    if (contextItems) {
      setSendCommand(true);
    } else {
      setSelectedToInput(selected);
      setAirlockResponse(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key == 'Escape') {
      event.preventDefault();
      window.top.postMessage('close', '*');
    }
    if (isConnected) {
      if (event.key == 'Enter' && selectedToInput !== selected && !contextItems) {
        event.preventDefault();
        handleSelectCurrentItem(selected);
      } else if (event.key == 'Enter' && selected == selectedToInput) {
        event.preventDefault();
        setSendCommand(true);
        setSpaceAllowed(false);
      } else if (event.key == 'Enter' && contextItems) {
        event.preventDefault();
        setSendCommand(true);
      } else if (event.shiftKey && event.key == 'Tab' && selected == selectedToInput) {
        setPreviousArg(true);
      } else if (event.key == 'Tab' && selected == selectedToInput) {
        event.preventDefault();
        setNextArg(true);
      } else if (event.key == 'Escape') {
        event.preventDefault();
        window.top.postMessage('close', '*');
        setClearSelected(true);
      } else if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
        if (selectedToInput?.title == 'Terminal') {
          setAirlockResponse(null);
          setSelectedToInput(null);
          setTermLines([]);
        }
        event.preventDefault();
        setAirlockResponse(null);
        setKeyDown(event);
        return;
      } else {
        return;
      }
    }
  };
  return (
    <div
      ref={rootRef}
      className="modal-container"
      id={'modalContainer'}
      onKeyDown={(event: React.KeyboardEvent) => handleKeyDown(event)}
      tabIndex={-1}
    >
      <Inputbox
        baseFocus={baseFocus}
        selectedToInput={selectedToInput}
        selected={selected}
        clearSelected={(clear: boolean) => setClearSelected(clear)}
        nextArg={nextArg}
        previousArg={previousArg}
        sendCommand={sendCommand}
        airlockResponse={(res: any) => setAirlockResponse(res)}
        contextItems={items => {
          setContextItems(items);
          setSelected(items[0]);
          setFirstSelected(true);
        }}
        metadata={metadata}
        termLines={termLines}
        commands={initialCommands}
        setCommands={command => {
          setCommands(command);
          setSelected(command[0]);
          setFirstSelected(true);
        }}
        filteredCommands={commands => {
          setCommands(commands);
          setSelected(commands[0]);
          setFirstSelected(true);
        }}
        prefilledArgs={args => setPrefilledArgs(args)}
        setArgPreview={(preview: boolean) => setArgPreview(preview)}
        argPreview={argPreview}
        placeholder={connectShip}
        landscapeFork={landscapeFork}
      />
      <Body
        commands={commands}
        handleSelection={(i: MenuItem) => setSelected(i)}
        clearSelected={(clear: boolean) => setClearSelected(clear)}
        selected={selected}
        argPreview={argPreview}
        keyDown={keyDown}
        airlockResponse={airlockResponse}
        contextItems={contextItems}
        firstSelected={firstSelected}
        handleSelectCurrentItem={handleSelectCurrentItem}
      />
    </div>
  );
};

export default Modal;
