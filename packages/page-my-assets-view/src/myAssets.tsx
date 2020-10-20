// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Panel from '@eco/eco-components/Panel';
import { queryAsset, queryPotentialBalance } from '@eco/eco-utils/service';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { useApi } from '@polkadot/react-hooks';
import AssetViewItem from './components/item';

interface Props {
  className?: string,
}

// interface FormProps {
//   [key: string]: string | null | undefined
// }

interface Asset {
  assetId: string,
  [key:string]: string | number
}

interface QueryDetailFn {
  (asset: Asset): Promise<void> | void
}

const Empty = styled.div`
  text-align: center;
`;

function AssetsView ({ className }: Props): React.ReactElement<Props> {
  // const [form] = Form.useForm();

  // const [curAsset, updateCurAsset] = useState<Asset | null>(null);

  const [assetsList, updateAssetsList] = useState<Asset[]>([]);
  const tempAssetListRef = useRef<Asset[]>([]);

  const { api } = useApi();
  const [ecoAccount] = useECOAccount();

  const queryAssetInfo = useCallback((asset: Asset) => {
    async function _query () {
      const result = await queryAsset(api, asset.assetId);

      tempAssetListRef.current.push({
        ...result.asset,
        ...result.additionals,
        ...asset
      });
      console.log('result', tempAssetListRef.current);

      // updateCurAsset({
      //   ...result.asset,
      //   ...result.additionals
      // });
    }

    _query();
  }, []);

  const getAssetsList = useCallback((account) => {
    async function _query () {
      const result = await queryPotentialBalance({
        owner: (account || '') as string,
        offset: 0,
        limit: 100
      });

      console.log('queryPotentialBalance', result);

      recursionQueryDetail(result as unknown as Asset[], queryAssetInfo);

      // updateAssetsList(() => {
      //   return (result.docs as Asset[]).map((doc: Asset): Asset => {
      //     return {
      //       ...doc,
      //       text: `${doc.symbol}(${doc.vintage})`,
      //       value: doc.assetId
      //     };
      //   });
      // });
    }

    _query();
  }, []);

  // 递归查询资产详情
  const recursionQueryDetail = useCallback((arr: Asset[], queryFn: QueryDetailFn) => {
    async function _run () {
      if (!arr) {
        return;
      }

      const _curItem = arr.slice(0, 1)[0];

      if (!_curItem) {
        console.log('tempAssetListRef.current', tempAssetListRef.current);
        setTimeout(() => {
          updateAssetsList(() => {
            return tempAssetListRef.current;
          });
        }, 1500);
        // tempAssetListRef.current = [];

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

  useEffect(() => {
    if (ecoAccount) {
      getAssetsList(ecoAccount);
    }
  }, [ecoAccount]);

  const standards: Asset[] = assetsList.filter((_assetItem: Asset) => _assetItem.type === 'standard');
  const carbons: Asset[] = assetsList.filter((_assetItem: Asset) => _assetItem.type !== 'standard');

  console.log('carbons', carbons);

  return (
    <div className={className}>
      {/* <Panel title='您好，A女士'>
        <p>1、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>2、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>3、阿斯顿发送到发送到发的是发送到发送到发送到</p>
      </Panel> */}
      <Panel
        title='标准资产'
      >
        {standards.map((standardAsset: Asset) => {
          return <AssetViewItem
            asset={standardAsset}
            key={standardAsset.assetId}
            type='standard'
          />;
        })}
        {!standards.length && <Empty>暂无数据</Empty>}
      </Panel>
      <Panel
        title='碳汇资产'
      >
        {carbons.map((standardAsset: Asset) => {
          return <AssetViewItem
            asset={standardAsset}
            key={standardAsset.assetId}
            type='carbon'
          />;
        })}
        {!carbons.length && <Empty>暂无数据</Empty>}
      </Panel>
    </div>
  );
}

export default AssetsView;
