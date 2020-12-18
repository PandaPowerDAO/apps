// Copyright 2017-2020 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SiDef } from '../types';

export const SI_MID = 0;

export const SI: SiDef[] = [
  // { power: -24, text: 'yocto', value: 'y' },
  // { power: -21, text: 'zepto', value: 'z' },
  // { power: -18, text: 'atto', value: 'a' },
  // { power: -15, text: 'femto', value: 'f' },
  // { power: -12, text: 'pico', value: 'p' },
  // { power: -9, text: 'nano', value: 'n' },
  // { power: -3, text: '吨', value: '吨' },
  // { power: -6, text: '千克', value: '千克' },
  { power: 8, text: '', value: '-' } // position 8 默认一个 10的8次方是一个BTC
  // { power: 3, text: '千克', value: '千克' },
  // { power: 6, text: '吨', value: '吨' }
  // { power: 9, text: 'Giga', value: 'G' },
  // { power: 12, text: 'Tera', value: 'T' },
  // { power: 15, text: 'Peta', value: 'P' },
  // { power: 18, text: 'Exa', value: 'E' },
  // { power: 21, text: 'Zeta', value: 'Z' },
  // { power: 24, text: 'Yotta', value: 'Y' }
];

// Given a SI type (e.g. k, m, Y) find the SI definition
export function findSi (type: string): SiDef {
  // use a loop here, better RN support (which doesn't have [].find)
  for (let i = 0; i < SI.length; i++) {
    if (SI[i].value === type) {
      return SI[i];
    }
  }

  return SI[SI_MID];
}

export function calcSi (text: string, decimals: number, forceUnit?: string): SiDef {
  if (forceUnit) {
    return findSi(forceUnit);
  }

  const siDefIndex = (SI_MID - 1) + Math.ceil((text.length - decimals) / 3);

  return SI[siDefIndex] || SI[siDefIndex < 0 ? 0 : SI.length - 1];
}
