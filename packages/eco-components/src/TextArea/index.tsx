// Copyright 2017-2020 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import { VoidFn } from '@polkadot/react-components/types';

import React, { useCallback, useState } from 'react';
import SUIInput from 'semantic-ui-react/dist/commonjs/elements/Input/Input';
import { isFunction, isUndefined } from '@polkadot/util';

// import Labelled from './Labelled';
import { Labelled } from '@polkadot/react-components';

type Input$Type = 'number' | 'password' | 'text';

interface Props {
  autoFocus?: boolean;
  children?: React.ReactNode;
  className?: string;
  defaultValue?: string | null;
  help?: React.ReactNode;
  icon?: React.ReactNode;
  inputClassName?: string;
  isAction?: boolean;
  isDisabled?: boolean;
  isDisabledError?: boolean;
  isEditable?: boolean;
  isError?: boolean;
  isFull?: boolean;
  isHidden?: boolean;
  isInPlaceEditor?: boolean;
  isReadOnly?: boolean;
  isSmall?: boolean;
  isWarning?: boolean;
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  max?: number;
  maxLength?: number;
  min?: number;
  name?: string;
  onEnter?: boolean | VoidFn;
  onEscape?: () => void;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<Element>) => void;
  onKeyUp?: (event: React.KeyboardEvent<Element>) => void;
  onKeyPress?: (event: React.KeyboardEvent<Element>) => void;
  onPaste?: (event: React.ClipboardEvent<Element>) => void;
  placeholder?: string;
  tabIndex?: number;
  type?: Input$Type;
  value?: string | null;
  withLabel?: boolean;
  withEllipsis?: boolean;
  rows?: number;
}

const TextArea = styled.textarea`
margin: 0;
max-width: 100%;
-webkit-box-flex: 1;
-ms-flex: 1 0 auto;
flex: 1 0 auto;
outline: 0;
-webkit-tap-highlight-color: rgba(255,255,255,0);
text-align: left;
line-height: 1.21428571em;
font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
padding: .67857143em 1em;
background: #fff;
border: 1px solid rgba(34,36,38,.15);
color: rgba(0,0,0,.87);
border-radius: .28571429rem;
-webkit-transition: border-color .1s ease,-webkit-box-shadow .1s ease;
transition: border-color .1s ease,-webkit-box-shadow .1s ease;
transition: box-shadow .1s ease,border-color .1s ease;
transition: box-shadow .1s ease,border-color .1s ease,-webkit-box-shadow .1s ease;
-webkit-box-shadow: none;
box-shadow: none;
padding-left: 1.45rem;
padding-top: 1.75rem;
`;

// // Find decimal separator used in current locale
// const getDecimalSeparator = (): string => 1.1
//   .toLocaleString()
//   .replace(/\d/g, '');

// note: KeyboardEvent.keyCode and KeyboardEvent.which are deprecated
const KEYS = {
  A: 'a',
  ALT: 'Alt',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  BACKSPACE: 'Backspace',
  C: 'c',
  CMD: 'Meta',
  CTRL: 'Control',
  // DECIMAL: getDecimalSeparator(),
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  V: 'v',
  X: 'x',
  ZERO: '0'
};

const KEYS_PRE: any[] = [KEYS.ALT, KEYS.CMD, KEYS.CTRL];

// reference: degrade key to keyCode for cross-browser compatibility https://www.w3schools.com/jsref/event_key_keycode.asp
const isCopy = (key: string, isPreKeyDown: boolean): boolean =>
  isPreKeyDown && key === KEYS.C;

const isCut = (key: string, isPreKeyDown: boolean): boolean =>
  isPreKeyDown && key === KEYS.X;

const isPaste = (key: string, isPreKeyDown: boolean): boolean =>
  isPreKeyDown && key === KEYS.V;

const isSelectAll = (key: string, isPreKeyDown: boolean): boolean =>
  isPreKeyDown && key === KEYS.A;

let counter = 0;

function Input ({ rows = 1, autoFocus = false, children, className, defaultValue, help, icon, inputClassName, isAction = false, isDisabled = false, isDisabledError = false, isEditable = false, isError = false, isFull = false, isHidden = false, isInPlaceEditor = false, isReadOnly = false, isWarning = false, label, labelExtra, max, maxLength, min, name, onBlur, onChange, onEnter, onEscape, onKeyDown, onKeyUp, onPaste, placeholder, tabIndex, type = 'text', value, withEllipsis, withLabel }: Props): React.ReactElement<Props> {
  const [stateName] = useState(`in_${counter++}_at_${Date.now()}`);

  const _onBlur = useCallback(
    () => onBlur && onBlur(),
    [onBlur]
  );

  const _onChange = useCallback(
    ({ target }: React.SyntheticEvent<HTMLTextAreaElement>): void =>
      onChange && onChange((target as HTMLTextAreaElement).value),
    [onChange]
  );

  const _onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void =>
      onKeyDown && onKeyDown(event),
    [onKeyDown]
  );

  const _onKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      onKeyUp && onKeyUp(event);

      if (onEnter && event.keyCode === 13) {
        (event.target as HTMLTextAreaElement).blur();
        isFunction(onEnter) && onEnter();
      }

      if (onEscape && event.keyCode === 27) {
        (event.target as HTMLTextAreaElement).blur();
        onEscape();
      }
    },
    [onEnter, onEscape, onKeyUp]
  );

  const _onPaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>): void =>
      onPaste && onPaste(event),
    [onPaste]
  );

  return (
    <Labelled
      className={className}
      help={help}
      isFull={isFull}
      label={label}
      labelExtra={labelExtra}
      withEllipsis={withEllipsis}
      withLabel={withLabel}
    >
      <SUIInput
        action={isAction}
        autoFocus={autoFocus}
        className={[
          isEditable
            ? 'ui--Input edit icon'
            : 'ui--Input',
          isInPlaceEditor
            ? 'inPlaceEditor'
            : '',
          inputClassName || '',
          isWarning && !isError
            ? 'isWarning'
            : ''
        ].join(' ')}
        defaultValue={
          isUndefined(value)
            ? (defaultValue || '')
            : undefined
        }
        disabled={isDisabled}
        error={(!isDisabled && isError) || isDisabledError}
        hidden={isHidden}
        iconPosition={
          isUndefined(icon)
            ? undefined
            : 'left'
        }
        id={name}
        max={max}
        maxLength={maxLength}
        min={min}
        name={name || stateName}
        onBlur={_onBlur}
        // onChange={_onChange}
        onKeyDown={_onKeyDown}
        onKeyUp={_onKeyUp}
        placeholder={placeholder}
        readOnly={isReadOnly}
        tabIndex={tabIndex}
        type={type}
        value={value}
      >
        <TextArea
          autoCapitalize='off'
          autoComplete={
            type === 'password'
              ? 'new-password'
              : 'off'
          }
          autoCorrect='off'
          data-testid={label}
          onChange={_onChange}
          onPaste={_onPaste}
          rows={rows}
          spellCheck={false}
        />
        {isEditable && (
          <i className='edit icon' />
        )}
        {icon}
        {children}
      </SUIInput>
    </Labelled>
  );
}

export default React.memo(Input);

export {
  isCopy,
  isCut,
  isPaste,
  isSelectAll,
  KEYS,
  KEYS_PRE
};
