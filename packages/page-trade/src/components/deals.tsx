// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Table } from '@polkadot/react-components';
import { Pagination } from 'antd';
import Panel from '@eco/eco-components/Panel';
// import { useApi } from '@polkadot/react-hooks';

import { queryOrderDeals } from '@eco/eco-utils/service';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';

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

const noop = (e: OrderItem) => Promise.resolve(undefined);

function OrderList (props: Props): React.ReactElement<Props> {
  const header = useMemo(() => [
    ['资产', 'header'],
    ['数量', 'header'],
    ['价格', 'header'],
    ['方向', 'header'],
    ['操作', 'header']

  ], []);
  const { title, reverse, action, handleAction = noop, isMine } = props;

  const [pagination, updatePagination] = useState<PageType>({
    total: 0,
    current: 0,
    pageSize: 10
  });
  const [records, updateRecords] = useState<Record<string, any>[]>([]);
  const [ecoAccount] = useECOAccount();

  // const { api } = useApi();

  // const queryAssetDetail = useCallback((orderItem: OrderItem): Promise<void> => {
  //   async function _queryDetail () {
  //     const result = await queryOrder(api, orderItem.orderId);

  //     // const projectDetail = await queryProject(api, assetItem.projectId);
  //     updateRecords((_records) => {
  //       return [
  //         ..._records,
  //         {
  //           ...orderItem,
  //           orderDetail: result
  //         }
  //       ];
  //     });
  //   }

  //   return _queryDetail();
  // }, []);

  // 递归查询资产详情
  const recursionQueryDetail = useCallback((arr: OrderItem[], queryFn: QueryDetailFn) => {
    async function _run () {
      const _curItem = arr.slice(0, 1)[0];

      if (!_curItem) {
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
        offset: (offset || 0) as number,
        limit: pagination.pageSize,
        // closed,
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
      console.log(result.docs);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (result && result.docs.length > 0) {
        updateRecords([]);
      } else {
        return;
      }

      // recursionQueryDetail(result.docs, queryAssetDetail);

      console.log('queryAssets', result);
    }

    return query();
  }, [ecoAccount]);

  const handlePageChange = useCallback((page) => {
    queryOrderList((page - 1) * pagination.pageSize);
  }, []);

  useEffect(() => {
    console.log('aaaaa');

    if (isMine) {
      if (ecoAccount) {
        handlePageChange(0);
      }
    } else {
      handlePageChange(0);
    }
  }, [ecoAccount]);

  useEffect(() => {
    const timer = setInterval(() => {
      updatePagination((_pagination) => {
        handlePageChange(_pagination.current);

        return _pagination;
      });
    }, 5000);

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
            <td>{v.name}</td>
            <td>{v.amount}</td>
            <td>{v.price}</td>
            <td>{v.side}</td>
            {
              action ? <td>
                <div onClick={() => handleAction(v as OrderItem)}>
                  {action}
                </div>
              </td> : null
            }
          </tr>;
        })}
      </Table>

    </Panel>);
}

export default OrderList;
