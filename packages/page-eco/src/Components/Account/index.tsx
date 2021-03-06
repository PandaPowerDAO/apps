// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useMemo, useContext } from 'react';
import { BareProps } from '@polkadot/react-components/types';

import { InputAddress } from '@polkadot/react-components';

import AccountContext, { AccountProvider, ContextProps } from './accountContext';

type ECOAccount = BareProps

export default function ECOAccountComponent ({ children }: ECOAccount): React.ReactElement {
  const [ecoAccount, updateECOAccount] = useState<string>('');

  const _context = useMemo(() => {
    return [ecoAccount, updateECOAccount];
  }, [ecoAccount]);

  return (
    <AccountProvider value={_context}>
      {children}
    </AccountProvider>
  );
}

export function AccountSelector (props: BareProps): React.ReactElement {
  const [ecoAccount, updateECOAccount]: ContextProps = useContext(AccountContext);
  const handleChange = updateECOAccount as React.Dispatch<React.SetStateAction<string>>;

  return (
    <InputAddress
      className='account-selector'
      onChange={(val) => {
        if (val) {
          console.log('vvv', val);
          handleChange(val);
        }
      }}
      value={ecoAccount as unknown as string}
    />
  );
}

export function AccountUpdator (props: BareProps): React.ReactElement {
  const [ecoAccount] = useContext(AccountContext);

  return <div key={ecoAccount as string}>
    {props.children}
  </div>;
}
