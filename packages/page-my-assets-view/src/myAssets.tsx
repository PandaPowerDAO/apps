// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Panel from '@eco/eco-components/Panel';
import { queryAsset, queryPotentialBalance, queryBalance, queryCarbonBalance, queryStandardBalance } from '@eco/eco-utils/service';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { useApi, useToggle } from '@polkadot/react-hooks';
import AssetViewItem from './components/item';
import EcoTransfer from '@eco/page-eco-transfer/newTransfer';
import store from 'store';
import BN from 'bn.js';

interface Props {
  className?: string,
}

// interface FormProps {
//   [key: string]: string | null | undefined
// }

interface Asset {
  assetId: string,
  balance: {
    balance: string | number,
    [key:string]: string | number,
  },
  [key:string]: any,
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
  const [isModalVisible, toggleModal] = useToggle();

  const queryAssetInfo = useCallback((asset: Asset) => {
    async function _query () {
      let result: any = null;
      let balance: any = {
        balance: 0
      };

      if (asset.assetId === 'eco2') {
        result = {
          ...asset
        };
      } else {
        result = await queryAsset(api, asset.assetId);
      }

      if (asset.assetId === 'eco2') {
        balance = await queryBalance(api, ecoAccount);
        console.log('balance', balance);
        balance.balance = new BN(balance.balance || 0).div(new BN(10).pow(new BN(8))).toString();
      } else if (asset.type === 'carbon') {
        balance = await queryCarbonBalance(api, asset.assetId, ecoAccount);
      } else {
        balance = await queryStandardBalance(api, asset.moneyId as string, ecoAccount);
      }

      tempAssetListRef.current.push({
        ...(result.asset || {}),
        ...(result.additionals || {}),
        ...asset,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        balance
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
      const _assetli = [{
        assetId: 'eco2',
        type: 'standard',
        account: ecoAccount,
        symbol: 'ECO2'
      }, ...(result as unknown as Asset[] || []).reverse()];

      recursionQueryDetail(_assetli as unknown as Asset[], queryAssetInfo);

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
            return tempAssetListRef.current.slice(0);
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

  const handleTransfer = useCallback((asset: Record<string, string | number>) => {
    store.set('__eco_asset_detail_id', asset.assetId);
    toggleModal();
  }, []);

  console.log('carbons', carbons);

  return (
    <div className={className}>
      {/* <Panel title='您好，A女士'>
        <p>1、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>2、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>3、阿斯顿发送到发送到发的是发送到发送到发送到</p>
      </Panel> */}
      <Panel
        css={`
          & .panel-content{
            display: flex;
            align-items: center;
            justify-content:  flex-start;
            flex-wrap: wrap;
          }
          `
        }
        title='标准资产'
      >
        {standards.map((standardAsset: Asset) => {
          return <AssetViewItem
            asset={standardAsset}
            balance={standardAsset.balance}
            handleTransfer={handleTransfer}
            key={standardAsset.assetId}
            type='standard'
          />;
        })}
        {!standards.length && <Empty>暂无数据</Empty>}
      </Panel>
      <Panel
        css={`
          & .panel-content{
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
          `
        }
        title='碳汇资产'
      >
        {carbons.map((carbonAsset: Asset) => {
          return <AssetViewItem
            asset={carbonAsset}
            balance={carbonAsset.balance}
            handleTransfer={handleTransfer}
            key={carbonAsset.assetId}
            type='carbon'
          />;
        })}
        {!carbons.length && <Empty>暂无数据</Empty>}
      </Panel>
      {
        isModalVisible && <EcoTransfer onClose={toggleModal} />
      }
    </div>
  );
}

export default AssetsView;
