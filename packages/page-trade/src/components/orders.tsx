// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Table, Button } from '@polkadot/react-components';
import { Pagination } from 'antd';
import styled from 'styled-components';
import Panel from '@eco/eco-components/Panel';
import { useApi } from '@polkadot/react-hooks';

import { queryOrder, queryCarbonOrders } from '@eco/eco-utils/service';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { beautifulNumber, unitToEco, resolveAmountNumber, reformatAssetName } from '@eco/eco-utils/utils';

interface HanleAction {
  (orderItem: OrderItem): Promise<void> | void
}

interface Props {
  title: string | React.ReactElement,
  closed: string | number,
  reverse: string | number,
  owner?: string,
  action?: React.ReactElement,
  handleAction?: HanleAction,
  isMine: boolean,
  refreshFlag?: string | number,
  side: string,
}

interface PageType {
  total?: number,
  current?: number,
  pageSize: number,
}

interface OrderItem{
  orderId: string,
  owner: string,
  closed: number | string,
  timestamp: number | string,
  _id: string,
}

interface QueryDetailFn {
  (assetItem: OrderItem): Promise<void>
}

interface OrderDetail {
  [key: string]: string | number
}

const OrdersWrapper = styled.div`
tbody tr td {
  text-align: right!important;
}
`;

const ActionWrapper = styled.div`
  cursor: pointer;
  &:hover span{
    color:white!important;
  }
  .ui--Button{
    padding: 0.7rem 1.1rem!important;
  }
  .ui--Spinner{
    display: none;
  }
`;

const Sides = ['出售', '买入'];

const noop = (e: OrderItem) => Promise.resolve(undefined);

const resolvePrice = (price:number|string):string|null|unknown => {
  if (price !== 0 && !price) {
    return price;
  }

  return beautifulNumber(unitToEco(price, 2).toString());
};

const AddressSpan = styled.div`
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
`;

function OrderList (props: Props): React.ReactElement<Props> {
  const { closed, title, reverse, action, handleAction = noop, isMine, side = 'buy' } = props;

  const header = useMemo(() => {
    const _header = [
      ['类型', 'header'],
      isMine ? [null] : [side === 'buy' ? '买家' : '卖家', 'header'],
      ['资产名称', 'header'],
      ['价格', 'header'],
      ['数量', 'header'],
      [isMine ? '订单进度' : null, 'header'],
      ['操作', 'header']
    ].filter((v) => v[0]);

    return action ? _header : _header.slice(0, -1);
  }
  , [isMine]);

  const [pagination, updatePagination] = useState<PageType>({
    total: 0,
    current: 1,
    pageSize: 10
  });
  const [records, updateRecords] = useState<Record<string, any>[]>([]);
  const [ecoAccount] = useECOAccount();

  const { api } = useApi();
  const tempRecordsRef = useRef<Record<string, any>[]>([]);

  const queryAssetDetail = useCallback((orderItem: OrderItem): Promise<void> => {
    async function _queryDetail () {
      const result = await queryOrder(api, orderItem.orderId);

      console.log('result', result);

      tempRecordsRef.current.push({
        ...orderItem,
        ...(result as OrderDetail || {}),
        orderId: orderItem.orderId
      });
    }

    return _queryDetail();
  }, []);

  // 递归查询资产详情
  const recursionQueryDetail = useCallback((arr: OrderItem[], queryFn: QueryDetailFn) => {
    async function _run () {
      const _curItem = arr.slice(0, 1)[0];

      if (!_curItem) {
        updateRecords((_records) => {
          return [...tempRecordsRef.current];
        });

        return;
      }

      console.log('query', _curItem);

      await queryFn(_curItem);

      if (arr.length > 0) {
        recursionQueryDetail(arr.slice(1), queryFn);
      } else {
        // tempRecordsRef.current = []
        console.log('all is done');
      }
    }

    _run();
  }, []);

  const queryOrderList = useCallback((offset = 0) => {
    async function query () {
      const result = await queryCarbonOrders({
        owner: isMine ? (ecoAccount || '') : '',
        offset: (offset || 0) as number * pagination.pageSize,
        limit: pagination.pageSize,
        direction: isMine ? undefined : (side === 'buy' ? 1 : 0),
        closed,
        reverse
      });

      updatePagination((_pagination) => {
        return {
          ..._pagination,
          current: (offset as number || 0) + 1,
          // pageSize:
          total: result.count || 0
        };
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      tempRecordsRef.current = [];

      recursionQueryDetail(result.docs, queryAssetDetail);
    }

    return query();
  }, [ecoAccount]);

  const handlePageChange = useCallback((page) => {
    queryOrderList((page - 1));
  }, []);

  useEffect(() => {
    if (isMine) {
      if (ecoAccount) {
        handlePageChange(1);
      }
    } else {
      handlePageChange(1);
    }
  }, [ecoAccount]);

  useEffect(() => {
    const timer = setInterval(() => {
      updatePagination((_pagination) => {
        queryOrderList(+(_pagination.current as number) - 1);

        return _pagination;
      });
    }, 20000);

    return () => {
      if (timer) {
        clearInterval(timer);
        // timer = null;
      }
    };
  }, []);

  return (
    <OrdersWrapper>
      <Panel title={title}>
        <Table
          empty={<div style={{ textAlign: 'center' }}>暂无数据</div>}
          footer={
            <tr>
              <td colSpan={100}>
                <Pagination
                  {...pagination}
                  onChange={handlePageChange}
                />
              </td>
            </tr>
          }
          header={header}
          remainHeader
        >
          {records.map((v: Record<string, any>, rowIndex: number):React.ReactNode => {
            return <tr key={rowIndex}>
              <td>
                <span style={{
                  color: (v.direction === 1 ? 'green' : 'red')
                }}>{Sides[v.direction as number] || '-'}</span>
              </td>
              {
                !isMine && <td>
                  <AddressSpan>{v.owner}</AddressSpan>
                </td>
              }
              <td>{reformatAssetName(v.assetSymbol)}</td>
              <td>{resolvePrice(v.price) as string || '-'} ECO2/吨</td>
              <td>{isMine ? (v.amount ? resolveAmountNumber(v.amount) : '-') : (v.left_amount ? resolveAmountNumber(v.left_amount) : '-')}</td>
              {
                isMine && <td>
                  <span>
                    {resolveAmountNumber(v.amount - v.left_amount)}/{resolveAmountNumber(v.amount)}
                  </span>
                </td>
              }

              {
                action ? <td>
                  <ActionWrapper >
                    <Button
                      label={action}
                      onClick={() => handleAction(v as OrderItem)}
                    // onClick={toggleTransfer}
                    />
                  </ActionWrapper>
                </td> : null
              }
            </tr>;
          })}
        </Table>

      </Panel>
    </OrdersWrapper>
  );
}

export default OrderList;
