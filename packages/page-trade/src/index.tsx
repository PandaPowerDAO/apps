// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { AppProps as Props } from '@polkadot/react-components/types';

import React, { useEffect, useMemo } from 'react';
import { Route, Switch } from 'react-router';

import { Tabs } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
// import { useTranslation } from './translate';

import 'antd/dist/antd.css';
import CmptOrderList from './orderList';
import CmptMyOrderList from './myOrders';
import CmptMyDeals from './myDeals';

import ECOAccountProvider, { AccountSelector, AccountUpdator } from '@eco/eco-components/Account';
import styled from 'styled-components';

// import { typesSpec } from '@polkadot/apps-config/api';

import { setGaApi } from '@eco/eco-utils/service';

const ECOAPPWrapper = styled.div`
.ant-form-item-label{
  display:none!important;
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
      padding-left: 0;
      margin-left: 1.5rem;
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

function EcoTradeApp ({ basePath }: Props): React.ReactElement<Props> {
  // const { t } = useTranslation();
  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'trade',
      // text: t<string>('Democracy overview')
      text: '交易'
    },
    {
      isRoot: false,
      name: 'myorders',
      // text: t<string>('Democracy overview')
      text: '我的订单'
    },
    {
      isRoot: false,
      name: 'mydeals',
      // text: t<string>('Democracy overview')
      text: '我的成交记录'
    }
    // {
    //   isRoot: false,
    //   name: 'register-assets',
    //   // text: t<string>('Democracy overview')
    //   text: '注册碳汇资产'
    // },
    // {
    //   isRoot: false,
    //   name: 'register-project',
    //   // text: t<string>('Democracy overview')
    //   text: '注册碳汇项目'
    // },
    // {
    //   isRoot: false,
    //   name: 'additional',
    //   // text: t<string>('Democracy overview')
    //   text: '增发'
    // },
    // {
    //   isRoot: false,
    //   name: 'burning',
    //   // text: t<string>('Democracy overview')
    //   text: '销毁'
    // },
    // {
    //   isRoot: false,
    //   name: 'neutralization',
    //   text: '碳中和'
    // },
    // {
    //   isRoot: false,
    //   name: 'transfer',
    //   text: '转账'
    // },
    // {
    //   name: 'assets-list',
    //   text: '我发行的碳汇资产'
    // }
  ], []);

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
            <Tabs
              basePath={basePath}
              items={items}
            />
            <AccountSelectorWrapper>
              <span style={{ width: '8em' }}>当前帐号:</span>
              <AccountSelector/>
            </AccountSelectorWrapper>
          </header>
          <AccountUpdator>
            <Switch>
              <Route
                path={`${basePath}/myorders`}
              >
                <CmptMyOrderList/>
              </Route>
              <Route
                path={`${basePath}/mydeals`}
              >
                <CmptMyDeals/>
              </Route>
              <Route
                // path={`${basePath}/trade`}
                exact
              >
                <CmptOrderList />
              </Route>
            </Switch>
          </AccountUpdator>
        </main>
      </ECOAPPWrapper>
    </ECOAccountProvider>
  );
}

export default React.memo(EcoTradeApp);
