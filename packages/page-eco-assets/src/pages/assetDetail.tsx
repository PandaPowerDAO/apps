// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
// import CopyToClipBoard from 'copy-to-clipboard';
import { useApi, useToggle } from '@polkadot/react-hooks';
import Panel from '@eco/eco-components/Panel';
// import { Table } from '@polkadot/react-components';
import { useLocation, useHistory } from 'react-router-dom';
// import { NoPaddingTable } from '@eco/eco-components/Table';
import { parseQuery, beautifulNumber, fromHex, reformatAssetName, resolveAmountNumber, ecoToUnit, unitToEco } from '@eco/eco-utils/utils';
import { AnyObj } from '@eco/eco-utils/types';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
// import { Modal } from '@polkadot/react-components';

import { queryAsset, queryCarbonBalance, queryCarbonDeals, queryBalance } from '@eco/eco-utils/service';
import { Tooltip } from 'antd';
import CmptDeals from '../components/deals';
import { CopyButton, Button } from '@polkadot/react-components';
// import { push } from 'history';
import TranserSvg from '../assets/transfer.svg';
import NeutralizationSvg from '../assets/neutralization.svg';
import EcoTransfer from '@eco/page-eco-transfer/newTransfer';
import store from 'store';
// import CollectionSvg from '../assets/collection.svg';

interface Props {
  className?: string,
}

const Flex = styled.div`
  display: flex;
  align-item: center;
`;

const AssetsPanel = styled(Flex)`
  width: 100%;
  padding: 19px 12px 7px;
  border-radius: 4px;
  justify-content: space-between;
  background: white;
  margin-bottom: 12px;
`;

const Icon = styled.div`
  background-size: cover;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 50%;
`;

const AssetsOperations = styled(Flex)`
  .operation{
    text-align: center;
    cursor: pointer;
  }
  .operation + .operation {
    margin-left: 20px;
  }
  .operation-name{
    margin-top: 8px;
  }
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  .address {
    display: inline-block;
    flex: 1;
    font-family: monospace;
    margin-left: 1rem;
    opacity: 0.5;
    overflow: hidden;
    text-align: right;
    text-overflow: ellipsis;
    max-width: 14rem;
  }
`;

interface PageType {
  total?: number,
  current: number,
  pageSize: number,
}

interface OrderItem {
  orderId: string,
  maker: string,
  taker: string,
  price: string | number,
  amount: string | number,
  timestamp: number | string,
  direction: number | string,
}

// enum Direction {
//   BUY = 1,
//   SELL = 0
// }

const PanelTitle = styled.div`
  font-size: 20px;
  // padding:12px 0;
`;

const NOOP = () => undefined;

function Home ({ className }: Props): React.ReactElement<Props> {
  const [pagination, updatePagination] = useState<PageType>({
    total: 0,
    current: 0,
    pageSize: 10
  });
  const [isModalVisible, toggleModal] = useToggle();

  const history = useHistory();

  // const [showTransferModal, updateTransferModalStatus] = useState<boolean>(false);

  const [, updateRecords] = useState<OrderItem[]>([]);

  const [assetInfo, updateAssetInfo] = useState<AnyObj>({});
  const { api } = useApi();
  const location = useLocation();
  const queryObj = parseQuery(location.search || '') || {};
  const { asset: assetId, symbol = '' } = queryObj;
  const [ecoAccount] = useECOAccount();

  useEffect(() => {
    async function init (): Promise<any> {
      // eco2 只查余额;
      let _balance;
      let assetDetail;

      if (assetId === 'eco2') {
        assetDetail = {
          assetId: 'eco2',
          remark: 'ECO2通证 (ECO2 Token) 是ECO2 Ledger的实用通证 (Utility Tokens)。 参与ECO2 Ledger气候行动的个人或组织将通过持有ECO2通证来参与减排社群的治理。 ECO2 Ledger的生态系统治理、开发、应用程序和支付流程方案都将使用ECO2通证作为媒介。ECO2通证还代表了气候行动的促进，特别是在缺乏有效气候行动的地区，是传播环境知识和形成区块链环保共同体的工具'

        };
        const ecoBalance = await queryBalance(api, ecoAccount);

        // console.log('_balance _balance ', _balance);
        _balance = unitToEco(ecoBalance.balance);

        // _balance.balance =
      } else {
        assetDetail = await queryAsset(api, assetId);

        const {
          balance
        } = await queryCarbonBalance(api, assetId, ecoAccount);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        _balance = balance;
      }

      updateAssetInfo({
        ...(assetDetail.asset || {}),
        ...(assetDetail.additionals || {}),
        // balance: _balance
        balance: _balance as string as unknown as number || 0
      });
    }

    if (ecoAccount) {
      init();
    }
  }, [ecoAccount]);

  const queryDeals = useCallback((offset: number | string) => {
    _queryDeals();

    async function _queryDeals () {
      const result = await queryCarbonDeals({
        owner: '',
        offset: (offset || 0) as number,
        limit: pagination.pageSize
      });

      updateRecords(result.docs || []);

      updatePagination((_pagination) => {
        return {
          ..._pagination,
          current: (offset as number || 0) + 1,
          // pageSize:
          total: result.count || 0
        };
      });
    }
  }, []);

  useEffect(() => {
    queryDeals(0);
  }, []);

  const goTransfer = useCallback(() => {
    store.set('__eco_asset_detail_id', assetId);
    toggleModal();
  }, []);

  const goNeutralization = useCallback(() => {
    history.push(`/neutralization?asset=${assetId}`);
  }, []);

  return <div className={className}>
    <AssetsPanel>
      <div>
        <PanelTitle>{reformatAssetName(symbol || fromHex(assetInfo.symbol as string || ''))}</PanelTitle>
        <AddressWrapper>
          <span> 收款地址: </span>
          <span className='address'>{ecoAccount}</span>
          {/* <span><CopyToClipBoard text={assetInfo.owner as string as unknown || ''} >copy</CopyToClipBoard></span> */}
          <CopyButton isAddress
            value={ecoAccount}>
          </CopyButton>
          <span><Tooltip color='#fff'
            title={<QRCode value={ecoAccount || ''} />}>
            <Button
              className='icon-button show-on-hover'
              icon={'qrcode'}
              onClick={NOOP}
            />
          </Tooltip></span>
        </AddressWrapper>
        <div>
          {assetId === 'eco2' ? beautifulNumber(assetInfo.balance) : resolveAmountNumber(assetInfo.balance || 0)}
        </div>
      </div>
      <AssetsOperations>
        <div className='operation'
          onClick={goTransfer}>
          <Icon style={{ backgroundImage: `url('${TranserSvg as string}')`, width: 50, height: 50 }} />
          <div className='operation-name'
          >转账</div>
        </div>
        <div className='operation'
          onClick={goNeutralization}>
          <Icon style={{ backgroundImage: `url('${NeutralizationSvg as string}')`, width: 50, height: 50 }} />
          <div className='operation-name'>碳中和</div>
        </div>
        {/* <div className='operation'>
          <Icon style={{ backgroundImage: `url('${CollectionSvg as string}')`, width: 50, height: 50 }} />
          <div className='operation-name'>兑换</div>
        </div> */}
      </AssetsOperations>
    </AssetsPanel>
    <Panel title='资产介绍'>
      <div>
        {assetInfo.remark || '-'}
      </div>
    </Panel>
    <CmptDeals closed={1}
      isMine={false}
      reverse={0}
      title='最近交易' />
    {isModalVisible && (
      <EcoTransfer onClose={toggleModal} />
    )}
  </div>;
}

export default Home;
