// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { AppProps as Props } from '@polkadot/react-components/types';

import React, { useEffect } from 'react';
// import { Route, Switch } from 'react-router';

// import { Tabs } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
// import { useTranslation } from './translate';

import 'antd/dist/antd.css';
import PageTransfer from './newTransfer';

import ECOAccountProvider, { AccountSelector, AccountUpdator } from '@eco/eco-components/Account';
import styled from 'styled-components';

import { setGaApi } from '@eco/eco-utils/service';

const ECOAPPWrapper = styled.div`
.ant-form-item-label{
  display:none;
}
.ant-form-item-has-error{
  input,textarea{
    background-color: #fff6f6!important;
    border-color: #e0b4b4!important;
  }
}
header{
    display: flex;
    align-items: center;
    white-space: nowrap;
    background: white;
    justify-content: bettwen;
    & > .ui--Tabs{
      flex: 1;
      padding-top: 0;
    }
}
.account-selector{
  max-width: 335px;
  width: 335px;
}
`;
const AccountSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  basePath: string;
}

function EcoTransfer ({ basePath }: Props): React.ReactElement<Props> {
  // const { t } = useTranslation();
  const { api } = useApi();

  // api.registerTypes(typesSpec.eco);

  useEffect(() => {
    setGaApi(api);
  }, [api]);

  return (
    <ECOAccountProvider>
      <ECOAPPWrapper>
        <main className='eco--App' >
          <header>
            <AccountSelectorWrapper>
              <span style={{ width: '8em' }}>当前帐号:</span>
              <AccountSelector/>
            </AccountSelectorWrapper>
          </header>
          <AccountUpdator>
            <PageTransfer />
          </AccountUpdator>
        </main>
      </ECOAPPWrapper>
    </ECOAccountProvider>
  );
}

export default React.memo(EcoTransfer);
