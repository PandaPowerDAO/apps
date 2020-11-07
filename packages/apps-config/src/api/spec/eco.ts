// Copyright 2017-2020 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

// structs need to be in order
/* eslint-disable sort-keys */
/* eslint-disable camelcase */

export default {
  Address: 'AccountId',
  LookupSource: 'AccountId',
  CarbonProject: {
    name: 'Vec<u8>',
    max_supply: 'u64',
    total_supply: 'u64',
    status: 'u8',
    owner: 'AccountId'
  },
  CarbonAsset: {
    project_id: 'Hash',
    vintage: 'Vec<u8>',
    initial_supply: 'u64',
    total_supply: 'u64',
    status: 'u8',
    additional: 'Vec<u8>'
  },
  IssueInfo: {
    asset_id: 'Hash',
    amount: 'u64',
    status: 'u8',
    additional: 'Vec<u8>'
  },
  BurnInfo: {
    asset_id: 'Hash',
    amount: 'u64',
    status: 'u8',
    additional: 'Vec<u8>'
  },
  OrderOf: {
    asset_id: 'Hash',
    money_id: 'Hash',
    maker: 'AccountId',
    amount: 'u64',
    price: 'u64',
    left_amount: 'u64',
    direction: 'u8',
    locked_balance: 'u64',
    salt: 'u64'
  },
  ECRC10: {
    symbol: 'Vec<u8>',
    name: 'Vec<u8>',
    decimals: 'u8',
    max_supply: 'u64'
  }
};
