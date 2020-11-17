// Copyright 2017-2020 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route } from '@polkadot/apps-routing/types';

import React, { Suspense, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import createRoutes from '@polkadot/apps-routing';
import { ErrorBoundary, Spinner, StatusContext } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import RootNotice from '@polkadot/react-components/RootNotice';

import { findMissingApis } from '../endpoint';
import { useTranslation } from '../translate';
import NotFound from './NotFound';
import Status from './Status';

interface Props {
  className?: string;
}

const NOT_FOUND: Route = {
  Component: NotFound,
  display: {
    needsApi: undefined
  },
  group: 'settings',
  icon: 'times',
  isIgnored: false,
  name: 'unknown',
  text: 'Unknown'
};

function Content ({ className }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const { t } = useTranslation();
  const { api, isApiConnected, isApiReady } = useApi();
  const { queueAction } = useContext(StatusContext);

  const { Component, display: { needsApi }, name } = useMemo(
    (): Route => {
      const app = location.pathname.slice(1) || '';

      return createRoutes(t).find((route) => !!(route && app.startsWith(route.name))) || NOT_FOUND;
    },
    [location, t]
  );

  const missingApis = findMissingApis(api, needsApi);

  return (
    <div className={className}>
      {needsApi && (!isApiReady || !isApiConnected)
        ? (
          <div className='connecting'>
            <Spinner label={t<string>('Initializing connection')} />
          </div>
        )
        : (
          <>
            <Suspense fallback='...'>
              <ErrorBoundary trigger={name}>
                {missingApis.length
                  ? (
                    <NotFound
                      basePath={`/${name}`}
                      location={location}
                      missingApis={missingApis}
                      onStatusChange={queueAction}
                    />
                  )
                  : (
                    <React.Fragment>
                      <RootNotice />
                      <Component
                        basePath={`/${name}`}
                        location={location}
                        onStatusChange={queueAction}
                      />
                    </React.Fragment>

                  )
                }
              </ErrorBoundary>
            </Suspense>
            <Status />
          </>
        )
      }
    </div>
  );
}

export default React.memo(styled(Content)`
  flex-grow: 1;
  overflow: hidden auto;
  padding: 0 1.5rem 1rem;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;

&::-webkit-scrollbar {
    width: 2px;
    height: 2px;
}

&::-webkit-scrollbar-track {
    background: #ddd;
    border: thin solid lightgray;
    box-shadow: 0px 0px 2px #f6f6f6 inset;
    -moz-box-shadow: 0px 0px 2px #f6f6f6 inset;
    -webkit-box-shadow: 0px 0px 2px #f6f6f6 inset;
    -o-box-shadow: 0px 0px 2px #f6f6f6 inset;
}

&::-webkit-scrollbar-thumb {
    background: #373737;
    border: thin solid #000;
}

  .connecting {
    padding: 3.5rem 0;
  }
`);
