// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Table } from '@polkadot/react-components';
import { Pagination } from 'antd';
import Panel from '@eco/eco-components/Panel';
import { useApi } from '@polkadot/react-hooks';

import { queryOrderDeals, queryOrder } from '@eco/eco-utils/service';
import { formatDate, unitToEco, beautifulNumber } from '@eco/eco-utils/utils';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { debounce } from 'lodash';

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

// const noop = (e: OrderItem) => Promise.resolve(undefined);

const resolvePrice = (price:number|string):string|null|unknown => {
  if (price !== 0 && !price) {
    return price;
  }

  return beautifulNumber(unitToEco(price).toString());
};

function OrderList (props: Props): React.ReactElement<Props> {
  const header = useMemo(() => [
    ['时间', 'header'],
    ['资产', 'header'],
    ['价格', 'header'],
    ['数量', 'header']

  ], []);
  const { title, reverse, isMine } = props;

  const [pagination, updatePagination] = useState<PageType>({
    total: 0,
    current: 1,
    pageSize: 10
  });
  const [records, updateRecords] = useState<Record<string, any>[]>([]);
  const tempRecordsRef = useRef<Record<string, any>[]>([]);
  const [ecoAccount] = useECOAccount();

  const { api } = useApi();

  const queryAssetDetail = useCallback((orderItem: OrderItem): Promise<void> => {
    async function _queryDetail () {
      const result = await queryOrder(api, orderItem.orderId);

      console.log('sssss', result);

      tempRecordsRef.current = [
        ...tempRecordsRef.current,
        {
          ...orderItem,
          orderDetail: result
        }
      ];
      // const projectDetail = await queryProject(api, assetItem.projectId);
      // updateRecords((_records) => {
      //   return [
      //     ..._records,
      //     {
      //       ...orderItem,
      //       orderDetail: result
      //     }
      //   ];
      // });
    }

    return _queryDetail();
  }, []);

  // 递归查询资产详情
  const recursionQueryDetail = useCallback((arr: OrderItem[], queryFn: QueryDetailFn) => {
    async function _run () {
      const _curItem = arr.slice(0, 1)[0];

      if (!_curItem) {
        updateRecords(() => {
          return tempRecordsRef.current.slice(0);
        });

        return;
      }

      await queryFn(_curItem);

      if (arr.length > 0) {
        recursionQueryDetail(arr.slice(1), queryFn);
      } else {
        console.log('all is done');
      }
    }

    _run();
  }, []);

  const queryOrderList = useCallback((offset = 0) => {
    async function query () {
      // console.log('ecoAccount -----', ecoAccount);
      const result = await queryOrderDeals({
        owner: isMine ? (ecoAccount as string || '') : '',
        offset: (offset || 0) as number * pagination.pageSize,
        limit: pagination.pageSize,
        // closed,
        reverse: reverse || 0
      });

      updatePagination((_pagination) => {
        return {
          ..._pagination,
          current: (offset as number || 0) + 1,
          // pageSize:
          total: result.count || 0
        };
      });
      console.log('queryOrderList');
      tempRecordsRef.current = [];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result && result.docs.length > 0) {
        // updateRecords([]);

        // return;
      }

      recursionQueryDetail(result.docs, queryAssetDetail);
    }

    return query();
  }, [ecoAccount]);

  const handlePageChange = useCallback(debounce((page) => {
    console.log('query page', page);
    queryOrderList((page - 1));
  }, 300), []);

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
        console.log('_pagination.current ', _pagination.current);
        queryOrderList(+(_pagination.current as number) - 1);

        return _pagination;
      });
    }, 10000);

    return () => {
      if (timer) {
        clearInterval(timer);
        // timer = null;
      }
    };
  }, []);

  return (
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

            <td>{formatDate(v.timestamp as number)}</td>
            <td>{v.assetSymbol}</td>
            <td>{resolvePrice(v.price as string || 0) as string || '-'}</td>
            <td>{v.amount}</td>
            {/* {
              action ? <td>
                <div onClick={() => handleAction(v as OrderItem)}>
                  {action}
                </div>
              </td> : null
            } */}
          </tr>;
        })}
      </Table>

    </Panel>);
}

export default OrderList;
