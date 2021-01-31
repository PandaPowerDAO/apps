// Copyright 2017-2020 @polkadot/app-js authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { AppProps as Props } from '@polkadot/react-components/types';

import React, { useCallback } from 'react';
// import { Route, Switch } from 'react-router';
import { IconLink } from '@polkadot/react-components';

// import { Tabs } from '@polkadot/react-components';
// import { useApi } from '@polkadot/react-hooks';
import SubmitBtn from '@eco/eco-components/SubmitBtn';
import styled from 'styled-components';
// import { queryCarbonBalance } from '@eco/eco-utils/service';

// import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { fromHex, beautifulNumber, reformatAssetName, resolveAmountNumber } from '@eco/eco-utils/utils';
import { useHistory } from 'react-router-dom';
// import { api } from '@polkadot/react-api';
import { useTranslation } from '@eco/eco-utils/translate';
import ECOimg from './eco.png';
import ECO2Img from './eco2.png';
import StandImg from './stand.png';
const Content = styled.div`
  display: flex;
  align-items: center;
  .title {
    font-size: 24px;
    cursor: pointer;
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
  // background-image: url('/static/eco2.3d213ebd.svg');
  background-size: cover;
  cursor: pointer;

`;
const ItemWrapper = styled.div`
  // width: 30%;
  // max-width: 20rem;
  border: .0625rem solid #e4e9f2;
  padding: 10px 12px;
  border-radius: .25rem;
  display: inline-block;
  min-width: 30%;
  margin-bottom: 30px;
  margin-right: 3%;
  font-size: .9375rem;
  font-weight: 400;
  & + & {
    // margin-left: 20px;
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

  const { t } = useTranslation('page-my-assets-view');
  const history = useHistory();

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

  const goDetail = useCallback(() => {
    history.push(`/ecassets/assets-detail?asset=${asset.assetId}&symbol=${asset.symbol as string}`);
  }, [asset]);

  return (
    <ItemWrapper>
      <Content>
        <div><Icon onClick={goDetail}
          style={{
            backgroundImage: `url('${asset.assetId === 'eco2' ? ECO2Img : (type === 'carbon' ? ECOimg : StandImg)}')`
          }} /></div>
        <div>
          <div className='title'
            onClick={goDetail}>{reformatAssetName(fromHex(asset.symbol as string))}</div>
          <div>
            {t<string>('持有量')}： {asset.assetId === 'eco2' ? beautifulNumber(balance.balance) : resolveAmountNumber(balance.balance) || 0}
          </div>
        </div>
      </Content>
      <ButtonWrapper>
        <SubmitBtn onClick={() => handleTransfer(asset)}>
          {t<string>('转账')}
        </SubmitBtn>
        {
          asset.assetId === 'eco2' ? <SubmitBtn>{t<string>('赎回')}</SubmitBtn> : <SubmitBtn>{t<string>('收款')}</SubmitBtn>
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
