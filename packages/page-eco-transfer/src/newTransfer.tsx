// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';

import BN from 'bn.js';

import styled from 'styled-components';
import { InputAddress, InputBalance, Modal, Toggle, Input, TxButton, Dropdown, InputNumberPre } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
// import { Available } from '@polkadot/react-query';
import Available from './Available';
import { BN_ZERO, isFunction } from '@polkadot/util';

import { genTranslation } from '@eco/eco-utils/translate';
import { queryPotentialBalance } from '@eco/eco-utils/service';
import { reformatAssetName } from '@eco/eco-utils/utils';
// import { useECOAccount } from '@eco/eco-components/Account/accountContext';
// import ECOAccountProvider, { AccountSelector } from '@eco/eco-components/Account';
import { Asset } from './types';
import InputNumber, { TokenUnit } from '@polkadot/react-components/InputNumber';
import store from 'store';

// import NewInputNumber from './';

window.BN = BN;
const useAccountTranslation = genTranslation('app-accounts');

interface Props {
  className?: string;
  onClose: () => void;
  recipientId?: string;
  senderId?: string;
  disableRec?: boolean;
}

interface TxObject {
  apiStr: string;
  params: (string | BN | null | undefined | number)[];
}

const DefaultECO2Asset = {
  assetId: '0',
  type: 'native',
  symbol: 'ECO2',
  decimals: 8,
  text: 'ECO2',
  value: '0'
};

const calcAmount = (amount: BN, decimals: number): BN => {
  return new BN(amount).mul(new BN(10).pow(new BN(0)));
};

const AmountAfterDecimals = (amount: BN, decimals?: number) => {
  return new BN(amount).div(new BN(10).pow(new BN((decimals || 0))));
};

function Transfer ({ className = '', onClose, recipientId: propRecipientId, senderId: propSenderId, disableRec }: Props): React.ReactElement<Props> {
  const ecoAccount = window.localStorage.getItem('__eco_account') || undefined;
  const _defaultAssetId = store.get('__eco_asset_detail_id') || DefaultECO2Asset.assetId;

  console.log('_defaultAssetId', _defaultAssetId);
  const { t } = useAccountTranslation();
  const { api } = useApi();
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [hasAvailable] = useState(true);
  const [isProtected, setIsProtected] = useState(true);
  const [isAll, setIsAll] = useState(false);
  const [maxTransfer, setMaxTransfer] = useState<BN | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(propRecipientId || null);
  const [senderId, setSenderId] = useState<string | null>(ecoAccount || propSenderId || null);
  const balances = useCall<DeriveBalancesAll>(api.derive.balances.all, [senderId]);
  const [assetsList, updateAssetsList] = useState<Asset[]>([DefaultECO2Asset]);

  const [curAsset, updateCurAsset] = useState<Asset>(DefaultECO2Asset);

  const [curSi, updateCurSi] = useState<number>(0);

  // const [ecoAccount] = useECOAccount();

  const setSelectAssets = (_assetId: string): void => {
    const _next = assetsList.filter((_asset: Asset): boolean => _asset.assetId === _assetId)[0];

    if (_next) {
      TokenUnit.setAbbr(_next?.symbol as string);
      updateCurAsset(_next);
    }
  };

  useEffect(() => {
    async function _query () {
      const result = await queryPotentialBalance({
        owner: (senderId || ''),
        offset: 0,
        limit: 100
      });
      const assetFromStore: string = store.get('__eco_asset_detail_id') as string || '';

      updateAssetsList([
        {
          assetId: '0',
          type: 'native',
          symbol: 'ECO2',
          decimals: 0,
          text: 'ECO2',
          value: '0'
        },
        ...(result as unknown as Asset[]).map((_asset: Asset): Asset => {
          return {
            ..._asset,
            text: reformatAssetName(_asset.symbol as string),
            value: _asset.assetId
          };
        })
      ]);

      if (assetFromStore) {
        const _filterd: Asset[] = (result as unknown as Asset[]).filter((v: Asset) => v.assetId === assetFromStore);

        setTimeout(() => {
          _filterd[0] && updateCurAsset(_filterd[0]);
        }, 100);
      }
    }

    if (senderId) {
      setSenderId(senderId);
      _query();

      // setSelectAssets(_defaultAssetId);
    }
  }, [senderId]);

  useEffect((): void => {
    console.log('balances', balances);

    if (balances && balances.accountId.eq(senderId) && recipientId && senderId && isFunction(api.rpc.payment?.queryInfo)) {
      setTimeout((): void => {
        try {
          api.tx.balances
            .transfer(recipientId, balances.availableBalance)
            .paymentInfo(senderId)
            .then(({ partialFee }): void => {
              const maxTransfer = balances.availableBalance.sub(partialFee);

              setMaxTransfer(
                maxTransfer.gt(api.consts.balances.existentialDeposit)
                  ? maxTransfer
                  : null
              );
            })
            .catch(console.error);
        } catch (error) {
          console.error((error as Error).message);
        }
      }, 0);
    } else {
      setMaxTransfer(null);
    }
  }, [api, balances, recipientId, senderId]);

  useEffect(() => {
    return () => {
      TokenUnit.setAbbr(TokenUnit.initAbbr);
      store.remove('__eco_asset_detail_id');
    };
  }, []);
  const transferrable = <span className='label'>{t<string>('transferrable')}</span>;
  const canToggleAll = curAsset && curAsset.type !== 'native' && !isProtected && balances && balances.accountId.eq(senderId) && maxTransfer;

  const _tx = useMemo((): TxObject => {
    if (curAsset.type === 'native') {
      return {
        apiStr: isProtected && api.tx.balances.transferKeepAlive ? 'balances.transferKeepAlive' : 'balances.transfer',
        params: canToggleAll && isAll
          ? [recipientId, maxTransfer]
          // : [recipientId, calcAmount(amount as BN, 0)]
          : [recipientId, calcAmount(amount as BN, 1)]
          // : [recipientId, amount]
      };
    } else if (curAsset.type === 'carbon') {
      // carbonAssets.transfer(assetId, to, amount)
      // const _deamount = AmountAfterDecimals(amount as BN, curAsset.decimals as number);

      // const cc =

      return {
        apiStr: 'carbonAssets.transfer',
        // params: [curAsset.assetId, recipientId, calcAmount(amount as BN, curAsset.decimals as number)]
        params: [curAsset.assetId, recipientId, AmountAfterDecimals(amount as BN, curAsset.decimals as number).div(new BN(10).pow(new BN(6 - curSi)))]
      };
    } else {
      // standardAssets.transfer(moneyId, to, amount)
      return {
        apiStr: 'carbonAssets.transfer',
        // params: [curAsset.moneyId as string || '', recipientId, calcAmount(amount as BN, curAsset.decimals as number)]
        params: [curAsset.moneyId as string || '', recipientId, AmountAfterDecimals(amount as BN, curAsset.decimals as number).mul(new BN(10).pow(new BN(curSi - 6)))]
      };
    }
  }, [curAsset, isProtected, api, canToggleAll, isAll, amount, recipientId, maxTransfer, curSi]);

  const SIOptions = useMemo(() => {
    if (curAsset && curAsset.type !== 'carbon') {
      return [{
        text: curAsset.text,
        value: 0
      }];
    }

    return [{
      text: t<string>('克'),
      value: 0
    }, {
      text: t<string>('千克'),
      value: 3
    }, {
      text: t<string>('吨'),
      value: 6
    }];
  }, [curAsset]);

  const setSi = useCallback((nextSi) => {
    console.log(nextSi);
    updateCurSi(nextSi);
  }, []);

  const isSi = useMemo(() => {
    return curAsset && curAsset.assetId !== '0';
  }, [curAsset]);

  return (
    <Modal
      className='app--accounts-Modal'
      header={t<string>('Send funds')}
      size='large'
    >
      <Modal.Content>
        <div className={className}>
          <Modal.Columns>
            <Modal.Column>
              <Dropdown
                defaultValue={curAsset?.assetId}
                // isDisabled={!!propSenderId}
                label={t<string>('资产选择')}
                onChange={setSelectAssets}
                options={assetsList}
              />
            </Modal.Column>
            <Modal.Column>
              <p>{t<string>('选择资产')}</p>
            </Modal.Column>
          </Modal.Columns>
          <Modal.Columns>
            <Modal.Column>
              <InputAddress
                defaultValue={ecoAccount || propSenderId || undefined}
                help={t<string>('The account you will send funds from.')}
                isDisabled
                label={t<string>('send from account')}
                labelExtra={
                  <Available
                    address={senderId || ''}
                    asset={curAsset}
                    label={transferrable}
                    params={senderId}
                  />
                }
                onChange={setSenderId}
                type='account'
              />
            </Modal.Column>
            <Modal.Column>
              <p>{t<string>('The transferred balance will be subtracted (along with fees) from the sender account.')}</p>
            </Modal.Column>
          </Modal.Columns>
          <Modal.Columns>
            <Modal.Column>
              <InputAddress
                defaultValue={propRecipientId}
                help={t<string>('Select a contact or paste the address you want to send funds to.')}
                isDisabled={disableRec === undefined ? !!propRecipientId : !!disableRec}
                label={t<string>('send to address')}
                onChange={setRecipientId}
                // labelExtra={
                //   <Available
                //     label={transferrable}
                //     params={recipientId}
                //   />
                // }
                renderEvenNoOpts
                type='allPlus'
              />
            </Modal.Column>
            <Modal.Column>
              <p>{t<string>('The beneficiary will have access to the transferred fees when the transaction is included in a block.')}</p>
            </Modal.Column>
          </Modal.Columns>
          <Modal.Columns>
            <Modal.Column>
              {canToggleAll && isAll
                ? (
                  <InputBalance
                    autoFocus
                    defaultValue={maxTransfer}
                    help={t<string>('The full account balance to be transferred, minus the transaction fees')}
                    isDisabled
                    isSi={isSi}
                    key={maxTransfer?.toString()}
                    label={t<string>('transferrable minus fees')}
                  />
                )
                : (
                  <>
                    <InputNumberPre
                      autoFocus
                      bitLength={256}
                      css={`
                        & .ui--Input {
                          & > input {
                            max-width: 80%;
                          }
                          & > .ui.buttons {
                            width: 20%;
                          }
                        }
                        & .ui--SiDropdown{
                          & > .text{
                            width: 100%!important;
                            min-width: 4rem;
                            right: 0.5rem;
                            left: unset;


                          }
                          & .text{
                            white-space: nowrap;
                          }
                          & .menu{
                            width: auto;
                          }
                        }
                      `}
                      help={t<string>('Type the amount you want to transfer. Note that you can select the unit on the right e.g sending 1 milli is equivalent to sending 0.001.')}
                      isDecimal
                      isError={!hasAvailable}
                      isSi={false}
                      isZeroable
                      key={curAsset.assetId}
                      label={t<string>('amount')}
                      npower={curAsset.assetId === '0' ? 8 : 6}
                      onChange={setAmount}
                      precision={curAsset.assetId === '0' ? 8 : curSi}
                      // onChange={(v, vv) => { console.log('=====', v, vv); }}
                    >
                      <Dropdown
                        defaultValue={0}
                        dropdownClassName='ui--SiDropdown'
                        isButton
                        onChange={setSi}
                        options={SIOptions}
                      />

                    </InputNumberPre>
                    {
                      curAsset?.type === 'native__' ? <InputBalance
                        defaultValue={api.consts.balances.existentialDeposit}
                        help={t<string>('The minimum amount that an account should have to be deemed active')}
                        isDisabled
                        label={t<string>('existential deposit')}
                      /> : null
                    }
                  </>
                )
              }
              {api.tx.balances.transferKeepAlive && curAsset?.type === 'native' && (
                <Toggle
                  className='typeToggle'
                  label={
                    isProtected
                      ? t<string>('Transfer with account keep-alive checks')
                      : t<string>('Normal transfer without keep-alive checks')
                  }
                  onChange={setIsProtected}
                  value={isProtected}
                />
              )}
              {canToggleAll && (
                <Toggle
                  className='typeToggle'
                  label={t<string>('Transfer the full account balance, reap the sender')}
                  onChange={setIsAll}
                  value={isAll}
                />
              )}
            </Modal.Column>
            <Modal.Column>
              {/* <p>{t<string>('If the recipient account is new, the balance needs to be more than the existential deposit. Likewise if the sending account balance drops below the same value, the account will be removed from the state.')}</p> */}
              {/* <p>{t('With the keep-alive option set, the account is protected against removal due to low balances.')}</p> */}
            </Modal.Column>
          </Modal.Columns>
        </div>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={senderId}
          icon='paper-plane'
          isDisabled={!hasAvailable || !recipientId || !amount}
          label={t<string>('Make Transfer')}
          onStart={onClose}
          params={_tx?.params}
          tx={_tx?.apiStr}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(styled(Transfer)`
  .balance {
    margin-bottom: 0.5rem;
    text-align: right;
    padding-right: 1rem;

    .label {
      opacity: 0.7;
    }
  }

  label.with-help {
    flex-basis: 10rem;
  }

  .typeToggle {
    text-align: right;
  }

  .typeToggle+.typeToggle {
    margin-top: 0.375rem;
  }
`);
