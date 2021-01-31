// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Table, IconLink } from '@polkadot/react-components';
import { Pagination, Divider } from 'antd';
import { useApi } from '@polkadot/react-hooks';

import Panel from '@eco/eco-components/Panel';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';

import { queryAsset, queryAssetsList, queryProject } from '@eco/eco-utils/service';
import { formatDate, beautifulNumber, resolveAmountNumber } from '@eco/eco-utils/utils';

import { useTranslation } from '@eco/eco-utils/translate';
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

const OperationSpan = styled.span`
  cursor: pointer;
  text-decoration: underline;
  color: #f19134;
`;

const OperationSpanWrapper = styled.span`
  display: flex;
  align-items: center;
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
  const { t } = useTranslation('page-eco-assets');

  const { api } = useApi();
  const header = useMemo(() => {
    return [
      [t<string>('资产名称'), 'header'],
      [t<string>('资产类型'), 'header'],
      [t<string>('签发年限'), 'header'],
      [t<string>('资产上限'), 'header'],
      [t<string>('已发行总量'), 'header'],
      // [t<string>('资产精度'), 'header'],
      // [t<string>('发行商'), 'header'],
      [t<string>('注册时间'), 'header'],
      [t<string>('状态'), 'header'],
      isMine ? [t<string>('操作'), 'header'] : null
      // [t<string>('操作'), 'header']

    ].filter((v) => v);
  }
  , []);

  // console.log('ecoAccount', ecoAccount);

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
        owner: isMine ? ecoAccount : '',
        offset: (offset || 0) as number,
        limit: pagination.pageSize,
        approved: isMine ? '' : 1
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

  const goAdditionalPage = useCallback((asset: string, assetName: string) => {
    window.location.hash = `#/ecassets/additional?asset=${asset}&assetName=${assetName}`;
  }, []);

  const goBurningPage = useCallback((asset: string, assetName: string) => {
    window.location.hash = `#/ecassets/burning?asset=${asset}&assetName=${assetName}`;
  }, []);

  const StatusMap = [t<string>('已拒绝'), t<string>('流通中')];

  return (
    <div className={className}>
      <Panel title={
        <TitleRow>
          <div>{title}</div>
          <IconLink href='#/ecassets/register-assets'
            icon='plus'
            label={t<string>('碳汇资产上链')}></IconLink>
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
            empty={t<string>('暂无数据')}
            footer={null}
            header={header}
            remainHeader
          >
            {records.map((v: Record<string, any>, rowIndex: number):React.ReactNode => {
              const assetName = `${v.symbol as string}(${v.vintage as string})`;

              return <tr key={rowIndex}>
                <td><IconLink href={`#/ecassets/assets-detail?asset=${v.assetId as string}&symbol=${`${v.symbol as string}(${v.vintage as string})`}`}
                  label={`${v.symbol as string}(${v.vintage as string})`}></IconLink></td>
                <td>{v.type === 'standard' ? t<string>('标准资产') : t<string>('碳汇资产')}</td>
                <td>{v.vintage}</td>
                <td>{resolveAmountNumber((v as DataItem).projectDetail.project.max_supply)}</td>
                <td>{resolveAmountNumber((v as DataItem).assetDetail.asset.total_supply)}</td>
                {/* <td>{beautifulNumber((v as DataItem).assetDetail.asset.total_supply)}</td> */}
                {/* <td>{v.precision || '-'}</td> */}
                {/* <OwnerTd>{v.owner}</OwnerTd> */}
                <td>{formatDate(v.timestamp)}</td>
                <td>{StatusMap[v.approved] || StatusMap[0]}</td>
                <td>
                  {
                    isMine &&
                      v.approved === 1 ? <OperationSpanWrapper>
                        <OperationSpan onClick={() => goAdditionalPage(v.assetId, assetName)}>{t<string>('增发')}</OperationSpan>
                        <Divider type='vertical' />
                        <OperationSpan onClick={() => goBurningPage(v.assetId, assetName)}>{t<string>('销毁')}</OperationSpan>
                      </OperationSpanWrapper> : ''

                  }
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