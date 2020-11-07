// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { BareProps } from '@polkadot/react-components/types';

import styled from 'styled-components';

// import CmptOrders from './components/orders';
import CmptDeals from './components/deals';
// import { OrderItem } from './types';

interface Props extends BareProps {
  type?:string,
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

  return (
    <OrderListWrapper>
      <CmptDeals
        closed={1}
        isMine
        reverse={0}
        title='成交记录'
      />
    </OrderListWrapper>);
}

export default OrderList;
