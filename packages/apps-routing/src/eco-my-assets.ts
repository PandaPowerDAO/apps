// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route } from './types';

import Component from '@eco/page-my-eco-assets';

export default function create (t: <T = string> (key: string, text: string, options: { ns: string }) => T): Route {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Component,
    display: {
      needsApi: []
    },
    group: 'eco',
    icon: 'users',
    name: 'myassets',
    text: t<string>('nav.eco.myAssets', 'nav.eco.myAssets', { ns: 'apps-routing' })
  };
}
