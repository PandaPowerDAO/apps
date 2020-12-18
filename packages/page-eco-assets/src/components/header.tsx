// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import Panel from '@eco/eco-components/Panel';

import { Icon } from '@polkadot/react-components';

interface Props {
  title: string | React.ReactElement,
}

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Header = ({ title }: Props): React.ReactElement<Props> => {
  return (
    <Panel>
      <DetailHeader>
        <div>{title}</div>
        <div>
          <Icon icon='reply'
            onClick={() => window.history.go(-1)}></Icon>
        </div>
      </DetailHeader>
    </Panel>
  );
};

export default Header;
