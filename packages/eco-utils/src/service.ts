// Copyright 2017-2020 @polkadot/app-council authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { ApiPromise } from '@polkadot/api';
// import { SubmittableExtrinsics } from '@polkadot/api/types/submittable';
import { TypeRegistry, createTypeUnsafe } from '@polkadot/types';
import { KeyringPair } from '@polkadot/keyring/types';
// import { cryptoWaitReady } from '@polkadot/util-crypto';
// import { SubmittableExtrinsic } from '@polkadot/api/types';
import axios, { AxiosResponse } from 'axios';
import { SubmittableExtrinsic } from '@polkadot/api/types';

const typeRegistry = new TypeRegistry();
let gApi: ApiPromise;

export function setGaApi (api: ApiPromise): void {
  gApi = api;
}

export function toUtf8 (data: Uint8Array): string {
  return Buffer.from(data).toString('utf8');
}

export function toUtf8JSON (data: Uint8Array):Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(toUtf8(data) || '{}');
}

// interface SubmitTxResult {
//   status: ResultStatus,
//   events: EvenInterface[]
//   // [key: string]: any,
// }

export async function submitTx (label: string, tx: SubmittableExtrinsic<'promise'>, sender: string | KeyringPair): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const unsub = await tx.signAndSend(sender, (result: { status: { isInBlock: any; isFinalized: any; }; events: { event: any; phase: any; }[]; }): void => {
    if (result.status.isInBlock) {
      result.events.forEach(({ event, phase }) => {
        const { data, method } = event;

        if (method === 'ExtrinsicFailed') {
          gApi.registry.findMetaError(data[0].asModule);
          // const { documentation, name, section } = decoded;
        }
      });
    } else if (result.status.isFinalized) {
      unsub();
    }
  });
}

export async function queryBalance (api: ApiPromise, address: string):Promise<Record<string, any>> {
  const account = await api.query.system.account(address);

  // console.log(`queryBalance for ${address}'`);
  // console.log('account:', account.toJSON());
  // console.log('balance:', account.data.free.toHuman(), account.data.free.toString());

  return {
    assetId: 'eco2',
    balance: account.data.free.toString()
  };
  // return account.data.free.toHuman();
}

export async function voteProposal (api: ApiPromise, sender: KeyringPair | string, id: string, index: number, approve: boolean):Promise<void> {
  const tx = api.tx.carbonCommittee.vote(id, index, approve);

  await submitTx('voteProposal', tx, sender);
}

export async function closeProposal (api: ApiPromise, sender: KeyringPair | string, id: string, index: number):Promise<void> {
  const maxWeight = 1000000000;
  const lengthBound = 1000;
  const tx = api.tx.carbonCommittee.close(id, index, maxWeight, lengthBound);

  await submitTx('closeProposal', tx, sender);
}

export async function queryCarbonCommitteeMembers (api: ApiPromise):Promise<void> {
  const members = await api.query.carbonCommittee.members();

  console.log('carbonCommittee members:', members.toJSON());
}

export async function queryProposalVoting (api: ApiPromise, id: string):Promise<void> {
  const voting = await api.query.carbonCommittee.voting(id);

  console.log('queryProposalVoting:', voting.toJSON());
}

export async function proposeProject (api: ApiPromise, sender: KeyringPair | string, projectId: string):Promise<void> {
  const proposal = api.tx.carbonAssets.approveProject(projectId);
  const threshold = 2;
  const lengthBound = 1000;
  const tx = api.tx.carbonCommittee.propose(threshold, proposal, lengthBound);

  await submitTx('proposeProject', tx, sender);
}

export async function proposeAsset (api: ApiPromise, sender: KeyringPair | string, projectId: string):Promise<void> {
  const proposal = api.tx.carbonAssets.approveAsset(projectId);
  const threshold = 2;
  const lengthBound = 1000;
  const tx = api.tx.carbonCommittee.propose(threshold, proposal, lengthBound);

  await submitTx('proposeAsset', tx, sender);
}

export async function proposeIssue (api: ApiPromise, sender: KeyringPair | string, projectId: string):Promise<void> {
  const proposal = api.tx.carbonAssets.approveIssue(projectId);
  const threshold = 2;
  const lengthBound = 1000;
  const tx = api.tx.carbonCommittee.propose(threshold, proposal, lengthBound);

  await submitTx('proposeIssue', tx, sender);
}

export async function proposeBurn (api: ApiPromise, sender: KeyringPair | string, projectId: string):Promise<void> {
  const proposal = api.tx.carbonAssets.approveBurn(projectId);
  const threshold = 2;
  const lengthBound = 1000;
  const tx = api.tx.carbonCommittee.propose(threshold, proposal, lengthBound);

  await submitTx('proposeBurn', tx, sender);
}

export async function transfer (api: ApiPromise, sender: KeyringPair | string, to: string, amount: string):Promise<void> {
  await submitTx('transfer', api.tx.balances.transfer(to, amount), sender);
}

export async function submitProject (api: ApiPromise, sender: KeyringPair | string, symbol: string, maxSupply: string, additional: Record<string, unknown>):Promise<void> {
  const tx = api.tx.carbonAssets.submitProject(symbol, maxSupply, JSON.stringify(additional));

  await submitTx('submitProject', tx, sender);
}

export async function queryProject (api: ApiPromise, projectId: string):Promise<Record<string, any>> {
  const project = await api.query.carbonAssets.projects(projectId);
  const additionals = await api.query.carbonAssets.projectAdditionals(projectId);

  return {
    project: project.toJSON(),
    additionals: toUtf8JSON(additionals.toU8a(true))
  };

  // console.log('queryProject:', project.toJSON(), JSON.parse(toUtf8(additionals.toU8a(true))));
}

export async function submitAsset (api: ApiPromise, sender: KeyringPair | string, projectId: string, vintage: string, initialSupply: string, additional: Record<string, unknown>):Promise<void> {
  const tx = api.tx.carbonAssets.submitAsset(projectId, vintage, initialSupply, JSON.stringify(additional));

  await submitTx('submitAsset', tx, sender);
}

export async function approveAsset (api: ApiPromise, sender: KeyringPair | string, assetId: string):Promise<void> {
  const tx = api.tx.carbonAssets.approveAsset(assetId);

  await submitTx('approveAsset', tx, sender);
}

export async function queryAsset (api: ApiPromise, assetId: string):Promise<Record<string, any>> {
  const asset = await api.query.carbonAssets.assets(assetId);
  const additionals = await api.query.carbonAssets.assetAdditionals(assetId);

  // console.log('queryAssett:', asset.toJSON(), JSON.parse(toUtf8(additionals.toU8a(true))));

  return {
    asset: asset.toJSON(),
    // asset: toUtf8JSON(asset.toU8a(true)),
    additionals: toUtf8JSON(additionals.toU8a(true))
  };

  // console.log('queryAssett:', asset.toJSON(), JSON.parse(toUtf8(additionals.toU8a(true))));
}

export async function submitIssue (api: ApiPromise, sender: KeyringPair | string, assetId: string, amount: string, additional: Record<string, unknown>):Promise<void> {
  const tx = api.tx.carbonAssets.submitIssue(assetId, amount, JSON.stringify(additional));

  await submitTx('submitIssue', tx, sender);
}

export async function approveIssue (api: ApiPromise, sender: KeyringPair | string, issueId: string):Promise<void> {
  const tx = api.tx.carbonAssets.approveIssue(issueId);

  await submitTx('approveIssue', tx, sender);
}

export async function submitBurn (api: ApiPromise, sender: KeyringPair | string, assetId: string, amount: string, additional: Record<string, unknown>):Promise<void> {
  const tx = api.tx.carbonAssets.submitBurn(assetId, amount, JSON.stringify(additional));

  await submitTx('submitBurn', tx, sender);
}

export async function approveBurn (api: ApiPromise, sender: KeyringPair | string, burnId: string):Promise<void> {
  const tx = api.tx.carbonAssets.approveBurn(burnId);

  await submitTx('approveBurn', tx, sender);
}

export async function queryCarbonBalance (api: ApiPromise, assetId: string, address: string):Promise<Record<string, any>> {
  const key = createTypeUnsafe(typeRegistry, '(Hash, AccountId)', [[assetId, address]]);
  const balance = await api.query.carbonAssets.balances(key.toHex());

  return {
    assetId,
    balance: balance.toString()
  };

  // console.log(`queryCarbonBalance: (${assetId}, ${address}) => ${balance.toHuman()}`);
}

export async function transferCarbonAsset (api: ApiPromise, sender: KeyringPair | string, assetId: string, to: string, amount: string):Promise<void> {
  const tx = api.tx.carbonAssets.transfer(assetId, to, amount);

  await submitTx('transferCarbonAsset', tx, sender);
}

export async function issueStandardAsset (api: ApiPromise, sender: KeyringPair | string, symbol: string, name: string, decimals: number, maxSupply: string, firstSupply: string):Promise<void> {
  const tx = api.tx.standardAssets.issue(symbol, name, decimals, maxSupply, firstSupply);

  await submitTx('issueStandardAsset', tx, sender);
}

export async function transferStandardAsset (api: ApiPromise, sender: KeyringPair | string, moneyId: string, to: string, amount: string):Promise<void> {
  const tx = api.tx.standardAssets.transfer(moneyId, to, amount);

  await submitTx('transferStandardAsset', tx, sender);
}

export async function queryStandardAsset (api: ApiPromise, moneyId: string):Promise<Record<string, any>> {
  const asset = await api.query.standardAssets.assetInfos(moneyId);

  return {
    assetId: '',
    balance: asset.toJSON()
  };

  // console.log('queryStandardBalance:', asset.toJSON());
}

export async function queryStandardBalance (api: ApiPromise, moneyId: string, address: string):Promise<Record<string, any>> {
  const key = createTypeUnsafe(typeRegistry, '(Hash, AccountId)', [[moneyId, address]]);
  const balance = await api.query.standardAssets.balances(key.toHex());

  // console.log(`queryStandardBalance: (${moneyId}, ${address}) => ${balance.toHuman()}`);
  return {
    asset: '',
    moneyId,
    balance: balance.toHuman()
  };
}

export async function makeOrder (api: ApiPromise, sender: KeyringPair | string, assetId: string, moneyId: string, price: string, amount: string, direction: number):Promise<void> {
  const tx = api.tx.carbonExchange.makeOrder(assetId, moneyId, price, amount, direction);

  await submitTx('makeOrder', tx, sender);
}

interface OrderDetail {
  [key: string]: string | number
}

export async function queryOrder (api: ApiPromise, orderId: string):Promise<OrderDetail> {
  const order = await api.query.carbonExchange.orders(orderId);

  // console.log('order', order.toJSON());

  return order.toJSON() as OrderDetail;
  // console.log('queryOrder:', order.toJSON());
}

export async function takeOrder (api: ApiPromise, sender: KeyringPair | string, orderId: string, amount: string):Promise<void> {
  const tx = api.tx.carbonExchange.takeOrder(orderId, amount);

  await submitTx('takeOrder', tx, sender);
}

export async function cancelOrder (api: ApiPromise, sender: KeyringPair | string, orderId: string):Promise<void> {
  const tx = api.tx.carbonExchange.cancelOrder(orderId);

  await submitTx('cancelOrder', tx, sender);
}

export async function neutralize (api: ApiPromise, sender: KeyringPair | string, assetId: string, amount: string, additional: Record<string, unknown> = {}): Promise<any> {
  const tx = api.tx.carbonAssets.neutralize(assetId, amount, JSON.stringify(additional));

  await submitTx('neutralize', tx, sender);
}

const axiosInstance = axios.create({
  baseURL: 'http://49.233.3.48:3000/'
});

// 添加响应拦截器
axiosInstance.interceptors.response.use(function (response: AxiosResponse<any>) {
  // 对响应数据做点什么
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.data.result;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});

export async function queryProjectsList (): Promise<CustomAxoisResponse> {
  // const result: AxiosResponse<any> = await axiosInstance.get('/carbon_projects');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  // return result.data;
  return axiosInstance.get('/carbon_projects');
}

interface AssetsListParams {
  limit: number,
  offset: number,
  owner?: string,
}

interface CustomAxoisResponse {
  count: number,
  docs: any[],
}

export async function queryAssetsList ({
  limit,
  offset,
  owner
}: AssetsListParams): Promise<CustomAxoisResponse> {
  return axiosInstance.get('/carbon_assets', {
    params: {
      limit,
      offset,
      owner
    }
  });
}

export async function queryCarbonDeals ({
  limit,
  offset,
  owner
}: AssetsListParams):Promise<CustomAxoisResponse> {
  return axiosInstance.get('/carbon_deals', {
    params: {
      limit,
      offset,
      owner,
      reverse: 0
    }
  });
}

interface CarbonOrdersParams{
  owner?: string,
  closed: string | number,
  reverse: string | number,
  offset: string | number,
  limit: string | number
}

export async function queryCarbonOrders (params: CarbonOrdersParams):Promise<CustomAxoisResponse> {
  return axiosInstance.get('/carbon_orders', {
    params: {
      ...params
    }
  });
}

interface CarbonDealsParams{
  owner?: string,
  // closed: string | number,
  reverse: string | number,
  offset: string | number,
  limit: string | number
}

export async function queryOrderDeals (params: CarbonDealsParams):Promise<CustomAxoisResponse> {
  return axiosInstance.get('/carbon_deals', {
    params: {
      ...params
    }
  });
}

interface MyCarbonDealsAssets{
  account: string,
  // closed: string | number,
  // reverse: string | number,
  // offset: string | number,
  // limit: string | number
}

export async function queryMyCarbonAssets (params: MyCarbonDealsAssets):Promise<CustomAxoisResponse> {
  return axiosInstance.get('/carbon_deals', {
    params: {
      ...params
    }
  });
}

interface PageType {
  limit: number | string,
  offset: number | string,
  owner?: string,
  account?: string,
}

// 有余额的碳汇资产和标准资产
export async function queryPotentialBalance (params: PageType):Promise<CustomAxoisResponse> {
  return axiosInstance.get('/potential_balances', {
    params: {
      ...params,
      account: params.account || params.owner
    }
  });
}
