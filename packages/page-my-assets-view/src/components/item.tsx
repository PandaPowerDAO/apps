// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { AppProps as Props } from '@polkadot/react-components/types';

import React, { useEffect, useState } from 'react';
// import { Route, Switch } from 'react-router';
import { IconLink } from '@polkadot/react-components';

// import { Tabs } from '@polkadot/react-components';
// import { useApi } from '@polkadot/react-hooks';
import SubmitBtn from '@eco/eco-components/SubmitBtn';
import styled from 'styled-components';
import { queryCarbonBalance } from '@eco/eco-utils/service';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { fromHex } from '@eco/eco-utils/utils';
import { api } from '@polkadot/react-api';
const Content = styled.div`
  display: flex;
  align-items: center;
  .title {
    font-size: 24px;
  }
`;

interface AssetItemType {
  asset: Record<string, string | number>,
  type: string,

}

const Icon = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-image: url('https://polkadot.js.org/apps/favicon.ico');
  background-size: cover;

`;
const ItemWrapper = styled.div`
  width: 30%;
  max-width: 20rem;
  border: 1px solid #acacac;
  padding: 8px 12px;
  border-radius: 5px;

`;
const ButtonWrapper = styled.div`
margin-top: 15px;
display: flex;
align-items: center;
justify-content: space-between;
button {
  width: 30%!important;
}
`;

function AssetItem (props: AssetItemType): React.ReactElement<AssetItemType> {
  const { type, asset } = props;

  const [balance, updateBalance] = useState<Record<string, string | number>>({});

  const [ecoAccount] = useECOAccount();

  useEffect(() => {
    if (ecoAccount && asset && asset.assetId) {
      _query();
    }

    async function _query () {
      const result = await queryCarbonBalance(api, asset.assetId as string, ecoAccount as string);

      console.log('balance', result);
      updateBalance(result);
    }
  }, [asset, ecoAccount]);

  return (
    <ItemWrapper>
      <Content>
        <div><Icon></Icon></div>
        <div>
          <div className='title'>{fromHex(asset.symbol as string)}</div>
          <div>
          持有量： {balance.balance || 0}
          </div>
        </div>
      </Content>
      <ButtonWrapper>
        <SubmitBtn>
          <IconLink href={`#/ectransfer?asset=${asset.assetId}`}
            label='转账' />
        </SubmitBtn>
        <SubmitBtn>收款</SubmitBtn>
        {
          type === 'standard' ? <SubmitBtn>兑换</SubmitBtn> : <SubmitBtn>
            <IconLink href={`#/neutralization?asset=${asset.assetId}`}
              label='碳中和' />
          </SubmitBtn>
        }
      </ButtonWrapper>
    </ItemWrapper>
  );
}

export default AssetItem;
