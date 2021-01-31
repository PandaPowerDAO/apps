// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useMemo } from 'react';
import { Table } from '@polkadot/react-components';
import { Pagination } from 'antd';
import Panel from '@eco/eco-components/Panel';
// import { useApi } from '@polkadot/react-hooks';

import { queryOrderDeals } from '@eco/eco-utils/service';
import { formatDate } from '@eco/eco-utils/utils';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { debounce } from 'lodash';
import { useTranslation } from '@eco/eco-utils/translate';

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

function OrderList (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation('cmpt-eco-deals');

  const header = useMemo(() => [
    [t<string>('地址'), 'header'],
    [t<string>('交易ID'), 'header'],
    [t<string>('备注'), 'header'],
    [t<string>('金额'), 'header'],
    [t<string>('时间'), 'header']

  ], []);
  const { title, reverse, isMine } = props;

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
        owner: isMine ? (ecoAccount || '') : '',
        offset: (offset || 0) as number,
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

  const handlePageChange = useCallback(debounce((page) => {
    queryOrderList((page - 1) * pagination.pageSize);
  }, 4000), []);

  // useEffect(() => {
  //   console.log('aaaaa');

  //   if (isMine) {
  //     if (ecoAccount) {
  //       handlePageChange(1);
  //     }
  //   } else {
  //     handlePageChange(1);
  //   }
  // }, [ecoAccount]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     updatePagination((_pagination) => {
  //       handlePageChange(+(_pagination.current as number));

  //       return _pagination;
  //     });
  //   }, 10000);

  //   return () => {
  //     if (timer) {
  //       clearInterval(timer);
  //       // timer = null;
  //     }
  //   };
  // }, []);

  return (
    <Panel title={title}>
      <Table
        empty={<div style={{ textAlign: 'center' }}>{t<string>('暂无数据')}</div>}
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
            <td>{v.price}</td>
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
