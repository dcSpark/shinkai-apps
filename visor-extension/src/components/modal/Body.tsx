import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import Menu from './Menu';
import Display from './Display';
import { ContextMenuItem, MenuItem } from './types';

interface BodyProps {
  contextItems?: ContextMenuItem[];
  handleSelection: (command: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  argPreview?: Boolean;
  clearSelected: (clear: Boolean) => void;
  airlockResponse: any;
  firstSelected: Boolean;
  commands: MenuItem[];
  handleSelectCurrentItem: (menuItem: MenuItem) => void;
}

const Body = (props: BodyProps) => {
  return (
    <div className="command-launcher-body">
      <Menu
        commands={props.commands}
        selected={props.selected}
        argPreview={props.argPreview}
        clearSelected={props.clearSelected}
        handleSelection={props.handleSelection}
        keyDown={props.keyDown}
        contextItems={props.contextItems}
        firstSelected={props.firstSelected}
        handleSelectCurrentItem={props.handleSelectCurrentItem}
      />
      <Display selected={props.selected} airlockResponse={props.airlockResponse} />
    </div>
  );
};

export default Body;
