// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { AppProps as Props } from '@polkadot/react-components/types';

import React, { useEffect, useMemo } from 'react';
import { Route, Switch } from 'react-router';

import { Tabs } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
// import { useTranslation } from './translate';

import 'antd/dist/antd.css';
import PageHome from './Pages/Home/home';
import PageAssetsDetail from './Pages/Assets/detail';
import PageRegisterIssuer from './Pages/RegisterIssuer';
import PageRegisterAssets from './Pages/registerAssets';
import PageRegisterProject from './Pages/registerProject';
import PageBurning from './Pages/burningIssue';
import PageAdditional from './Pages/additionalIssue';
import PageNeutralization from './Pages/neutralization';
import PageAssetsList from './Pages/assetsList';
import PageTransfer from './Pages/transfer';
import ECOAccountProvider, { AccountSelector, AccountUpdator } from './Components/Account';
import styled from 'styled-components';

import { typesSpec } from '@polkadot/apps-config/api';

import { setGaApi } from './service';

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

function EcoApp ({ basePath }: Props): React.ReactElement<Props> {
  // const { t } = useTranslation();
  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'overview',
      // text: t<string>('Democracy overview')
      text: '首页'
    },
    // {
    //   isRoot: false,
    //   name: 'assets-detail',
    //   // text: t<string>('Democracy overview')
    //   text: '资产详情'
    // },
    {
      isRoot: false,
      name: 'register-issuer',
      // text: t<string>('Democracy overview')
      text: '注册发行商'
    },
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
    {
      isRoot: false,
      name: 'neutralization',
      text: '碳中和'
    },
    {
      isRoot: false,
      name: 'transfer',
      text: '转账'
    },
    {
      name: 'assets-list',
      text: '我发行的碳汇资产'
    }
  ], []);

  const { api } = useApi();

  api.registerTypes(typesSpec.eco);

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
                path={`${basePath}/register-assets`}
              >
                <PageRegisterAssets />
              </Route>
              <Route
                path={`${basePath}/assets-detail`}
              >
                <PageAssetsDetail />
              </Route>
              <Route
                path={`${basePath}/register-issuer`}
              >
                <PageRegisterIssuer />
              </Route>
              <Route
                path={`${basePath}/register-project`}
              >
                <PageRegisterProject />
              </Route>
              <Route
                path={`${basePath}/additional`}
              >
                <PageAdditional />
              </Route>
              <Route
                path={`${basePath}/burning`}
              >
                <PageBurning />
              </Route>
              <Route
                path={`${basePath}/neutralization`}
              >
                <PageNeutralization />
              </Route>
              <Route
                path={`${basePath}/assets-list`}
              >
                <PageAssetsList />
              </Route>
              <Route
                path={`${basePath}/transfer`}
              >
                <PageTransfer />
              </Route>
              <Route exact>
                <PageHome />
              </Route>
            </Switch>
          </AccountUpdator>
        </main>
      </ECOAPPWrapper>
    </ECOAccountProvider>
  );
}

export default React.memo(EcoApp);
