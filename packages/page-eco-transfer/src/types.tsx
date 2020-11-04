// Copyright 2017-2020 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface BalanceType {
  [key: string] : string | number,
}

export interface Asset {
  assetId: string,
  // moneyId?: string,
  // balance?: BalanceType,
  [key:string]: string | number | BalanceType
}
