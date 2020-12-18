// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { AppProps as Props } from '@polkadot/react-components/types';

import React, { useEffect, useMemo, useState } from 'react';
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
import { AccountSelectorWrapper } from '@eco/eco-components/EcoStyledComponents';
// import { typesSpec } from '@polkadot/apps-config/api';
import OrderListCmpt from './newOrderList';

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
.part-wrapper{
  background: white;
  td, th{
    border-left: none!important;
    border-right: none!important;
  }
  .tab-item {
    // margin-right: 2rem;
  }
  .active-tab {
    color: #7db8a8;
  }
  .cmpt-panel{
    padding: 0!important;
  }
}
header{
    display: flex;
    align-items: center;
    white-space: nowrap;
    background: white;
    justify-content: bettwen;
    padding: 12px 8px;
    border-bottom: 1px solid #f0f0f0;
    & > .ui--Tabs{
      flex: 1;
      padding-left: 0;
      margin-left: 1.5rem;
    }
}
header {
  padding-bottom: 0!important;
}
.tab-item {
  padding: 0.5rem 1.5rem 0.75rem;
  cursor: pointer;
  &:hover{
    border-bottom: 2px solid #e6e6e6;
  }
}
.active-tab{
  border-bottom: 2px solid #f19135;
}
.account-selector{
  max-width: 335px;
  width: 335px;
}
`;
// const AccountSelectorWrapper = styled.div`
//   display: flex;
//   align-items: center;
// `;

interface Props {
  basePath: string;
}

function EcoTradeApp ({ basePath }: Props): React.ReactElement<Props> {
  // const { t } = useTranslation();
  const TABS1 = [{
    text: '我要买',
    value: 'buy'
  }, {
    text: '我要卖',
    value: 'sell'
  }, {
    text: '历史成交',
    value: 'dealdOrders'
  }];

  const TABS2 = [{
    text: '我的挂单',
    value: 'myOrders'
  }, {
    text: '我的成交',
    value: 'myDealedOrders'
  }];
  const [tab2, updateTab2] = useState('myOrders');
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
    <ECOAPPWrapper>
      <main className='eco--App' >
        <div className='part-wrapper'>
          <OrderListCmpt />
        </div>

        <div className='part-wrapper'>
          <header>
            {
              TABS2.map((tab) => {
                return <div
                  className={`tab-item ${tab.value === tab2 ? 'active-tab' : ''}`}
                  key={tab.value}
                  onClick={() => updateTab2(tab.value)}>
                  {tab.text}
                </div>;
              })
            }
          </header>
          <div className='content'>
            {
              tab2 === 'myOrders' ? <CmptMyOrderList/> : <CmptMyDeals title={' '}/>
            }
          </div>
        </div>

      </main>
    </ECOAPPWrapper>
  );
}

export default React.memo(EcoTradeApp);
