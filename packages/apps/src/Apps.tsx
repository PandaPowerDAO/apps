// Copyright 2017-2020 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BareProps as Props, ThemeDef, ThemeProps } from '@polkadot/react-components/types';

import React, { useContext, useMemo } from 'react';
import styled, { ThemeContext } from 'styled-components';
import AccountSidebar from '@polkadot/app-accounts/Sidebar';
import { getSystemChainColor } from '@polkadot/apps-config/ui';
import GlobalStyle from '@polkadot/react-components/styles';
import { useApi } from '@polkadot/react-hooks';
import Signer from '@polkadot/react-signer';

import ECOAccountProvider, { AccountSelector, AccountUpdator } from '@eco/eco-components/Account';

import ConnectingOverlay from './overlays/Connecting';
import Content from './Content';
import Menu from './Menu';
import WarmUp from './WarmUp';
import SideMenu from './Menu/indexNew';

export const PORTAL_ID = 'portals';

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  height: calc(100vh - 63px);
  background: #edf1f7;

`;
const ECOAPPWrapper = styled.div`
.ant-form-item-label{
  display:none;
}
.ant-form-item-has-error{
  input,textarea{
    background-color: #fff6f6!important;
    border-color: #e0b4b4!important;
  }
}
// header{
//     display: flex;
//     align-items: center;
//     white-space: nowrap;
//     background: white;
//     justify-content: bettwen;
//     & > .ui--Tabs{
//       flex: 1;
//       padding-top: 0;
//     }
// }
.account-selector{
  max-width: 335px;
  width: 335px;
}
`;

function Apps ({ className = '' }: Props): React.ReactElement<Props> {
  const { theme } = useContext<ThemeDef>(ThemeContext);
  const { systemChain, systemName } = useApi();

  const uiHighlight = useMemo(
    () => getSystemChainColor(systemChain, systemName),
    [systemChain, systemName]
  );

  return (
    <>
      <GlobalStyle uiHighlight={uiHighlight} />
      <ECOAccountProvider>
        <div className={`apps--Wrapper theme--${theme} ${className}`}>
          <Menu />
          <ContentWrapper>
            <SideMenu />
            <AccountSidebar>
              <Signer>
                <AccountUpdator>
                  <Content />
                </AccountUpdator>
              </Signer>
              <ConnectingOverlay />
              <div id={PORTAL_ID} />
            </AccountSidebar>
          </ContentWrapper>
        </div>
      </ECOAccountProvider>
      <WarmUp />

    </>

  );
}

export default React.memo(styled(Apps)(({ theme }: ThemeProps) => `
  background: ${theme.bgPage};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  max-height: 100vh;
  .ant-form-item-label{
    display:none;
  }
  .ant-form-item-has-error{
    input,textarea{
      background-color: #fff6f6!important;
      border-color: #e0b4b4!important;
    }
  }

  .eco--App {
    header{
      .ui--Tabs{
        border-bottom: none;
      }
      overflow-x: hidden;
    }
  }
`));
