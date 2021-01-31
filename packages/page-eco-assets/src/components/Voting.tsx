// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react/display-name */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
// import { Button } from '@polkadot/react-components';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';

import { isMember } from '@eco/eco-utils/utils';
import { queryProject, queryProposalVoting, voteProposal, closeProposal } from '@eco/eco-utils/service';
import { ProposalModal } from '@eco/eco-components';
import { useApi } from '@polkadot/react-hooks';
import { useMembers } from '@eco/eco-utils/useMembers';
import { useHistory } from 'react-router-dom';

import { useTranslation } from '@eco/eco-utils/translate';

const Summary = styled.div`
  text-align: center;
  .appr{
    font-size: 20px;
    color: #169BD5;
  }
  .refu{
    font-size: 20px;
    color: #D9001B;
  }
  .status {
    font-size: 20px;
    color: #4B7900;
  }
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.div`
  width: 7rem;
  padding: 6px 12px;
  text-align: center;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  & + & {
    margin-left: 32px;
  }
`;

const Addr = styled.div`
  display: inline-block;
  width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  & + & {
    margin-left: 4px;

  }
`;

interface Props {
  proposalId?:string;
  state?: string;
  subjectId: string;
}

interface Proposal {
  ayes: string [];
  nays: string [];
  threshold: number;
  index: number;
  isEnd?:boolean;
}

// state：0/待提案, 1/审批中 2/已结束
const StateMap = ['待提案', '投票中', '已结束'];

function VotingPanel ({ proposalId, state, subjectId }: Props): React.ReactElement<Props> {
  const [ecoAccount] = useECOAccount();
  const [proposal, updateProposal] = useState<Proposal>({
    ayes: [],
    nays: [],
    threshold: 2,
    index: 0,
    isEnd: false
  });

  const { api } = useApi();
  const history = useHistory();
  const members = useMembers();
  const { t } = useTranslation('component-voting');

  const ismem = useMemo(() => {
    return members.indexOf(ecoAccount) > -1;
  }, [members, ecoAccount]);

  useEffect(() => {
    _init();

    async function _init () {
      if (proposalId) {
        const proposalResult = await queryProposalVoting(api, proposalId);

        console.log('proposalResult', proposalResult);
        updateProposal(proposalResult || {
          isEnd: true,
          ayes: [],
          nays: [],
          threshold: 2,
          index: 0
        });
      }
    }
  }, [proposalId]);

  /**
   * 投票
   */
  const vote = useCallback((approve) => {
    _init();

    async function _init () {
      await voteProposal(api, ecoAccount, proposalId as string, proposal.index, approve);
      history.replace('/ecproposals');
    }
  }, [proposal, proposalId, ecoAccount, api]);

  const endProposal = useCallback(() => {
    _init();

    async function _init () {
      await closeProposal(api, ecoAccount, proposalId, proposal.index);
      history.replace('/ecproposals');
    }
  }, [proposal, proposalId, ecoAccount, api]);

  // const ismem = useMemo(() => {
  //   return isMember(ecoAccount);
  // }, [ecoAccount]);
  let content = null;

  let buttons: React.ReactElement[] = [];

  const pass = proposal.ayes.length;
  const notpass = proposal.nays.length;
  const threshold = proposal.threshold;

  const isEnd = (notpass >= threshold || pass >= threshold) && threshold !== 0;

  const isPassed = pass >= threshold && threshold > 0;

  if (!proposalId && +state === 0) {
    content = (<div>
      当前状态 <span className='toProposal'>待提案</span>
    </div>);
    buttons = [<ProposalModal isMember={ismem}
      key='pro'
      propSenderId={ecoAccount}
      subjectId={subjectId} />];
  } else if (proposalId && +state !== 2) {
    content = <div>
      共记
      <span className='appr'>{pass + notpass}</span>
      人参与投票，通过
      <span className='appr'>{pass}</span>
      人, 拒绝
      <span className='refu'>{notpass}</span>
      人，当前状态
      <span className='status'>{isEnd ? (isPassed ? '通过' : '拒绝') : (StateMap[+state] || '-')}</span>
    </div>;

    if (isEnd) {
      console.log('已经完成，不需要继续投票');
    } else {
      buttons = [
        <Button key='pass'
          onClick={() => vote(true)}
          style={{
            background: '#169bd5'
          }}>{t<string>('通过')}</Button>,
        <Button key='refus'
          onClick={() => vote(false)}
          style={{
            background: '#d9001b'
          }}>{t<string>('拒绝')}</Button>
      ];
    }
  } else if (+state === 2) {
    content = <div>
      {t<string>('投票已结束')}
    </div>;
  } else {
    content = '';
  }

  return (
    <div>
      <Summary>
        {content}
      </Summary>
      {
        +state !== 2 && notpass + pass > 0 && <div>
          <div>
          投票成员名单
          </div>
          <div>
            {[...proposal.ayes, ...proposal.nays].map((v) => {
              return <Addr key={v}>{v}</Addr>;
            })}
          </div>
        </div>
      }
      {
        ismem && <Buttons>
          {buttons}
          {
            isEnd && +state !== 2 && <Button
              onClick={endProposal}
              style={{
                background: '#169bd5'
              }}>结案</Button>
          }
        </Buttons>
      }

    </div>
  );
}

export default VotingPanel;
