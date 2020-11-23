// Copyright 2017-2020 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Badge, Icon } from '@polkadot/react-components';
import { useTranslation } from '../translate';

interface Props {
  className?: string;
}

function ChainInfo ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const history = useHistory();
  // const { api } = useApi();
  // const runtimeVersion = useCall<RuntimeVersion>(api.rpc.state.subscribeRuntimeVersion);

  return (
    <div className={className}>
      <div className='wrapper'
        onClick={() => history.push('/settings')}>
        <Icon icon='cogs' />
        {t('nav.settings', 'Settings', { ns: 'apps-routing' })}
      </div>
    </div>
  );
}

export default React.memo(styled(ChainInfo)`
  box-sizing: border-box;
  padding: 0.75rem 1rem 0.75rem 1.5rem;
  margin: 0;
  color: #4e4e4e;
  .fa-cogs{
    margin-right: 4px;
  }
  .wrapper{
    display: inline-flex;
    align-items: center;
  }
`);
