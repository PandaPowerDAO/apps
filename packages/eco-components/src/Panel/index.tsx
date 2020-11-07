// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {} from 'react';
import { BareProps } from '@polkadot/react-components/types';
import styled from 'styled-components';
import clsx from 'clsx';

interface Props extends BareProps {
  title?: string | React.ReactElement,
}

const PanelWrapper = styled.div`
  width: 100%;
  padding: 19px 12px;
  border-radius: 4px;
  justify-content: space-between;
  background: white;
  margin-bottom: 12px;
  .cmpt-panel-title{
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .ui--Checkbox{
    display: flex;
  }
`;

export default function Panel ({ title, children, className } : Props): React.ReactElement<Props> {
  return (
    <PanelWrapper className={clsx(className, 'cmpt-panel')}>
      {
        title && <div className='cmpt-panel-title'>{title}</div>
      }
      <div>
        {children}
      </div>
    </PanelWrapper>
  );
}
