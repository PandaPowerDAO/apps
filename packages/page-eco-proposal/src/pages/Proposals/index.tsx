// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { AddressInfo, AddressSmall, Button } from '@polkadot/react-components';

import { Panel, Part } from '@eco/eco-components';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import ProposalsTable from './table';

const Members = [
  '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
  '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y'
];

const MembersRow = styled.div`
  display: flex;
  align-items: center;
  .ui--AddressSmall + .ui--AddressSmall{
    margin-left: 20px;
  }
`;

const PageProposals = () => {
  const [ecoAccount] = useECOAccount();

  const isMember = useMemo(() => {
    console.log(ecoAccount);

    return Members.indexOf(ecoAccount) > -1;
  }, [ecoAccount]);

  return (
    <div>
      <Part>
        <Panel title='资产审查委员会介绍'>
          <div>
            ECO2 Ledger的资产审查委员会，负责碳汇资产进出ECO2 Ledger的审查，确保链上碳汇资产的真实性和避免重复计算的问题，审查中会仔细核查申请上链的碳汇资产、 在信息、数量和相关报告中，是否与申请资料吻合。当碳汇要进入或离开ECO2 Ledger都必须经由资产审查委员会审查。资产审查委员会由五位碳汇行业之专业人士，经由节点投票后行使职权，凡链上碳汇资产之进出皆须经资产审查委员会当中三位以上同意后执行。
          </div>
        </Panel>
        <Panel title='成员列表'>
          <MembersRow>
            {Members.map((member) => {
              return <AddressSmall key={member}
                value={member} />;
            })}
          </MembersRow>
        </Panel>
      </Part>

      <ProposalsTable isMember={isMember}
        propSenderId={ecoAccount} />
    </div>
  );
};

export default PageProposals;
