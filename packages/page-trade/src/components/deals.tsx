// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Table } from '@polkadot/react-components';
import { Pagination } from 'antd';
import Panel from '@eco/eco-components/Panel';
// import { useApi } from '@polkadot/react-hooks';

import { queryOrderDeals } from '@eco/eco-utils/service';
import { formatDate,
  unitToEco,
  beautifulNumber,
  resolveAmountNumber,
  reformatAssetName } from '@eco/eco-utils/utils';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { debounce } from 'lodash';
import styled from 'styled-components';

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

const DealsWrapper = styled.div`
  tbody tr td {
    text-align: right!important;
  }
`;

// const noop = (e: OrderItem) => Promise.resolve(undefined);

const resolvePrice = (price:number|string):string|null|unknown => {
  if (price !== 0 && !price) {
    return price;
  }

  return beautifulNumber(unitToEco(price, 2).toString());
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

  // const { api } = useApi();

  // const queryAssetDetail = useCallback((orderItem: OrderItem): Promise<void> => {
  //   async function _queryDetail () {
  //     const result = await queryOrder(api, orderItem.orderId);

  //     tempRecordsRef.current = [
  //       ...tempRecordsRef.current,
  //       {
  //         ...orderItem,
  //         orderDetail: result
  //       }
  //     ];
  //   }

  //   return _queryDetail();
  // }, []);

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
        owner: isMine ? (ecoAccount || '') : '',
        offset: (offset || 0) as number * pagination.pageSize,
        limit: pagination.pageSize,
        // closed,
        reverse: reverse || 1
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

      updateRecords(result.docs);

      // recursionQueryDetail(result.docs, queryAssetDetail);
    }

    return query();
  }, [ecoAccount]);

  const handlePageChange = useCallback(debounce((page) => {
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
    <DealsWrapper>
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
              <td>{reformatAssetName(v.assetSymbol)}</td>
              <td>{resolvePrice(v.price as string || 0) as string || '-'}吨/ECO2</td>
              <td>{beautifulNumber(resolveAmountNumber(v.amount || '0'))}</td>
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

      </Panel>
    </DealsWrapper>
  );
}

export default OrderList;
