// Copyright 2017-2020 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useEffect, useState } from 'react';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import BN from 'bn.js';

import styled from 'styled-components';
import { InputAddress, InputBalance, Modal, Toggle, TxButton, Dropdown, Input } from '@polkadot/react-components';

interface Props {
  autoFocus?: boolean;
  bitLength?: BitLength;
  children?: React.ReactNode;
  className?: string;
  defaultValue?: string;
  help?: React.ReactNode;
  isDisabled?: boolean;
  isError?: boolean;
  isFull?: boolean;
  isSi?: boolean;
  isDecimal?: boolean;
  isWarning?: boolean;
  isZeroable?: boolean;
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  maxLength?: number;
  maxValue?: BN;
  onChange?: (value?: BN) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  placeholder?: string;
  value?: BN | null;
  withEllipsis?: boolean;
  withLabel?: boolean;
  withMax?: boolean;
  precision: number;

}

function NewInputNumber (props: Props): React.ReactElement<Props> {
  const [value, updateValue] = useState<number|undefined|string>(0);

  const handleChange = (v) => {
    console.log(v);
  };

  return <Input onChange={handleChange} />;
}

export default NewInputNumber;
