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

export const Countries = [{
  id: 'AD',
  text: '安道尔 Andorra',
  en: 'Andorra',
  cn: '安道尔'
}, {
  id: 'AE',
  text: '阿联酋 United Arab Emirates',
  en: 'United Arab Emirates',
  cn: '阿联酋'
}, {
  id: 'AF',
  text: '阿富汗 Afghanistan',
  en: 'Afghanistan',
  cn: '阿富汗'
}, {
  id: 'AG',
  text: '安提瓜和巴布达 Antigua & Barbuda',
  en: 'Antigua & Barbuda',
  cn: '安提瓜和巴布达'
}, {
  id: 'AI',
  text: '安圭拉 Anguilla',
  en: 'Anguilla',
  cn: '安圭拉'
}, {
  id: 'AL',
  text: '阿尔巴尼亚 Albania',
  en: 'Albania',
  cn: '阿尔巴尼亚'
}, {
  id: 'AM',
  text: '亚美尼亚 Armenia',
  en: 'Armenia',
  cn: '亚美尼亚'
}, {
  id: 'AO',
  text: '安哥拉 Angola',
  en: 'Angola',
  cn: '安哥拉'
}, {
  id: 'AQ',
  text: '南极洲 Antarctica',
  en: 'Antarctica',
  cn: '南极洲'
}, {
  id: 'AR',
  text: '阿根廷 Argentina',
  en: 'Argentina',
  cn: '阿根廷'
}, {
  id: 'AS',
  text: '美属萨摩亚 American Samoa',
  en: 'American Samoa',
  cn: '美属萨摩亚'
}, {
  id: 'AT',
  text: '奥地利 Austria',
  en: 'Austria',
  cn: '奥地利'
}, {
  id: 'AU',
  text: '澳大利亚 Australia',
  en: 'Australia',
  cn: '澳大利亚'
}, {
  id: 'AW',
  text: '阿鲁巴 Aruba',
  en: 'Aruba',
  cn: '阿鲁巴'
}, {
  id: 'AX',
  text: '奥兰群岛 ?aland Island',
  en: '?aland Island',
  cn: '奥兰群岛'
}, {
  id: 'AZ',
  text: '阿塞拜疆 Azerbaijan',
  en: 'Azerbaijan',
  cn: '阿塞拜疆'
}, {
  id: 'BA',
  text: '波黑 Bosnia & Herzegovina',
  en: 'Bosnia & Herzegovina',
  cn: '波黑'
}, {
  id: 'BB',
  text: '巴巴多斯 Barbados',
  en: 'Barbados',
  cn: '巴巴多斯'
}, {
  id: 'BD',
  text: '孟加拉 Bangladesh',
  en: 'Bangladesh',
  cn: '孟加拉'
}, {
  id: 'BE',
  text: '比利时 Belgium',
  en: 'Belgium',
  cn: '比利时'
}, {
  id: 'BF',
  text: '布基纳法索 Burkina',
  en: 'Burkina',
  cn: '布基纳法索'
}, {
  id: 'BG',
  text: '保加利亚 Bulgaria',
  en: 'Bulgaria',
  cn: '保加利亚'
}, {
  id: 'BH',
  text: '巴林 Bahrain',
  en: 'Bahrain',
  cn: '巴林'
}, {
  id: 'BI',
  text: '布隆迪 Burundi',
  en: 'Burundi',
  cn: '布隆迪'
}, {
  id: 'BJ',
  text: '贝宁 Benin',
  en: 'Benin',
  cn: '贝宁'
}, {
  id: 'BL',
  text: '圣巴泰勒米岛 Saint Barthélemy',
  en: 'Saint Barthélemy',
  cn: '圣巴泰勒米岛'
}, {
  id: 'BM',
  text: '百慕大 Bermuda',
  en: 'Bermuda',
  cn: '百慕大'
}, {
  id: 'BN',
  text: '文莱 Brunei',
  en: 'Brunei',
  cn: '文莱'
}, {
  id: 'BO',
  text: '玻利维亚 Bolivia',
  en: 'Bolivia',
  cn: '玻利维亚'
}, {
  id: 'BQ',
  text: '荷兰加勒比区 Caribbean Netherlands',
  en: 'Caribbean Netherlands',
  cn: '荷兰加勒比区'
}, {
  id: 'BR',
  text: '巴西 Brazil',
  en: 'Brazil',
  cn: '巴西'
}, {
  id: 'BS',
  text: '巴哈马 The Bahamas',
  en: 'The Bahamas',
  cn: '巴哈马'
}, {
  id: 'BT',
  text: '不丹 Bhutan',
  en: 'Bhutan',
  cn: '不丹'
}, {
  id: 'BV',
  text: '布韦岛 Bouvet Island',
  en: 'Bouvet Island',
  cn: '布韦岛'
}, {
  id: 'BW',
  text: '博茨瓦纳 Botswana',
  en: 'Botswana',
  cn: '博茨瓦纳'
}, {
  id: 'BY',
  text: '白俄罗斯 Belarus',
  en: 'Belarus',
  cn: '白俄罗斯'
}, {
  id: 'BZ',
  text: '伯利兹 Belize',
  en: 'Belize',
  cn: '伯利兹'
}, {
  id: 'CA',
  text: '加拿大 Canada',
  en: 'Canada',
  cn: '加拿大'
}, {
  id: 'CC',
  text: '科科斯群岛 Cocos (Keeling) Islands',
  en: 'Cocos (Keeling) Islands',
  cn: '科科斯群岛'
}, {
  id: 'CF',
  text: '中非 Central African Republic',
  en: 'Central African Republic',
  cn: '中非'
}, {
  id: 'CH',
  text: '瑞士 Switzerland',
  en: 'Switzerland',
  cn: '瑞士'
}, {
  id: 'CL',
  text: '智利 Chile',
  en: 'Chile',
  cn: '智利'
}, {
  id: 'CM',
  text: '喀麦隆 Cameroon',
  en: 'Cameroon',
  cn: '喀麦隆'
}, {
  id: 'CO',
  text: '哥伦比亚 Colombia',
  en: 'Colombia',
  cn: '哥伦比亚'
}, {
  id: 'CR',
  text: '哥斯达黎加 Costa Rica',
  en: 'Costa Rica',
  cn: '哥斯达黎加'
}, {
  id: 'CU',
  text: '古巴 Cuba',
  en: 'Cuba',
  cn: '古巴'
}, {
  id: 'CV',
  text: '佛得角 Cape Verde',
  en: 'Cape Verde',
  cn: '佛得角'
}, {
  id: 'CX',
  text: '圣诞岛 Christmas Island',
  en: 'Christmas Island',
  cn: '圣诞岛'
}, {
  id: 'CY',
  text: '塞浦路斯 Cyprus',
  en: 'Cyprus',
  cn: '塞浦路斯'
}, {
  id: 'CZ',
  text: '捷克 Czech Republic',
  en: 'Czech Republic',
  cn: '捷克'
}, {
  id: 'DE',
  text: '德国 Germany',
  en: 'Germany',
  cn: '德国'
}, {
  id: 'DJ',
  text: '吉布提 Djibouti',
  en: 'Djibouti',
  cn: '吉布提'
}, {
  id: 'DK',
  text: '丹麦 Denmark',
  en: 'Denmark',
  cn: '丹麦'
}, {
  id: 'DM',
  text: '多米尼克 Dominica',
  en: 'Dominica',
  cn: '多米尼克'
}, {
  id: 'DO',
  text: '多米尼加 Dominican Republic',
  en: 'Dominican Republic',
  cn: '多米尼加'
}, {
  id: 'DZ',
  text: '阿尔及利亚 Algeria',
  en: 'Algeria',
  cn: '阿尔及利亚'
}, {
  id: 'EC',
  text: '厄瓜多尔 Ecuador',
  en: 'Ecuador',
  cn: '厄瓜多尔'
}, {
  id: 'EE',
  text: '爱沙尼亚 Estonia',
  en: 'Estonia',
  cn: '爱沙尼亚'
}, {
  id: 'EG',
  text: '埃及 Egypt',
  en: 'Egypt',
  cn: '埃及'
}, {
  id: 'EH',
  text: '西撒哈拉 Western Sahara',
  en: 'Western Sahara',
  cn: '西撒哈拉'
}, {
  id: 'ER',
  text: '厄立特里亚 Eritrea',
  en: 'Eritrea',
  cn: '厄立特里亚'
}, {
  id: 'ES',
  text: '西班牙 Spain',
  en: 'Spain',
  cn: '西班牙'
}, {
  id: 'FI',
  text: '芬兰 Finland',
  en: 'Finland',
  cn: '芬兰'
}, {
  id: 'FJ',
  text: '斐济群岛 Fiji',
  en: 'Fiji',
  cn: '斐济群岛'
}, {
  id: 'FK',
  text: '马尔维纳斯群岛（ 福克兰） Falkland Islands',
  en: 'Falkland Islands',
  cn: '马尔维纳斯群岛（ 福克兰）'
}, {
  id: 'FM',
  text: '密克罗尼西亚联邦 Federated States of Micronesia',
  en: 'Federated States of Micronesia',
  cn: '密克罗尼西亚联邦'
}, {
  id: 'FO',
  text: '法罗群岛 Faroe Islands',
  en: 'Faroe Islands',
  cn: '法罗群岛'
}, {
  id: 'FR',
  text: '法国 France',
  en: 'France',
  cn: '法国'
}, {
  id: 'GA',
  text: '加蓬 Gabon',
  en: 'Gabon',
  cn: '加蓬'
}, {
  id: 'GD',
  text: '格林纳达 Grenada',
  en: 'Grenada',
  cn: '格林纳达'
}, {
  id: 'GE',
  text: '格鲁吉亚 Georgia',
  en: 'Georgia',
  cn: '格鲁吉亚'
}, {
  id: 'GF',
  text: '法属圭亚那 French Guiana',
  en: 'French Guiana',
  cn: '法属圭亚那'
}, {
  id: 'GH',
  text: '加纳 Ghana',
  en: 'Ghana',
  cn: '加纳'
}, {
  id: 'GI',
  text: '直布罗陀 Gibraltar',
  en: 'Gibraltar',
  cn: '直布罗陀'
}, {
  id: 'GL',
  text: '格陵兰 Greenland',
  en: 'Greenland',
  cn: '格陵兰'
}, {
  id: 'GN',
  text: '几内亚 Guinea',
  en: 'Guinea',
  cn: '几内亚'
}, {
  id: 'GP',
  text: '瓜德罗普 Guadeloupe',
  en: 'Guadeloupe',
  cn: '瓜德罗普'
}, {
  id: 'GQ',
  text: '赤道几内亚 Equatorial Guinea',
  en: 'Equatorial Guinea',
  cn: '赤道几内亚'
}, {
  id: 'GR',
  text: '希腊 Greece',
  en: 'Greece',
  cn: '希腊'
}, {
  id: 'GS',
  text: '南乔治亚岛和南桑威奇群岛 South Georgia and the South Sandwich Islands',
  en: 'South Georgia and the South Sandwich Islands',
  cn: '南乔治亚岛和南桑威奇群岛'
}, {
  id: 'GT',
  text: '危地马拉 Guatemala',
  en: 'Guatemala',
  cn: '危地马拉'
}, {
  id: 'GU',
  text: '关岛 Guam',
  en: 'Guam',
  cn: '关岛'
}, {
  id: 'GW',
  text: '几内亚比绍 Guinea-Bissau',
  en: 'Guinea-Bissau',
  cn: '几内亚比绍'
}, {
  id: 'GY',
  text: '圭亚那 Guyana',
  en: 'Guyana',
  cn: '圭亚那'
}, {
  id: 'HK',
  text: '香港 Hong Kong',
  en: 'Hong Kong',
  cn: '香港'
}, {
  id: 'HM',
  text: '赫德岛和麦克唐纳群岛 Heard Island and McDonald Islands',
  en: 'Heard Island and McDonald Islands',
  cn: '赫德岛和麦克唐纳群岛'
}, {
  id: 'HN',
  text: '洪都拉斯 Honduras',
  en: 'Honduras',
  cn: '洪都拉斯'
}, {
  id: 'HR',
  text: '克罗地亚 Croatia',
  en: 'Croatia',
  cn: '克罗地亚'
}, {
  id: 'HT',
  text: '海地 Haiti',
  en: 'Haiti',
  cn: '海地'
}, {
  id: 'HU',
  text: '匈牙利 Hungary',
  en: 'Hungary',
  cn: '匈牙利'
}, {
  id: 'ID',
  text: '印尼 Indonesia',
  en: 'Indonesia',
  cn: '印尼'
}, {
  id: 'IE',
  text: '爱尔兰 Ireland',
  en: 'Ireland',
  cn: '爱尔兰'
}, {
  id: 'IL',
  text: '以色列 Israel',
  en: 'Israel',
  cn: '以色列'
}, {
  id: 'IM',
  text: '马恩岛 Isle of Man',
  en: 'Isle of Man',
  cn: '马恩岛'
}, {
  id: 'IN',
  text: '印度 India',
  en: 'India',
  cn: '印度'
}, {
  id: 'IO',
  text: '英属印度洋领地 British Indian Ocean Territory',
  en: 'British Indian Ocean Territory',
  cn: '英属印度洋领地'
}, {
  id: 'IQ',
  text: '伊拉克 Iraq',
  en: 'Iraq',
  cn: '伊拉克'
}, {
  id: 'IR',
  text: '伊朗 Iran',
  en: 'Iran',
  cn: '伊朗'
}, {
  id: 'IS',
  text: '冰岛 Iceland',
  en: 'Iceland',
  cn: '冰岛'
}, {
  id: 'IT',
  text: '意大利 Italy',
  en: 'Italy',
  cn: '意大利'
}, {
  id: 'JE',
  text: '泽西岛 Jersey',
  en: 'Jersey',
  cn: '泽西岛'
}, {
  id: 'JM',
  text: '牙买加 Jamaica',
  en: 'Jamaica',
  cn: '牙买加'
}, {
  id: 'JO',
  text: '约旦 Jordan',
  en: 'Jordan',
  cn: '约旦'
}, {
  id: 'JP',
  text: '日本 Japan',
  en: 'Japan',
  cn: '日本'
}, {
  id: 'KH',
  text: '柬埔寨 Cambodia',
  en: 'Cambodia',
  cn: '柬埔寨'
}, {
  id: 'KI',
  text: '基里巴斯 Kiribati',
  en: 'Kiribati',
  cn: '基里巴斯'
}, {
  id: 'KM',
  text: '科摩罗 The Comoros',
  en: 'The Comoros',
  cn: '科摩罗'
}, {
  id: 'KW',
  text: '科威特 Kuwait',
  en: 'Kuwait',
  cn: '科威特'
}, {
  id: 'KY',
  text: '开曼群岛 Cayman Islands',
  en: 'Cayman Islands',
  cn: '开曼群岛'
}, {
  id: 'LB',
  text: '黎巴嫩 Lebanon',
  en: 'Lebanon',
  cn: '黎巴嫩'
}, {
  id: 'LI',
  text: '列支敦士登 Liechtenstein',
  en: 'Liechtenstein',
  cn: '列支敦士登'
}, {
  id: 'LK',
  text: '斯里兰卡 Sri Lanka',
  en: 'Sri Lanka',
  cn: '斯里兰卡'
}, {
  id: 'LR',
  text: '利比里亚 Liberia',
  en: 'Liberia',
  cn: '利比里亚'
}, {
  id: 'LS',
  text: '莱索托 Lesotho',
  en: 'Lesotho',
  cn: '莱索托'
}, {
  id: 'LT',
  text: '立陶宛 Lithuania',
  en: 'Lithuania',
  cn: '立陶宛'
}, {
  id: 'LU',
  text: '卢森堡 Luxembourg',
  en: 'Luxembourg',
  cn: '卢森堡'
}, {
  id: 'LV',
  text: '拉脱维亚 Latvia',
  en: 'Latvia',
  cn: '拉脱维亚'
}, {
  id: 'LY',
  text: '利比亚 Libya',
  en: 'Libya',
  cn: '利比亚'
}, {
  id: 'MA',
  text: '摩洛哥 Morocco',
  en: 'Morocco',
  cn: '摩洛哥'
}, {
  id: 'MC',
  text: '摩纳哥 Monaco',
  en: 'Monaco',
  cn: '摩纳哥'
}, {
  id: 'MD',
  text: '摩尔多瓦 Moldova',
  en: 'Moldova',
  cn: '摩尔多瓦'
}, {
  id: 'ME',
  text: '黑山 Montenegro',
  en: 'Montenegro',
  cn: '黑山'
}, {
  id: 'MF',
  text: '法属圣马丁 Saint Martin (France)',
  en: 'Saint Martin (France)',
  cn: '法属圣马丁'
}, {
  id: 'MG',
  text: '马达加斯加 Madagascar',
  en: 'Madagascar',
  cn: '马达加斯加'
}, {
  id: 'MH',
  text: '马绍尔群岛 Marshall islands',
  en: 'Marshall islands',
  cn: '马绍尔群岛'
}, {
  id: 'MK',
  text: '马其顿 Republic of Macedonia (FYROM)',
  en: 'Republic of Macedonia (FYROM)',
  cn: '马其顿'
}, {
  id: 'ML',
  text: '马里 Mali',
  en: 'Mali',
  cn: '马里'
}, {
  id: 'MM',
  text: '缅甸 Myanmar (Burma)',
  en: 'Myanmar (Burma)',
  cn: '缅甸'
}, {
  id: 'MO',
  text: '澳门 Macao',
  en: 'Macao',
  cn: '澳门'
}, {
  id: 'MQ',
  text: '马提尼克 Martinique',
  en: 'Martinique',
  cn: '马提尼克'
}, {
  id: 'MR',
  text: '毛里塔尼亚 Mauritania',
  en: 'Mauritania',
  cn: '毛里塔尼亚'
}, {
  id: 'MS',
  text: '蒙塞拉特岛 Montserrat',
  en: 'Montserrat',
  cn: '蒙塞拉特岛'
}, {
  id: 'MT',
  text: '马耳他 Malta',
  en: 'Malta',
  cn: '马耳他'
}, {
  id: 'MV',
  text: '马尔代夫 Maldives',
  en: 'Maldives',
  cn: '马尔代夫'
}, {
  id: 'MW',
  text: '马拉维 Malawi',
  en: 'Malawi',
  cn: '马拉维'
}, {
  id: 'MX',
  text: '墨西哥 Mexico',
  en: 'Mexico',
  cn: '墨西哥'
}, {
  id: 'MY',
  text: '马来西亚 Malaysia',
  en: 'Malaysia',
  cn: '马来西亚'
}, {
  id: 'NA',
  text: '纳米比亚 Namibia',
  en: 'Namibia',
  cn: '纳米比亚'
}, {
  id: 'NE',
  text: '尼日尔 Niger',
  en: 'Niger',
  cn: '尼日尔'
}, {
  id: 'NF',
  text: '诺福克岛 Norfolk Island',
  en: 'Norfolk Island',
  cn: '诺福克岛'
}, {
  id: 'NG',
  text: '尼日利亚 Nigeria',
  en: 'Nigeria',
  cn: '尼日利亚'
}, {
  id: 'NI',
  text: '尼加拉瓜 Nicaragua',
  en: 'Nicaragua',
  cn: '尼加拉瓜'
}, {
  id: 'NL',
  text: '荷兰 Netherlands',
  en: 'Netherlands',
  cn: '荷兰'
}, {
  id: 'NO',
  text: '挪威 Norway',
  en: 'Norway',
  cn: '挪威'
}, {
  id: 'NP',
  text: '尼泊尔 Nepal',
  en: 'Nepal',
  cn: '尼泊尔'
}, {
  id: 'NR',
  text: '瑙鲁 Nauru',
  en: 'Nauru',
  cn: '瑙鲁'
}, {
  id: 'OM',
  text: '阿曼 Oman',
  en: 'Oman',
  cn: '阿曼'
}, {
  id: 'PA',
  text: '巴拿马 Panama',
  en: 'Panama',
  cn: '巴拿马'
}, {
  id: 'PE',
  text: '秘鲁 Peru',
  en: 'Peru',
  cn: '秘鲁'
}, {
  id: 'PF',
  text: '法属波利尼西亚 French polynesia',
  en: 'French polynesia',
  cn: '法属波利尼西亚'
}, {
  id: 'PG',
  text: '巴布亚新几内亚 Papua New Guinea',
  en: 'Papua New Guinea',
  cn: '巴布亚新几内亚'
}, {
  id: 'PH',
  text: '菲律宾 The Philippines',
  en: 'The Philippines',
  cn: '菲律宾'
}, {
  id: 'PK',
  text: '巴基斯坦 Pakistan',
  en: 'Pakistan',
  cn: '巴基斯坦'
}, {
  id: 'PL',
  text: '波兰 Poland',
  en: 'Poland',
  cn: '波兰'
}, {
  id: 'PN',
  text: '皮特凯恩群岛 Pitcairn Islands',
  en: 'Pitcairn Islands',
  cn: '皮特凯恩群岛'
}, {
  id: 'PR',
  text: '波多黎各 Puerto Rico',
  en: 'Puerto Rico',
  cn: '波多黎各'
}, {
  id: 'PS',
  text: '巴勒斯坦 Palestinian territories',
  en: 'Palestinian territories',
  cn: '巴勒斯坦'
}, {
  id: 'PW',
  text: '帕劳 Palau',
  en: 'Palau',
  cn: '帕劳'
}, {
  id: 'PY',
  text: '巴拉圭 Paraguay',
  en: 'Paraguay',
  cn: '巴拉圭'
}, {
  id: 'QA',
  text: '卡塔尔 Qatar',
  en: 'Qatar',
  cn: '卡塔尔'
}, {
  id: 'RE',
  text: '留尼汪 Réunion',
  en: 'Réunion',
  cn: '留尼汪'
}, {
  id: 'RO',
  text: '罗马尼亚 Romania',
  en: 'Romania',
  cn: '罗马尼亚'
}, {
  id: 'RS',
  text: '塞尔维亚 Serbia',
  en: 'Serbia',
  cn: '塞尔维亚'
}, {
  id: 'RU',
  text: '俄罗斯 Russian Federation',
  en: 'Russian Federation',
  cn: '俄罗斯'
}, {
  id: 'RW',
  text: '卢旺达 Rwanda',
  en: 'Rwanda',
  cn: '卢旺达'
}, {
  id: 'SB',
  text: '所罗门群岛 Solomon Islands',
  en: 'Solomon Islands',
  cn: '所罗门群岛'
}, {
  id: 'SC',
  text: '塞舌尔 Seychelles',
  en: 'Seychelles',
  cn: '塞舌尔'
}, {
  id: 'SD',
  text: '苏丹 Sudan',
  en: 'Sudan',
  cn: '苏丹'
}, {
  id: 'SE',
  text: '瑞典 Sweden',
  en: 'Sweden',
  cn: '瑞典'
}, {
  id: 'SG',
  text: '新加坡 Singapore',
  en: 'Singapore',
  cn: '新加坡'
}, {
  id: 'SI',
  text: '斯洛文尼亚 Slovenia',
  en: 'Slovenia',
  cn: '斯洛文尼亚'
}, {
  id: 'SJ',
  text: '斯瓦尔巴群岛和 扬马延岛 Template:Country data SJM Svalbard',
  en: 'Template:Country data SJM Svalbard',
  cn: '斯瓦尔巴群岛和 扬马延岛'
}, {
  id: 'SK',
  text: '斯洛伐克 Slovakia',
  en: 'Slovakia',
  cn: '斯洛伐克'
}, {
  id: 'SL',
  text: '塞拉利昂 Sierra Leone',
  en: 'Sierra Leone',
  cn: '塞拉利昂'
}, {
  id: 'SM',
  text: '圣马力诺 San Marino',
  en: 'San Marino',
  cn: '圣马力诺'
}, {
  id: 'SN',
  text: '塞内加尔 Senegal',
  en: 'Senegal',
  cn: '塞内加尔'
}, {
  id: 'SO',
  text: '索马里 Somalia',
  en: 'Somalia',
  cn: '索马里'
}, {
  id: 'SR',
  text: '苏里南 Suriname',
  en: 'Suriname',
  cn: '苏里南'
}, {
  id: 'SS',
  text: '南苏丹 South Sudan',
  en: 'South Sudan',
  cn: '南苏丹'
}, {
  id: 'ST',
  text: '圣多美和普林西比 Sao Tome & Principe',
  en: 'Sao Tome & Principe',
  cn: '圣多美和普林西比'
}, {
  id: 'SV',
  text: '萨尔瓦多 El Salvador',
  en: 'El Salvador',
  cn: '萨尔瓦多'
}, {
  id: 'SY',
  text: '叙利亚 Syria',
  en: 'Syria',
  cn: '叙利亚'
}, {
  id: 'SZ',
  text: '斯威士兰 Swaziland',
  en: 'Swaziland',
  cn: '斯威士兰'
}, {
  id: 'TC',
  text: '特克斯和凯科斯群岛 Turks & Caicos Islands',
  en: 'Turks & Caicos Islands',
  cn: '特克斯和凯科斯群岛'
}, {
  id: 'TD',
  text: '乍得 Chad',
  en: 'Chad',
  cn: '乍得'
}, {
  id: 'TG',
  text: '多哥 Togo',
  en: 'Togo',
  cn: '多哥'
}, {
  id: 'TH',
  text: '泰国 Thailand',
  en: 'Thailand',
  cn: '泰国'
}, {
  id: 'TK',
  text: '托克劳 Tokelau',
  en: 'Tokelau',
  cn: '托克劳'
}, {
  id: 'TL',
  text: '东帝汶 Timor-Leste (East Timor)',
  en: 'Timor-Leste (East Timor)',
  cn: '东帝汶'
}, {
  id: 'TN',
  text: '突尼斯 Tunisia',
  en: 'Tunisia',
  cn: '突尼斯'
}, {
  id: 'TO',
  text: '汤加 Tonga',
  en: 'Tonga',
  cn: '汤加'
}, {
  id: 'TR',
  text: '土耳其 Turkey',
  en: 'Turkey',
  cn: '土耳其'
}, {
  id: 'TV',
  text: '图瓦卢 Tuvalu',
  en: 'Tuvalu',
  cn: '图瓦卢'
}, {
  id: 'TZ',
  text: '坦桑尼亚 Tanzania',
  en: 'Tanzania',
  cn: '坦桑尼亚'
}, {
  id: 'UA',
  text: '乌克兰 Ukraine',
  en: 'Ukraine',
  cn: '乌克兰'
}, {
  id: 'UG',
  text: '乌干达 Uganda',
  en: 'Uganda',
  cn: '乌干达'
}, {
  id: 'US',
  text: '美国 United States of America (USA)',
  en: 'United States of America (USA)',
  cn: '美国'
}, {
  id: 'UY',
  text: '乌拉圭 Uruguay',
  en: 'Uruguay',
  cn: '乌拉圭'
}, {
  id: 'VA',
  text: '梵蒂冈 Vatican City (The Holy See)',
  en: 'Vatican City (The Holy See)',
  cn: '梵蒂冈'
}, {
  id: 'VE',
  text: '委内瑞拉 Venezuela',
  en: 'Venezuela',
  cn: '委内瑞拉'
}, {
  id: 'VG',
  text: '英属维尔京群岛 British Virgin Islands',
  en: 'British Virgin Islands',
  cn: '英属维尔京群岛'
}, {
  id: 'VI',
  text: '美属维尔京群岛 United States Virgin Islands',
  en: 'United States Virgin Islands',
  cn: '美属维尔京群岛'
}, {
  id: 'VN',
  text: '越南 Vietnam',
  en: 'Vietnam',
  cn: '越南'
}, {
  id: 'WF',
  text: '瓦利斯和富图纳 Wallis and Futuna',
  en: 'Wallis and Futuna',
  cn: '瓦利斯和富图纳'
}, {
  id: 'WS',
  text: '萨摩亚 Samoa',
  en: 'Samoa',
  cn: '萨摩亚'
}, {
  id: 'YE',
  text: '也门 Yemen',
  en: 'Yemen',
  cn: '也门'
}, {
  id: 'YT',
  text: '马约特 Mayotte',
  en: 'Mayotte',
  cn: '马约特'
}, {
  id: 'ZA',
  text: '南非 South Africa',
  en: 'South Africa',
  cn: '南非'
}, {
  id: 'ZM',
  text: '赞比亚 Zambia',
  en: 'Zambia',
  cn: '赞比亚'
}, {
  id: 'ZW',
  text: '津巴布韦 Zimbabwe',
  en: 'Zimbabwe',
  cn: '津巴布韦'
}, {
  id: 'CN',
  text: '中国 内地 China',
  en: 'China',
  cn: '中国 内地'
}, {
  id: 'CG',
  text: '刚果（布） Republic of the Congo',
  en: 'Republic of the Congo',
  cn: '刚果（布）'
}, {
  id: 'CD',
  text: '刚果（金） Democratic Republic of the Congo',
  en: 'Democratic Republic of the Congo',
  cn: '刚果（金）'
}, {
  id: 'MZ',
  text: '莫桑比克 Mozambique',
  en: 'Mozambique',
  cn: '莫桑比克'
}, {
  id: 'GG',
  text: '根西岛 Guernsey',
  en: 'Guernsey',
  cn: '根西岛'
}, {
  id: 'GM',
  text: '冈比亚 Gambia',
  en: 'Gambia',
  cn: '冈比亚'
}, {
  id: 'MP',
  text: '北马里亚纳群岛 Northern Mariana Islands',
  en: 'Northern Mariana Islands',
  cn: '北马里亚纳群岛'
}, {
  id: 'ET',
  text: '埃塞俄比亚 Ethiopia',
  en: 'Ethiopia',
  cn: '埃塞俄比亚'
}, {
  id: 'NC',
  text: '新喀里多尼亚 New Caledonia',
  en: 'New Caledonia',
  cn: '新喀里多尼亚'
}, {
  id: 'VU',
  text: '瓦努阿图 Vanuatu',
  en: 'Vanuatu',
  cn: '瓦努阿图'
}, {
  id: 'TF',
  text: '法属南部领地 French Southern Territories',
  en: 'French Southern Territories',
  cn: '法属南部领地'
}, {
  id: 'NU',
  text: '纽埃 Niue',
  en: 'Niue',
  cn: '纽埃'
}, {
  id: 'UM',
  text: '美国本土外小岛屿 United States Minor Outlying Islands',
  en: 'United States Minor Outlying Islands',
  cn: '美国本土外小岛屿'
}, {
  id: 'CK',
  text: '库克群岛 Cook Islands',
  en: 'Cook Islands',
  cn: '库克群岛'
}, {
  id: 'GB',
  text: '英国 Great Britain (United Kingdom; England)',
  en: 'Great Britain (United Kingdom; England)',
  cn: '英国'
}, {
  id: 'TT',
  text: '特立尼达和多巴哥 Trinidad & Tobago',
  en: 'Trinidad & Tobago',
  cn: '特立尼达和多巴哥'
}, {
  id: 'VC',
  text: '圣文森特和格林纳丁斯 St. Vincent & the Grenadines',
  en: 'St. Vincent & the Grenadines',
  cn: '圣文森特和格林纳丁斯'
}, {
  id: 'TW',
  text: '中国（台湾） Taiwan',
  en: 'Taiwan',
  cn: '中国（台湾）'
}, {
  id: 'NZ',
  text: '新西兰 New Zealand',
  en: 'New Zealand',
  cn: '新西兰'
}, {
  id: 'SA',
  text: '沙特阿拉伯 Saudi Arabia',
  en: 'Saudi Arabia',
  cn: '沙特阿拉伯'
}, {
  id: 'LA',
  text: '老挝 Laos',
  en: 'Laos',
  cn: '老挝'
}, {
  id: 'KP',
  text: '朝鲜 北朝鲜 North Korea',
  en: 'North Korea',
  cn: '朝鲜 北朝鲜'
}, {
  id: 'KR',
  text: '韩国 南朝鲜 South Korea',
  en: 'South Korea',
  cn: '韩国 南朝鲜'
}, {
  id: 'PT',
  text: '葡萄牙 Portugal',
  en: 'Portugal',
  cn: '葡萄牙'
}, {
  id: 'KG',
  text: '吉尔吉斯斯坦 Kyrgyzstan',
  en: 'Kyrgyzstan',
  cn: '吉尔吉斯斯坦'
}, {
  id: 'KZ',
  text: '哈萨克斯坦 Kazakhstan',
  en: 'Kazakhstan',
  cn: '哈萨克斯坦'
}, {
  id: 'TJ',
  text: '塔吉克斯坦 Tajikistan',
  en: 'Tajikistan',
  cn: '塔吉克斯坦'
}, {
  id: 'TM',
  text: '土库曼斯坦 Turkmenistan',
  en: 'Turkmenistan',
  cn: '土库曼斯坦'
}, {
  id: 'UZ',
  text: '乌兹别克斯坦 Uzbekistan',
  en: 'Uzbekistan',
  cn: '乌兹别克斯坦'
}, {
  id: 'KN',
  text: '圣基茨和尼维斯 St. Kitts & Nevis',
  en: 'St. Kitts & Nevis',
  cn: '圣基茨和尼维斯'
}, {
  id: 'PM',
  text: '圣皮埃尔和密克隆 Saint-Pierre and Miquelon',
  en: 'Saint-Pierre and Miquelon',
  cn: '圣皮埃尔和密克隆'
}, {
  id: 'SH',
  text: '圣赫勒拿 St. Helena & Dependencies',
  en: 'St. Helena & Dependencies',
  cn: '圣赫勒拿'
}, {
  id: 'LC',
  text: '圣卢西亚 St. Lucia',
  en: 'St. Lucia',
  cn: '圣卢西亚'
}, {
  id: 'MU',
  text: '毛里求斯 Mauritius',
  en: 'Mauritius',
  cn: '毛里求斯'
}, {
  id: 'CI',
  text: "科特迪瓦 C?te d'Ivoire",
  en: "C?te d'Ivoire",
  cn: '科特迪瓦'
}, {
  id: 'KE',
  text: '肯尼亚 Kenya',
  en: 'Kenya',
  cn: '肯尼亚'
}, {
  id: 'MN',
  text: '蒙古国 蒙古 Mongolia',
  en: 'Mongolia',
  cn: '蒙古国 蒙古'
}];

// 交易页面交易列表数量显示处理
export const resolveAmountNumber = (number: string | number): string => {
  const _num = new BN(number || 0);
  const isG = _num.lt(new BN(1000));
  const isKg = _num.gte(new BN(1000)) && _num.lt(new BN(1000000));
  const isTon = _num.gte(new BN(1000000));

  const _unit = isG ? {
    _u: '克',
    value: 0
  } : (isKg ? {
    _u: '千克',
    value: 3
  } : (isTon ? {
    _u: '吨',
    value: 6
  } : {
    _u: '',
    value: 0
  }));

  return `${beautifulNumber(_num.div(new BN(10).pow(new BN(_unit.value || 0))).toString())}${_unit._u}`;
};

/**
 * 格式化资产名称
 *
 * @param   {string}  name  [name description]
 *
 * @return  {string}        [return description]
 */
export const reformatAssetName = (name: string): string => {
  return name.replace(/^([A-Z]+)\.(\d+)$/, '$1($2)');
};
