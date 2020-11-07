// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface OrderItem{
  orderId: string,
  owner: string,
  closed: number | string,
  timestamp: number | string,
  _id: string,
}

export interface AssetItemType {
  assetId: string,
  projectId: string,
  [key: string]: any,
}

export interface OrderDetailType {
  [key: string]: string | number
}
