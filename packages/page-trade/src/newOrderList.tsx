// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { BareProps } from '@polkadot/react-components/types';

import styled from 'styled-components';

import CmptOrders from './components/orders';
import CmptDeals from './components/deals';
import CreateModal from './components/createModal';
import TakeModal from './components/takeOrderModal';
import { OrderItem, OrderDetailType } from './types';

interface Props extends BareProps {
  type?:string,
}

const OrderListWrapper = styled.div`
  // display: flex;
  // align-items: flex-start;
  // justify-content: space-between;
  .cmpt-panel{
    padding: 0;
  }

`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

function OrderList (props: Props): React.ReactElement<Props> {
  const TABS1 = [
  //   {
  //   text: '我要买',
  //   value: 'buy'
  // }, {
  //   text: '我要卖',
  //   value: 'sell'
  // },
    {
      text: '订单列表',
      value: 'orders'
    },
    {
      text: '历史成交',
      value: 'dealdOrders'
    }];

  const [tab1, updateTab1] = useState('orders');
  const [isShowCreateModal, updateCreateShowModal] = useState<boolean>(false);
  const [currentOrder, updateCurrentOrder] = useState<OrderItem | null>(null);

  const handleAction = useCallback((orderItem: OrderItem): void => {
    console.log(orderItem, '====');
    updateCurrentOrder(orderItem);
    // return Promise.resolve()
  }, []);

  const showCreateModal = useCallback(() => {
    updateCreateShowModal(true);
  }, []);
  const closeCreateModal = useCallback(() => {
    updateCreateShowModal(false);
  }, []);

  // const showTakeModal = useCallback((order) => {
  //   updateCurrentOrder(true);
  // }, []);
  const closeTakeModal = useCallback(() => updateCurrentOrder(null), []);

  return (
    <div>
      <header style={{
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex'
        }}>
          {
            TABS1.map((tab) => {
              return <div
                className={`tab-item ${tab.value === tab1 ? 'active-tab' : ''}`}
                key={tab.value}
                onClick={() => updateTab1(tab.value)}>
                {tab.text}
              </div>;
            })
          }
        </div>
        <div onClick={showCreateModal}
          style={{
            color: '#7db8a8',
            cursor: 'pointer'
          }}>
          我要挂单
        </div>
      </header>
      <OrderListWrapper>

        {
          tab1 === 'dealdOrders' ? <CmptDeals
            closed={1}
            isMine={false}
            reverse={0}
            title=''
          /> : <CmptOrders
            action={<span style={{
              color: '#7db8a8'
            }}>交易</span>}
            closed={0}
            handleAction={handleAction}
            isMine={false}
            reverse={0}
            title=''
            // title={
            //   <Header>
            //     <span>所有订单</span>
            //     <span onClick={showCreateModal}>发布订单</span>
            //   </Header>
            // }
          />
        }
        {/* <div style={{
          width: '50%'
        }}>
          <CmptOrders
            action={<span>交易</span>}
            closed={0}
            handleAction={handleAction}
            isMine={false}
            reverse={0}
            title={
              <Header>
                <span>所有订单</span>
                <span onClick={showCreateModal}>发布订单</span>
              </Header>
            }
          />
        </div> */}
        {/* <div style={{
          width: '45%',
          minWidth: '45%'
        }}>
          <CmptDeals
            closed={1}
            isMine={false}
            reverse={0}
            title='成交记录'
          />
        </div> */}
      </OrderListWrapper>
      <CreateModal
        onClose={closeCreateModal}
        open={isShowCreateModal}>
        <span>-</span>
      </CreateModal>
      <TakeModal
        onClose={closeTakeModal}
        open={!!currentOrder}
        orderDetail={currentOrder as unknown as OrderDetailType}
      >
        <span>-</span>
      </TakeModal>
    </div>
  );
}

export default OrderList;
