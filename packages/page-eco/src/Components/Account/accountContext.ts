// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { Dispatch, SetStateAction, useContext } from 'react';

// interface ContextProps {
//   [key: string]: any
// }
export type ContextProps = (string | Dispatch<SetStateAction<string>>)[];

const AccountContext: React.Context<ContextProps> = React.createContext([] as unknown as ContextProps);

const AccountConsumer: React.Consumer<ContextProps> = AccountContext.Consumer;
const AccountProvider: React.Provider<ContextProps> = AccountContext.Provider;

export default AccountContext;
export {
  AccountConsumer,
  AccountProvider
};

export const useECOAccount = () => {
  const _context = useContext(AccountContext);

  return _context;
};
