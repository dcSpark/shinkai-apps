import { useEffect } from 'react';

export type ShorcutKey = {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  keyCode: number;
  metaKey: boolean;
  shiftKey: boolean;
};

export const isValidKeyCombination = (event: ShorcutKey) => {
  const { key, metaKey, ctrlKey, altKey, shiftKey } = event;
  const isFunctionKey = /^F\d+$/.test(key); // F1, F2, ..., F12
  const isAnyModifierPressed = metaKey || ctrlKey || altKey || shiftKey;
  return isAnyModifierPressed ? !!key : isFunctionKey;
};

export const areShortcutKeysEqual = (
  firstShortcutKey: ShorcutKey,
  secondShortcutKey: ShorcutKey,
) => {
  return (
    firstShortcutKey.key === secondShortcutKey.key &&
    firstShortcutKey.metaKey === secondShortcutKey.metaKey &&
    firstShortcutKey.ctrlKey === secondShortcutKey.ctrlKey &&
    firstShortcutKey.keyCode === secondShortcutKey.keyCode &&
    firstShortcutKey.altKey === secondShortcutKey.altKey &&
    firstShortcutKey.shiftKey === secondShortcutKey.shiftKey
  );
};
export const getShortcutKeys = (event: KeyboardEvent) => {
  return {
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    key: event.key,
    keyCode: event.keyCode,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  };
};

export const getKeyInfo = (event: ShorcutKey) => {
  const isModifierKey = ['Alt', 'Shift', 'Meta', 'Ctrl'].includes(event.key);
  const key = isModifierKey || event.key.length > 3 ? '' : event.key;

  return {
    key,
    metaKey: event.metaKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    keyCode: event.keyCode,
  };
};

export const formatShortcutKey = (event: ShorcutKey) => {
  if (!event) return '';
  const isMacOS = /Mac OS/.test(navigator.userAgent);
  const modifierSymbols = {
    alt: isMacOS ? '\u2325' : 'Alt',
    shift: isMacOS ? '\u21E7' : 'Shift',
    meta: '\u2318', // Command key in macOS
    ctrl: 'Ctrl',
  };

  const modifiers: string[] = [];

  if (isMacOS && event.altKey) modifiers.push(modifierSymbols.alt);
  if (isMacOS && event.shiftKey) modifiers.push(modifierSymbols.shift);
  if (event.metaKey && (isMacOS || !event.ctrlKey))
    modifiers.push(modifierSymbols.meta);
  if (event.ctrlKey && (!isMacOS || !event.metaKey))
    modifiers.push(modifierSymbols.ctrl);
  if (!isMacOS && event.shiftKey) modifiers.push(modifierSymbols.shift);
  if (!isMacOS && event.altKey) modifiers.push(modifierSymbols.alt);

  if (/./.test(event.key) && (!isMacOS || event.key !== 'Alt')) {
    const keyRepresentation =
      isMacOS && event.altKey
        ? String.fromCharCode(event.keyCode)
        : event.key.toUpperCase();
    modifiers.push(keyRepresentation);
  }

  return modifiers.join('+');
};

const useKeyboardShortcut = (shortcut: ShorcutKey, action: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const actualShortcut = getShortcutKeys(event);
      if (areShortcutKeysEqual(shortcut, actualShortcut)) {
        event.preventDefault();
        action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    shortcut.altKey,
    shortcut.ctrlKey,
    shortcut.key,
    shortcut.keyCode,
    shortcut.metaKey,
    shortcut.shiftKey,
    action,
    shortcut,
  ]);
};

export default useKeyboardShortcut;
