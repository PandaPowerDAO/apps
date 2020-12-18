// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route } from './types';

import Modal from '@eco/page-eco-transfer/newTransfer';

export default function create (t: <T = string> (key: string, text: string, options: { ns: string }) => T): Route {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Component: Modal,
    Modal,
    display: {
      needsApi: [
        'tx.balances.transfer',
        'tx.carbonAssets.transfer',
        'tx.standardAssets.transfer'
      ]
    },
    group: 'ecotransfer',
    icon: 'paper-plane',
    name: 'ectransfer',
    text: t<string>('nav.transfer', 'Transfer', { ns: 'apps-routing' })
  };
}
