import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../messaging';
import Agrihan from '@urbit/http-api';
import { Command } from './types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  schemaArgs?: any[];
  refs?: (refs: any) => void;
  response?: Boolean;
  inputChange?: (change: any) => void;
  setArgPreview?: (preview: Boolean) => void;
  persistInput?: Boolean;
  argPreview?: Boolean;
}

const Input = (props: InputProps) => {
  const inputRef = useRef([]);
  const [currentFocus, setCurrentFocus] = useState(null);

  const selection = (window as any).getSelection();

  useEffect(() => {
    if (props.selectedToInput.prefilledArguments) {
      inputRef.current.forEach((input, i) => {
        input.innerText = props.selectedToInput.prefilledArguments[i];
      });
      const lastArg = inputRef.current[inputRef.current.length - 1];
      setCurrentFocus(inputRef.current.length - 1);
      const range = document.createRange();
      range.selectNodeContents(lastArg);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      lastArg.focus();
      range.detach();
    }
  }, [props.selectedToInput]);

  useEffect(() => {
    if (!props.selectedToInput.prefilledArguments) {
      inputRef.current[0].focus();
      setCurrentFocus(0);
      props.refs ? props.refs(inputRef) : null;
    } else {
      props.refs ? props.refs(inputRef) : null;
    }
  }, [inputRef]);
  useEffect(() => {
    if (!props.nextArg) {
      return;
    } else if (currentFocus == inputRef.current.length - 1) {
      inputRef.current[0].focus();
      setCurrentFocus(0);
    } else if (inputRef.current[currentFocus + 1]) {
      inputRef.current[currentFocus + 1].focus();
      setCurrentFocus(currentFocus + 1);
    }
  }, [props.nextArg]);
  useEffect(() => {
    if (!props.previousArg) {
      return;
    } else if (inputRef.current[currentFocus - 1]) {
      inputRef.current[currentFocus - 1].focus();
      setCurrentFocus(currentFocus - 1);
    }
  }, [props.previousArg]);

  useEffect(() => {
    if (!props.sendCommand) return;
    else if (inputRef.current.every(el => (el?.innerHTML ? true : false))) {
      if (props.refs) {
        props.refs(inputRef.current.map(ref => ref.innerText));
      }
      let args: any[];
      if (!props.schemaArgs) {
        args = inputRef.current;
      } else {
        args = props.schemaArgs.map(arg => (arg == 'default' ? inputRef.current : arg));
      }
      const f = async () => {
        for (const [i, message] of props.selectedToInput.schema.entries()) {
          const data = { action: props.selectedToInput.command, argument: message(args) };
          const res = await Messaging.sendToBackground({ action: 'call_airlock', data: data });
          props.response == true || props.response == undefined ? handleAirlockResponse(res) : null;
        }
      };
      if (props.selectedToInput.title !== 'Subscribe') {
        f();
      }
      if (props.selectedToInput.title !== 'Groups') {
        Messaging.sendToBackground({
          action: 'store_command_history',
          data: {
            command: props.selectedToInput.title,
            arguments: inputRef.current.map(arg => arg.innerText),
          },
        });
      }

      props.persistInput
        ? (inputRef.current.forEach(input => {
            input.innerHTML = '';
          }),
          inputRef.current[0].focus(),
          setCurrentFocus(0))
        : (inputRef.current.forEach(input => {
            input.innerHTML = '';
          }),
          props.clearSelected(true));
    } else {
      inputRef.current.forEach(input => {
        if (input?.innerHTML == '') input.classList.add('highlight-required');
      });
    }
  }, [props.sendCommand]);

  const handleAirlockResponse = (res: any) => {
    if (props.selectedToInput.command == 'poke') {
      res.status !== 'error'
        ? props.airlockResponse({ type: 'internal', message: 'Poke Successful' })
        : props.airlockResponse({ type: 'internal', message: 'Poke Failed' });
    } else props.airlockResponse(res);
  };

  return (
    <div className="cl-input">
      {/* <div>{props.selected?.title}</div> */}
      <div className="inputs-wrapper">
        {props.selectedToInput.arguments.map((arg: string, i: number) => (
          <div
            key={i}
            className="arg-input"
            contentEditable="true"
            data-placeholder={arg}
            onKeyUp={(event: React.KeyboardEvent) => {
              if (props.inputChange) {
                if (
                  ((event.target as Element).innerHTML !== '' && event.key.length == 1) ||
                  event.key == 'Backspace'
                )
                  props.inputChange(event);
              }
            }}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (
                event.key == 'Backspace' &&
                (event.target as Element).innerHTML == '' &&
                currentFocus == 0
              ) {
                props.clearSelected(true);
              } else if (event.key == 'Backspace' && (event.target as Element).innerHTML == '') {
                event.preventDefault();
                inputRef.current[currentFocus - 1].focus();
                const range = document.createRange();
                range.selectNodeContents(inputRef.current[currentFocus - 1]);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                range.detach();
                setCurrentFocus(currentFocus - 1);
              } else if ((event.target as Element).classList.contains('highlight-required')) {
                (event.target as Element).classList.remove('highlight-required');
              } else if (event.key == 'Backspace' && event.shiftKey) {
                event.preventDefault();
                (event.target as Element).innerHTML = '';
              } else {
                return;
              }
            }}
            ref={el => (inputRef.current[i] = el)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Input;
