// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import { BareProps } from '@polkadot/react-components/types';
import CmptOrders from './components/orders';
import { OrderItem } from './types';
import { cancelOrder } from '@eco/eco-utils/service';
import { useApi } from '@polkadot/react-hooks';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { message } from 'antd';

interface Props extends BareProps {
  type?:string,
}

function MyOrderList (props: Props): React.ReactElement<Props> {
  const [ecoAccount] = useECOAccount();
  const { api } = useApi();
  const handleAction = useCallback((orderItem: OrderItem): void => {
    async function _cancel () {
      try {
        await cancelOrder(api, ecoAccount as string, orderItem.orderId);
        message.info('取消成功');
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message.info(e.msg || e.message || '取消失败');
      }
    }

    _cancel();
    // return Promise.resolve()
  }, []);

  return (
    <div>
      <CmptOrders
        action={<span>撤单</span>}
        closed={0}
        handleAction={handleAction}
        isMine
        reverse={0}
        title='所有订单'
      />
      <div>
        <CmptOrders
          // action={<span>历史挂单</span>}
          closed={1}
          // handleAction={handleAction}
          isMine
          reverse={0}
          title='历史挂单'
        />
      </div>
    </div>);
}

export default MyOrderList;
