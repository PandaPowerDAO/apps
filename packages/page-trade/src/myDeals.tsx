// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { BareProps } from '@polkadot/react-components/types';

import styled from 'styled-components';

// import CmptOrders from './components/orders';
import CmptDeals from './components/deals';
// import { OrderItem } from './types';
import { useTranslation } from '@eco/eco-utils/translate';
interface Props extends BareProps {
  type?:string,
  title?: string,
}

const OrderListWrapper = styled.div`
  // display: flex;
  // align-items: flex-start;
  // justify-content: space-bettwen;

`;

function OrderList (props: Props): React.ReactElement<Props> {
  // const handleAction = useCallback((orderItem: OrderItem): void => {
  //   console.log(orderItem);
  //   // return Promise.resolve()
  // }, []);
  const { t } = useTranslation('page-eco-trade');

  return (
    <OrderListWrapper>
      <CmptDeals
        closed={1}
        isMine
        reverse={0}
        title={props.title || t('历史成交')}
      />
    </OrderListWrapper>);
}

export default OrderList;
