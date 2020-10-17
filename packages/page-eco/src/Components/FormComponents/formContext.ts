// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';

interface ContextProps {
  [key: string]: any
}

// function createContext (name: string | null): React.Context<ContextProps> {

//   // context.Provider.displayName = `${name}.Provider`;
//   // context.Consumer.displayName = `${name}.Consumer`;

//   return context;
// }

const FormContext: React.Context<ContextProps> = React.createContext({} as unknown as ContextProps);

const FormConsumer: React.Consumer<ContextProps> = FormContext.Consumer;
const FormProvider: React.Provider<ContextProps> = FormContext.Provider;

export default FormContext;
export {
  FormConsumer,
  FormProvider
};
