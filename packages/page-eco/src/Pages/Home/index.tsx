// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Table } from '@polkadot/react-components';

import { Pagination } from 'antd';

import { queryAssetsList } from '../../service';

import { PaginationType } from '../../Utils/types';

interface Props {
  className?: string,
}

interface DataItem {
  [key: string]: any
}

const Banner = styled.div`
  background: white;
  margin-bottom: 12px;
  padding: 0.75rem 1.5rem;
`;

const BannerImg = styled.div`
  width: 100%;
  background-size: cover;
  background-position: 50% 50%;
  height: 320px;
  background-repeat: no-repeat;
`;

function Home ({ className }: Props): React.ReactElement<Props> {
  const [paginatoin, updatePagination] = useState<PaginationType>({
    pageSize: 10,
    current: 0,
    total: 0
  });

  const header = useMemo(() => [
    ['资产名称', 'header'],
    ['资产类型', 'header'],
    ['签发年限', 'header'],
    ['资产上限', 'header'],
    ['可发行上限', 'header'],
    ['可发行总量', 'header'],
    ['资产精度', 'header'],
    ['发行商', 'header'],
    ['注册时间', 'header'],
    ['状态', 'header']
  ], []);

  const datasource = useMemo((): any[] => {
    return new Array(10).fill(1).map((v: number): DataItem => {
      return {
        created: Date.now(),
        issuer: 'sss',
        maxAvailabel: 10000,
        maxLimit: 10000,
        maxTotal: 10000,
        name: Math.random().toString(16).slice(2, 9),
        precision: 10,
        rowKey: v,
        signedAt: Date.now(),
        status: 1,
        time: Date.now(),
        type: '炭灰资产'
      };
    });
  }, []);

  const queryList = useCallback((_page: number) => {
    async function getAssets () {
      const _assets = await queryAssetsList({
        limit: 10,
        offset: _page
      });

      updatePagination({
        total: _assets.count,
        current: _page,
        pageSize: paginatoin.pageSize
      });

      console.log('assets', _assets);
    }

    getAssets();
  }, []);

  // setTimeout(() => {
  //   queryList(0);
  // }, 1000);

  const handlePageChange = useCallback((page: number): void => {
    queryList(page);
  }, []);

  return (
    <div className={className}>
      <Banner>
        <BannerImg style={{ backgroundImage: "url('https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2716489749,1188114940&fm=26&gp=0.jpg')" }} />
        <div>
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdfadfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
          adfasdfasdfadsfasdfasdfasdafgsdfgssgasdfasfasdfasdf
        </div>
      </Banner>
      <Table
        empty={'No pending extrinsics are in the queue'}
        footer={
          <tr>
            <td>
              {<Pagination
                {...paginatoin}
                onChange={handlePageChange}
              />}
            </td>
          </tr>
        }
        header={header}
      >
        {datasource.map((v: DataItem, rowIndex: number):React.ReactNode => {
          return <tr key={rowIndex}>
            <td>{v.name}</td>
            <td>{v.type}</td>
            <td>{v.signedAt}</td>
            <td>{v.maxLimit}</td>
            <td>{v.maxAvailabel}</td>
            <td>{v.maxTotal}</td>
            <td>{v.precision}</td>
            <td>{v.issuer}</td>
            <td>{v.created}</td>
            <td>{v.status}</td>
          </tr>;
        })}
      </Table>
    </div>
  );
}

export default Home;
