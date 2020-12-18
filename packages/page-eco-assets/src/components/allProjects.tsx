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

import { queryAsset, queryAssetsList, queryProject, queryProjectsList } from '@eco/eco-utils/service';
import { formatDate, beautifulNumber, resolveAmountNumber } from '@eco/eco-utils/utils';

const TableWrapper = styled.div`
.ui--Table{
  overflow-y: auto;
}
  tr td {
    text-align: right;
    &:first-child{
      border-left: none!important;
    }
  }
`;

interface Props {
  className?: string,
  isMine: boolean,
  title: string | React.ReactElement,
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

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  a{
    font-size: 13px;
  }
`;

function Home ({ className, title, isMine }: Props): React.ReactElement<Props> {
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
    ['项目代码', 'header'],
    ['项目类型', 'header'],
    ['项目年限', 'header'],
    ['项目标准', 'header'],
    // ['资产精度', 'header'],
    // ['发行商', 'header'],
    ['项目上链时间', 'header'],
    ['状态', 'header']
    // ['操作', 'header']

  ], []);

  console.log('ecoAccount', ecoAccount);

  const queryAssetDetail = useCallback((assetItem: AssetItemType): Promise<void> => {
    async function _queryDetail () {
      // const result = await queryAsset(api, assetItem.assetId);
      const projectDetail = await queryProject(api, assetItem.projectId);

      console.log('projectDetail', projectDetail);
      updateRecords((_records) => {
        return [
          ..._records,
          {
            ...assetItem,
            // assetDetail: result,
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
      const result = await queryProjectsList(
        isMine ? ecoAccount : '',
        undefined,
        pagination.pageSize,
        (offset || 0) as number
      );
      // owner: isMine ? ecoAccount : '',
      //   offset: (offset || 0) as number,
      //   limit: pagination.pageSize

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
  }, [ecoAccount]);

  useEffect(() => {
    if (isMine && ecoAccount) {
      queryAssets();
    } else if (!isMine) {
      queryAssets();
    }
  }, [queryAssets, ecoAccount]);

  const handlePageChange = useCallback((page) => {
    console.log(page);
    queryAssets((page - 1) * pagination.pageSize);
  }, []);

  const StatusMap = ['审批中', '流通中'];

  return (
    <div className={className}>
      <Panel title={
        <TitleRow>
          <div>{title}</div>
          <IconLink href='#/ecassets/register-project'
            icon='plus'
            label='新增碳汇项目'></IconLink>
        </TitleRow>
      }>
        <TableWrapper>
          <Table
            css={
              `
            & th {
              border: none!important;
            }
            `
            }
            empty={'暂无数据'}
            footer={null}
            header={header}
            remainHeader
          >
            {records.map((v: Record<string, any>, rowIndex: number):React.ReactNode => {
              return <tr key={rowIndex}>
                <td><IconLink href={`#/ecassets/assets-detail?asset=${v.assetId as string}&symbol=${`${v.symbol as string}(${v.vintage as string})`}`}
                  label={`${v.symbol as string}`}></IconLink></td>
                <td>{v.projectDetail?.additionals?.projectType}</td>
                <td>{v.projectDetail?.additionals?.lifetime}</td>
                <td>{v.projectDetail?.additionals?.standard}</td>
                {/* <td>{resolveAmountNumber((v as DataItem).assetDetail.asset.total_supply)}</td> */}
                {/* <td>{beautifulNumber((v as DataItem).assetDetail.asset.total_supply)}</td> */}
                {/* <td>{v.precision || '-'}</td> */}
                {/* <OwnerTd>{v.owner}</OwnerTd> */}
                <td>{v.projectDetail?.additionals?.registerDate}</td>
                <td>{StatusMap[v.projectDetail?.asset?.status === 1 ? '1' : '0'] || StatusMap[0]}</td>
                <td>
                  {/* {
                  v.approved === 1 ? <div>
                    <OperationSpan onClick={() => goAdditionalPage(v.assetId)}>增发</OperationSpan>
                    <Divider type='vertical' />
                    <OperationSpan onClick={() => goBurningPage(v.assetId)}>销毁</OperationSpan>
                  </div> : '-'
                } */}
                </td>
              </tr>;
            })}
          </Table>
        </TableWrapper>

      </Panel>
      <table style={{ width: '100%', textAlign: 'right' }}>
        <tr>
          <td colSpan={100}>
            <Pagination
              {...pagination}
              onChange={handlePageChange}
            />
          </td>
        </tr>
      </table>
    </div>
  );
}

export default Home;
