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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

function OrderList (props: Props): React.ReactElement<Props> {
  const [isShowCreateModal, updateCreateShowModal] = useState<boolean>(false);
  const [currentOrder, updateCurrentOrder] = useState<OrderItem | null>(null);

  const handleAction = useCallback((orderItem: OrderItem): void => {
    console.log(orderItem,'====');
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
      <OrderListWrapper>
        <div style={{
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
        </div>
        <div style={{
          width: '45%',
          minWidth: '45%'
        }}>
          <CmptDeals
            closed={1}
            isMine={false}
            reverse={0}
            title='成交记录'
          />
        </div>
      </OrderListWrapper>
      <CreateModal
        onClose={closeCreateModal}
        open={isShowCreateModal}>
        <span>sfs</span>
      </CreateModal>
      <TakeModal
        onClose={closeTakeModal}
        open={!!currentOrder}
        orderDetail={currentOrder as unknown as OrderDetailType}
      >
        <span>sd</span>
      </TakeModal>
    </div>
  );
}

export default OrderList;
