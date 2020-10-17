// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {} from 'react';
import { BareProps } from '@polkadot/react-components/types';
import styled from 'styled-components';
import { Icon } from '@polkadot/react-components';
import clsx from 'clsx';

const ButtonWrapper = styled.div`
  text-align: center;
  cursor: pointer;
  display: inline-block;
  border: 1px solid rgba(81 187 169, 0.5);
  background: rgb(81 187 169);
  padding: 8px 3rem;
  border-radius: 5px;
  color: white;
`;

interface ButtonInterProps extends BareProps {
  loading?: boolean,
  onClick?: (e: any) => void,
  [key: string]: any
}

function Button ({ loading, children, className, ...rest }:ButtonInterProps): React.ReactElement<ButtonInterProps> {
  return (
    <ButtonWrapper className={clsx(className, 'cmpt-button')}
      {...rest}>
      {children}
      {loading && <Icon icon='spinner'
        isSpinning={loading} />}
    </ButtonWrapper>
  );
}

export default Button;
