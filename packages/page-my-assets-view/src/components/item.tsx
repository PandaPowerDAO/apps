// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { AppProps as Props } from '@polkadot/react-components/types';

import React from 'react';
// import { Route, Switch } from 'react-router';
import { IconLink } from '@polkadot/react-components';

// import { Tabs } from '@polkadot/react-components';
// import { useApi } from '@polkadot/react-hooks';
import SubmitBtn from '@eco/eco-components/SubmitBtn';
import styled from 'styled-components';
// import { queryCarbonBalance } from '@eco/eco-utils/service';

// import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { fromHex, beautifulNumber } from '@eco/eco-utils/utils';
// import { api } from '@polkadot/react-api';

const Content = styled.div`
  display: flex;
  align-items: center;
  .title {
    font-size: 24px;
  }
`;

interface Balance {
  balance: string | number,
  [key: string]: string | number,
}
interface AssetItemType {
  asset: Record<string, string | number>,
  type: string,
  balance: Balance,
  [key: string]: any,
  handleTransfer: (v: Record<string, string | number>) => void
}

const Icon = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-image: url('https://polkadot.js.org/apps/favicon.ico');
  background-size: cover;

`;
const ItemWrapper = styled.div`
  // width: 30%;
  // max-width: 20rem;
  border: 1px solid #acacac;
  padding: 8px 12px;
  border-radius: 5px;
  display: inline-block;
  min-width: 30%;

  & + & {
    // margin-left: 20px;
    margin-bottom: 30px;
  }

`;
const ButtonWrapper = styled.div`
margin-top: 15px;
display: flex;
align-items: center;
justify-content: space-between;
button {
  width: 30%!important;
}
a {
  color: white!important;
}
`;

function AssetItem (props: AssetItemType): React.ReactElement<AssetItemType> {
  const { type, asset, balance, handleTransfer } = props;

  // const [balance, updateBalance] = useState<Record<string, string | number>>({});

  // const [ecoAccount] = useECOAccount();

  // useEffect(() => {
  //   if (ecoAccount && asset && asset.assetId) {
  //     _query();
  //   }

  //   async function _query () {
  //     const result = await queryCarbonBalance(api, asset.assetId as string, ecoAccount as string);

  //     console.log('balance', result);
  //     updateBalance(result);
  //   }
  // }, [asset, ecoAccount]);

  return (
    <ItemWrapper>
      <Content>
        <div><Icon></Icon></div>
        <div>
          <div className='title'>{fromHex(asset.symbol as string)}</div>
          <div>
          持有量： {beautifulNumber(balance.balance) || 0}
          </div>
        </div>
      </Content>
      <ButtonWrapper>
        <SubmitBtn onClick={() => handleTransfer(asset)}>
          转账
        </SubmitBtn>
        {
          asset.assetId === 'eco2' ? <SubmitBtn>赎回</SubmitBtn> : <SubmitBtn>收款</SubmitBtn>
        }
        {
          type === 'carbon' ? <SubmitBtn>
            <IconLink href={`#/neutralization?asset=${asset.assetId}`}
              label='碳中和' />
          </SubmitBtn> : null
        }
      </ButtonWrapper>
    </ItemWrapper>
  );
}

export default AssetItem;
