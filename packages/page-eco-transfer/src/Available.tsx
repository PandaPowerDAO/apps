// Copyright 2017-2020 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-call */

import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React from 'react';
import { useApi, useCall } from '@polkadot/react-hooks';
import { queryCarbonBalanceKey, queryStandardBalanceKey } from '@eco/eco-utils/service';

// import FormatBalance from '@polkadot/react-query/FormatBalance';

import { Asset } from './types';
import BN from 'bn.js';
import { beautifulNumber, resolveAmountNumber, unitToEco } from '@eco/eco-utils/utils';
import Decimal from 'decimal.js';
import { genTranslation } from '@eco/eco-utils/translate';
const useAccountTranslation = genTranslation('app-accounts');

interface Props {
  children?: React.ReactNode;
  className?: string;
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
  asset: Asset;
  address: string;
}

function AvailableDisplay ({ children, className = '', label, params, asset, address }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useAccountTranslation();

  // const [balance, updateBalance] = useState<DeriveBalancesAll | string>('');
  // let allBalances;

  const { type = 'native', decimals = 0 } = asset || {};
  let method, _params;

  if (type === 'native') {
    method = api.derive.balances.all;
    _params = [params];
  } else if (type === 'carbon') {
    method = api.query.carbonAssets.balances;
    _params = [queryCarbonBalanceKey(asset?.assetId, address)];
  } else {
    method = api.query.standardAssets.balances;
    _params = [queryStandardBalanceKey(asset?.moneyId as string || '', address)];
  }

  const allBalances = useCall<DeriveBalancesAll>(method, _params);

  const _bal = allBalances?.availableBalance ? allBalances?.availableBalance?.toString() : (allBalances || '').toString();
  let _balance: BN|string = _bal || '0';

  if (type !== 'native' && _bal) {
    // _balance
    _balance = new Decimal(_bal || '0').div(new Decimal(10).pow(type === 'native' ? 8 : decimals as string || 0)).toFixed();
  } else if (type === 'native') {
    _balance = unitToEco(_balance);
  }

  return (
    <div>
      {t<string>('可转账的')} {type === 'native' ? beautifulNumber(_balance.toString()) : resolveAmountNumber(_balance.toString() || '0')}
    </div>
  );

  // return (
  //   <FormatBalance
  //     className={className}
  //     label={label}
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     si={asset?.symbol || ''}
  //     value={_balance}
  //     // value='0'
  //   >
  //     {children}
  //   </FormatBalance>
  // );
}

export default React.memo(AvailableDisplay);
