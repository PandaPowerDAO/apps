// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { Dispatch, SetStateAction, useContext } from 'react';

// interface ContextProps {
//   [key: string]: any
// }
export type ContextProps = string[];

const MembersContext: React.Context<ContextProps> = React.createContext([] as unknown as ContextProps);

const MembersConsumer: React.Consumer<ContextProps> = MembersContext.Consumer;
const MembersProvider: React.Provider<ContextProps> = MembersContext.Provider;

export default MembersContext;
export {
  MembersConsumer,
  MembersProvider
};

export const useMembers = () => {
  const _context = useContext(MembersContext);

  return _context;
};
