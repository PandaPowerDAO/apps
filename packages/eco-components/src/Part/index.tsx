// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {} from 'react';
import { BareProps } from '@polkadot/react-components/types';
import styled from 'styled-components';
import clsx from 'clsx';

interface Props extends BareProps {
  css?: string
}

const PartWrapper = styled.div`
  width: 100%;
  border-radius: 4px;
  background: white;
  margin-bottom: 12px;
`;

export default function Part ({ children, className } : Props): React.ReactElement<Props> {
  return (
    <PartWrapper className={clsx(className, 'cmpt-part')}>
      <div className='part-content'>
        {children}
      </div>
    </PartWrapper>
  );
}
