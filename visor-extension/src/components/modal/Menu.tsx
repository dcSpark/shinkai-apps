import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState } from 'react';
import MenuOptions from './MenuOptions';
import { MenuItem, ContextMenuItem, Command } from './types';

interface MenuOptionProps {
  handleSelection: (command: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  argPreview?: Boolean;
  clearSelected: (clear: Boolean) => void;
  firstSelected: Boolean;
  commands: Command[];
  contextItems?: ContextMenuItem[];
  handleSelectCurrentItem: (menuItem: MenuItem) => void;
}

const Menu = (props: MenuOptionProps) => {
  return (
    <div
      className={
        props.contextItems || props.argPreview
          ? 'command-launcher-menu sub-menu'
          : 'command-launcher-menu'
      }
    >
      <MenuOptions
        commands={props.commands}
        contextItems={props.contextItems}
        selected={props.selected}
        handleSelection={props.handleSelection}
        keyDown={props.keyDown}
        firstSelected={props.firstSelected}
        handleSelectCurrentItem={props.handleSelectCurrentItem}
        argPreview={props.argPreview}
        clearSelected={props.clearSelected}
      />
      {props.contextItems || props.argPreview ? (
        <button className="back-button" onClick={event => props.clearSelected(true)}>
          <span className="back-arrow"></span>BACK
        </button>
      ) : null}
    </div>
  );
};

export default Menu;
