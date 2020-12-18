// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';

import BN from 'bn.js';

import styled from 'styled-components';

import { SubmittableExtrinsic } from '@polkadot/api/types';

import { Button, Extrinsic, InputAddress, InputNumber, Modal, TxButton, Dropdown } from '@polkadot/react-components';
import { useApi, useToggle } from '@polkadot/react-hooks';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../translate';
import { queryCarbonProposals, proposeIssue, proposeAsset, proposeBurn, proposeProject } from '@eco/eco-utils/service';
// import { getThreshold } from '../thresholds';

interface Props {
  isMember: boolean;
  // members: string[];
  [key: string] : any
}

function Propose ({ isMember, members, propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, apiDefaultTxSudo } = useApi();
  const [isOpen, toggleOpen] = useToggle();

  const [proposals, updateProposals] = useState([]);

  const [selectedProposal, updateSelectedProposal] = useState({
    type: '',
    key: ''
  });

  const onSelectProposal = useCallback((_proposal, aa) => {
    if (!_proposal) {
      return;
    }

    const [_type, _key] = _proposal.split('__');

    updateSelectedProposal({
      type: _type,
      key: _key
    });
    console.log(_proposal, aa);
  }, []);

  useEffect(() => {
    _init();

    async function _init () {
      if (isOpen) {
        const proposalsResult = await queryCarbonProposals({
          limit: 1000,
          offset: 0,
          reverse: 1
        });

        updateProposals(proposalsResult.docs.filter((doc) => {
          return !doc.proposalId;
        }).map((doc) => {
          return {
            text: doc.title,
            value: `${doc.type}__${doc.key}__${doc._id}`
          };
        }));
      }
    }
  }, [isOpen]);

  const submitProposal = useCallback(() => {
    _submit();

    async function _submit () {
      let func = null;
      const __type = selectedProposal.type;

      if (__type === 'project') {
        func = proposeProject;
      } else if (__type === 'asset') {
        func = proposeAsset;
      } else if (__type === 'issue') {
        func = proposeIssue;
      } else {
        func = proposeBurn;
      }

      await func(api, propSenderId, selectedProposal.key);

      toggleOpen();
      // const func = selectedProposal.type === 'project' ? proposeProject : ()
    }
  }, [selectedProposal, propSenderId]);

  return (
    <>
      <Button
        icon='plus'
        isDisabled={!isMember}
        label='发起提案'
        onClick={toggleOpen}
      />
      {isOpen && (
        <Modal
          header='发起提案'
          size='large'
        >
          <Modal.Content>
            <Modal.Columns>
              <Modal.Column>
                <InputAddress
                  defaultValue={propSenderId}
                  help={'Select the account you wish to make the proposal with.'}
                  isDisabled
                  label={'propose from account'}
                  // onChange={setAcountId}
                  type='account'
                  withLabel
                />
              </Modal.Column>
              <Modal.Column>
                <p>{'The council account for the proposal. The selection is filtered by the current members.'}</p>
              </Modal.Column>
            </Modal.Columns>
            <Modal.Columns>
              <Modal.Column>
                <Dropdown
                  label='请选择'
                  onChange={onSelectProposal}
                  options={proposals}
                />
              </Modal.Column>
              <Modal.Column>
                <p>proposals to commit</p>
              </Modal.Column>
            </Modal.Columns>
            {/* <Modal.Columns>
              <Modal.Column>
                <InputNumber
                  className='medium'
                  help={'The minimum number of council votes required to approve this motion'}
                  isError={!threshold || threshold.eqn(0) || threshold.gtn(members.length)}
                  label={'threshold'}
                  onChange={_setThreshold}
                  placeholder={'Positive number between 1 and {{memberCount}}', { replace: { memberCount: members.length } }}
                  value={threshold || BN_ZERO}
                />
              </Modal.Column>
              <Modal.Column>
                <p>{'The desired threshold. Here set to a default of 50%+1, as applicable for general proposals.'}</p>
              </Modal.Column>
            </Modal.Columns> */}
            <Modal.Columns>
              <Modal.Column>
                {/* <Extrinsic
                  defaultValue={apiDefaultTxSudo}
                  label={'proposal'}
                  // onChange={_setMethod}
                /> */}
              </Modal.Column>
              <Modal.Column>
                <p>{'The actual proposal to make, based on the selected call and parameters thereof.'}</p>
              </Modal.Column>
            </Modal.Columns>
          </Modal.Content>
          <Modal.Actions onCancel={toggleOpen}>
            <Button icon='plus'
              label='发起提案'
              onClick={submitProposal}>

            </Button>
            {/* <TxButton
              // accountId={accountId}
              // isDisabled={!proposal || !isThresholdValid}
              label={'Propose'}
              onStart={toggleOpen}
              // params={
              //   api.tx.council.propose.meta.args.length === 3
              //     ? [threshold, proposal, proposalLength]
              //     : [threshold, proposal]
              // }
              tx='council.propose'
            /> */}
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
}

export default React.memo(Propose);
