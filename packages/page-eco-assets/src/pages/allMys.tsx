// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Table, IconLink } from '@polkadot/react-components';
import { Pagination } from 'antd';
import { useApi } from '@polkadot/react-hooks';

import Panel from '@eco/eco-components/Panel';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';

import { queryAsset, queryAssetsList, queryProject } from '@eco/eco-utils/service';
import { formatDate, beautifulNumber, resolveAmountNumber } from '@eco/eco-utils/utils';
import BannerImgSource from './banner.png';

import AllProject from '../components/allProjects';
import AllAssets from '../components/allAssets';

// const OwnerTd = styled.td`
//     overflow: hidden;
//     max-width: 200px;
//     text-overflow: ellipsis;
// `;

// const OperationBtnWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   & > div + div {
//     margin-left: 4px;
//   }

// `;

// const OperationBtn = styled.div`
//   padding: 8px 14px;
//   background: #7db8a8;
//   border-radius: 2px;
//   a {
//     color: white!important;
//   }
// `;

const TableWrapper = styled.div`
.ui--Table{
  overflow-y: auto;
}
  tr td {
    text-align: right;
  }
`;

// const OperationSpan = styled.span`
//   cursor: pointer;
// `;

// const TitleWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// `;

interface Props {
  className?: string,
}

interface AnyObj {
  [key: string]: any
}

interface DataItem {
  assetDetail: {
    asset: AnyObj,
    additionals: AnyObj,
  }
  [key: string]: any
}

interface PageType {
  total?: number,
  current?: number,
  pageSize: number,
}

interface AssetItemType {
  assetId: string,
  projectId: string,
  [key: string]: any,
}

interface QueryDetailFn {
  (assetItem: AssetItemType): Promise<void>
}

const Banner = styled.div`
  background: white;
  margin-bottom: 12px;
  padding: 0.75rem 1.5rem;
`;

// const BannerImg = styled.div`
//   width: 100%;
//   background-size: cover;
//   background-position: 50% 50%;
//   height: 320px;
//   background-repeat: no-repeat;
// `;

function Home ({ className }: Props): React.ReactElement<Props> {
  const [ecoAccount] = useECOAccount();
  // const [accountLoaded, updateAccountLoaded] = useState<boolean>(false);
  const [pagination, updatePagination] = useState<PageType>({
    total: 0,
    current: 0,
    pageSize: 10
  });
  const [records, updateRecords] = useState<Record<string, any>[]>([]);

  const { api } = useApi();
  const header = useMemo(() => [
    ['资产名称', 'header'],
    ['资产类型', 'header'],
    ['签发年限', 'header'],
    ['资产上限', 'header'],
    ['已发行总量', 'header'],
    // ['资产精度', 'header'],
    // ['发行商', 'header'],
    ['注册时间', 'header'],
    ['状态', 'header']
    // ['操作', 'header']

  ], []);

  console.log('ecoAccount', ecoAccount);

  const queryAssetDetail = useCallback((assetItem: AssetItemType): Promise<void> => {
    async function _queryDetail () {
      const result = await queryAsset(api, assetItem.assetId);
      const projectDetail = await queryProject(api, assetItem.projectId);

      updateRecords((_records) => {
        return [
          ..._records,
          {
            ...assetItem,
            assetDetail: result,
            projectDetail: projectDetail
          }
        ];
      });
    }

    return _queryDetail();
  }, []);

  // 递归查询资产详情
  const recursionQueryDetail = useCallback((arr: AssetItemType[], queryFn: QueryDetailFn) => {
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

  const queryAssets = useCallback((offset = 0) => {
    async function query () {
      const result = await queryAssetsList({
        // owner: (ecoAccount || '') as string,
        offset: (offset || 0) as number,
        limit: pagination.pageSize
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
      if (result && result.docs.length > 0) {
        updateRecords([]);
      } else {
        return;
      }

      recursionQueryDetail(result.docs, queryAssetDetail);
    }

    return query();
  }, []);

  // useEffect(() => {
  //   queryAssets();
  // }, []);

  const handlePageChange = useCallback((page) => {
    console.log(page);
    queryAssets((page - 1) * pagination.pageSize);
  }, []);

  const StatusMap = {
    1: '进行中',
    0: '待审批'
  };

  return (
    <div className={className}>
      <AllProject isMine={true}
        title='我上链的碳汇项目列表' />

      <AllAssets isMine={true}
        title='我上链的碳汇资产列表' />
    </div>
  );
}

export default Home;
