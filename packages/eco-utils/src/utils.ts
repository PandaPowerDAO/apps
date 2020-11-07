// Copyright 2017-2020 @polkadot/app-council authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Keyring } from '@polkadot/api';
import BN from 'bn.js';
import EventEmitter from 'eventemitter3';

// eslint-disable-next-line header/header
export function parseQuery (_query: string): Record<string, string> {
  const query = (_query || '').replace('?', '');
  const reg = /([^=&\s]+)[=\s]([^=&\s]+)/g;
  const obj = {} as Record<string, string>;

  while (reg.exec(query)) {
    obj[RegExp.$1] = RegExp.$2;
  }

  return obj;
}

export const keyring = new Keyring({ type: 'sr25519' });

// 日期正则表达试
const dateReg = /^[1-9]\d{3}-(0?[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
const urlReg = /((https?|ftp|file):\/\/)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
const yearReg = /^\d{4}$/;

const numberReg = /^\d+$/;

const resolved = () => Promise.resolve(undefined);

/**
   * 必填校验
   */
export async function requiredValidator (rule: any, value: any): Promise<void> {
  if (!value) {
    throw new Error('不能为空');
  }

  await resolved();
}

export async function dateValidator (rule: any, value: any): Promise<void> {
  if (value && !dateReg.test(value)) {
    throw new Error('日期格式错误');
  }

  await resolved();
}

export async function urlValidator (rule: any, value: any): Promise<void> {
  if (value && !urlReg.test(value)) {
    throw new Error('url格式错误');
  }

  await resolved();
}

export async function yearValidator (rule: any, value: any): Promise<void> {
  if (value && !yearReg.test(value)) {
    throw new Error('年限格式不正确');
  }

  await resolved();
}

export function notAllprotocalChecked (_protocals:Record<string, any>):boolean {
  console.log(_protocals);

  return Object.keys(_protocals).some((pro: string): boolean => {
    return !_protocals[pro];
  });
}

export async function numberValidator (rule: any, value: any): Promise<void> {
  if (value && !numberReg.test(value)) {
    throw new Error('请输入正整数');
  }

  await resolved();
}

export function toUtf8 (data: Uint8Array): string {
  return Buffer.from(data).toString('utf8');
}

export function fromHex (data: string): string {
  if (/^0x/.test(data)) {
    return Buffer.from(data.replace('0x', ''), 'hex').toString('utf8');
  }

  return data;
}

export function toUtf8JSON (data: Uint8Array):Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(toUtf8(data) || '{}');
}

export function formatDate (datetime: number): string {
  const date = new Date(datetime);// 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  const year = date.getFullYear();
  const month = (`0${(date.getMonth() + 1)}`).slice(-2);
  const sdate = (`0${date.getDate()}`).slice(-2);
  const hour = (`0${date.getHours()}`).slice(-2);
  const minute = (`0${date.getMinutes()}`).slice(-2);
  const second = (`0${date.getSeconds()}`).slice(-2);

  // 拼接
  return `${year}-${month}-${sdate} ${hour}:${minute}:${second}`;
}

export function beautifulNumber (num: number | string): string {
  if (num === undefined || num === null) {
    return '';
  }

  return (`${num}`).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,');
}

export function unitToEco (num: number | string, power = 8) {
  return new BN(num).div(new BN(10).pow(new BN(power)));
}

export function ecoToUnit (num: number | string, power = 8) {
  return new BN(num).mul(new BN(10).pow(new BN(power)));
}

export const EE = new EventEmitter();

export const ProjectTypes = [
  '能源(可再⽣/不可再⽣) Energy (renewable/non-renewable)',
  '能源分配 Energy distribution',
  '能源需求 Energy demand',
  '制造业 Manufacturing idustries',
  '化学⼯业 Chemical industry',
  '建筑业 Construction',
  '交通 Transport',
  '采矿业/矿业 Mining/Mineral production',
  '⾦属制造 Metal production',
  '燃料⻜逸性排放 Fugitive emissions from fuels',
  '⼯业⽓体⻜逸性排放 Fugitive emissions from idustrial gases',
  '溶剂使⽤ Solvents use',
  '废弃物处⾥与填埋 Waste handling and disposal',
  '农业，林业，⼟地利⽤ Agriculture, Forestry, Land Use',
  '畜牧与肥料管理 Livestock and manure management',
  'Other 其他'
];
