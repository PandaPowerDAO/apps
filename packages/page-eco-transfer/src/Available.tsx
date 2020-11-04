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
import { beautifulNumber } from '@eco/eco-utils/utils';

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
    _balance = new BN(_bal || '0').div(new BN(10).pow(new BN(decimals as string || 0)));
  }

  return (
    <div>
      可转账的 {beautifulNumber(_balance.toString() || '0')} {asset?.symbol || ''}
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
