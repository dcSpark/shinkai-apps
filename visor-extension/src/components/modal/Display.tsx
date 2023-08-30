import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import ReactJson from 'react-json-view';
import { MenuItem, Command, ContextMenuItem } from './types';
import { Welcome } from './commands/Welcome';
import pokeIcon from '../../icons/poke.svg';
import threadIcon from '../../icons/thread.svg';
import { getPositionOfLineAndCharacter } from 'typescript';

interface DisplayProps {
  selected: MenuItem;
  airlockResponse: any;
}
const PokeIcon = () => <img src={pokeIcon} />;
const ThreadIcon = () => <img src={threadIcon} />;

const Display = (props: DisplayProps) => {
  const scrollable = useRef(null);

  useLayoutEffect(() => {
    if (Array.isArray(props.airlockResponse)) {
      if (scrollable.current.scrollTop > -1)
        scrollable.current.scrollTop = scrollable.current.scrollHeight;
    }
  }, [props.airlockResponse]);

  // Define variable for content which will be held in the display area
  let displayContent;

  // Perform checks to know what to fill the content area with.
  // If airlock response exists
  if (props.airlockResponse) {
    // If the response is an array
    if (Array.isArray(props.airlockResponse)) {
      displayContent = (
        <AirlockSubscriptionResponse
          selected={props.selected}
          airlockResponse={props.airlockResponse}
        />
      );
    }
    // If the response is an object
    else if (typeof props.airlockResponse == 'object' && !props.airlockResponse.type) {
      displayContent = (
        <ReactJson
          style={{ padding: '16px', fontSize: '12px', fontFamily: 'Monaco' }}
          src={props.airlockResponse}
          enableClipboard={true}
          displayDataTypes={false}
          displayObjectSize={false}
          theme={{
            base00: '#1B231F',
            base01: 'aqua',
            base02: '#3D4641',
            base03: 'white',
            base04: '#A5B0AB',
            base05: 'white',
            base06: 'white',
            base07: 'white',
            base08: 'white',
            base09: '#EEAA8E',
            base0A: '#EEAA8E',
            base0B: '#EEAA8E',
            base0C: '#73A2EA',
            base0D: 'A5B0AB',
            base0E: 'yellow',
            base0F: 'yellow',
          }}
        />
      );
    } else if (
      typeof props.airlockResponse == 'object' &&
      props.airlockResponse.type == 'internal'
    ) {
      const response = props.airlockResponse.message;

      displayContent = (
        <div style={{ textAlign: 'center' }}>
          <div className="command-launcher-display-preview-container">
            {response === 'Poke Successful' || response === 'Poke Failed' ? (
              <div className="command-preview-icon">
                <PokeIcon />
              </div>
            ) : null}
            <div className="command-title">{response}</div>
          </div>
        </div>
      );
    }
    // Otherwise
    else {
      displayContent = (
        <div style={{ textAlign: 'center' }}>
          <div style={{ textAlign: 'center', paddingTop: 48 }}>{props.airlockResponse}</div>
          <button
            className="copy-button"
            onClick={event => navigator.clipboard.writeText(props.airlockResponse)}
          >
            COPY
          </button>
        </div>
      );
    }
  }
  // If no response, display empty
  else {
    displayContent = <SelectionPreview {...props} />;
  }

  // Return the html to be rendered for Display with the content inside
  return (
    <div ref={scrollable} className="command-launcher-display">
      {displayContent ? displayContent : 'hello'}
    </div>
  );
};

// Display the airlock subscription response UI
const AirlockSubscriptionResponse = (props: DisplayProps) => {
  return (
    <div className="airlock-subscription-display">
      {props.airlockResponse.map((line: any, index: number) => (
        <div
          key={index}
          className="airlock-subscription-display-line"
          onClick={event => navigator.clipboard.writeText(JSON.stringify(line))}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

const SelectionPreview = ({ selected = Welcome }: DisplayProps) => {
  const selectedItem = selected ? selected : Welcome;

  let selectionPreviewContent = selectedItem ? (
    <div className="command-launcher-display-preview-container">
      <div className="command-preview-icon">{selectedItem.icon}</div>
      <div className="command-title">{selectedItem.title}</div>
      <div className="command-description">
        <p className="command-description-text">{selectedItem.description}</p>
        <p className="tab-description">
          Press <span className="tab-symbol">TAB</span> to rotate through on each input argument
          once you have selected a command.
        </p>
        <p className="tab-description">
          Press <span className="tab-symbol">Ctrl + ,</span> hotkey to open the Visor Command
          Launcher from anywhere (<span className="tab-symbol">⌘ + ,</span> on macOS).
        </p>
      </div>
    </div>
  ) : null;
  return <div className="command-launcher-display-preview">{selectionPreviewContent}</div>;
};

export default Display;
