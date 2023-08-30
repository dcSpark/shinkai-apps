import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { MenuItem, ContextMenuItem, Command } from './types';
import { cite } from '../../utils';

interface MenuOptionProps {
  handleSelection: (menuItem: MenuItem) => void;
  keyDown: React.KeyboardEvent;
  selected: MenuItem;
  firstSelected: Boolean;
  commands: MenuItem[];
  contextItems: ContextMenuItem[];
  handleSelectCurrentItem: (menuItem: MenuItem) => void;
  argPreview?: Boolean;
  clearSelected: (clear: Boolean) => void;
}

const MenuOptions = (props: MenuOptionProps) => {
  const [clickedIndex, setClickedIndex] = useState(-1);
  const scrollable = useRef([]);

  useLayoutEffect(() => {
    if (clickedIndex > 0) scrollable.current[clickedIndex].scrollIntoView({ block: 'center' });
  }, [props.keyDown]);

  useEffect(() => {
    setClickedIndex(-1);
  }, [props.contextItems, props.commands]);

  useEffect(() => {
    if (props.firstSelected) {
      setClickedIndex(0);
      props.handleSelection(props.contextItems ? props.contextItems[0] : props.commands[0]);
    }
  }, [props.firstSelected]);

  useEffect(() => {
    if (!props.keyDown) {
      return;
    } else if (
      props.keyDown.key === 'ArrowDown' &&
      clickedIndex < (props.contextItems ? props.contextItems.length : props.commands.length) - 1
    ) {
      setClickedIndex(clickedIndex + 1);
      props.handleSelection(
        props.contextItems ? props.contextItems[clickedIndex + 1] : props.commands[clickedIndex + 1]
      );
    } else {
      return;
    }
  }, [props.keyDown]);
  useEffect(() => {
    if (!props.keyDown) {
      return;
    } else if (props.keyDown.key === 'ArrowUp' && clickedIndex > 0) {
      setClickedIndex(clickedIndex - 1);
      props.handleSelection(
        props.contextItems ? props.contextItems[clickedIndex - 1] : props.commands[clickedIndex - 1]
      );
    } else {
      return;
    }
  }, [props.keyDown]);

  const parseGroupName = (menuOption: ContextMenuItem | Command) => {
    if ('commandTitle' in menuOption && menuOption?.commandTitle === 'Groups') {
      if (menuOption.creatorId) {
        const parsedGroup = menuOption.title.split('/')[1];
        const displayText = cite(menuOption.creatorId) + '/' + parsedGroup;
        if (displayText.length > 32) {
          return displayText.substring(0, 32) + '…';
        }
        return displayText;
      } else if (menuOption.title) {
        const parsedCreator = menuOption.title.split('/')[0];
        const parsedGroup = menuOption.title.split('/')[1];
        return cite(parsedCreator) + '/' + parsedGroup;
      } else {
        return menuOption.title;
      }
    }
    return menuOption.title;
  };

  const selectClickedOption = (index: number) => {
    setClickedIndex(index);
    props.handleSelection(props.contextItems ? props.contextItems[index] : props.commands[index]);
    props.handleSelectCurrentItem(
      props.contextItems ? props.contextItems[index] : props.commands[index]
    );
  };

  return (
    <div className="command-launcher-menu-list">
      {(props.contextItems ? props.contextItems : props.commands).map((option, index) => (
        <div
          ref={el => (scrollable.current[index] = el)}
          className={
            !props.selected
              ? 'menu-option'
              : index == clickedIndex
              ? 'menu-option selected'
              : 'menu-option'
          }
          key={index}
          onClick={() => selectClickedOption(index)}
        >
          <div className="command-icon">{option.icon}</div>
          <div className="command-text">{parseGroupName(option)}</div>
        </div>
      ))}
    </div>
  );
};

export default MenuOptions;
