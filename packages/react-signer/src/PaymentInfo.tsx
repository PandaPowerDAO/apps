// Copyright 2017-2020 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { RuntimeDispatchInfo } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React, { useState, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { Expander } from '@polkadot/react-components';
import { useApi, useIsMountedRef } from '@polkadot/react-hooks';
import { isFunction } from '@polkadot/util';
import { formatBalance } from '@eco/polka-util-fork';
import { dropZero, unitToEco } from '@eco/eco-utils/utils';

interface Props {
  accountId?: string | null;
  className?: string;
  extrinsic?: SubmittableExtrinsic | null;
  isSendable: boolean;
  onChange?: (hasAvailable: boolean) => void;
  tip?: BN;
}

function PaymentInfo ({ accountId, className = '', extrinsic }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const [dispatchInfo, setDispatchInfo] = useState<RuntimeDispatchInfo | null>(null);
  const mountedRef = useIsMountedRef();

  useEffect((): void => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    accountId && extrinsic && isFunction(extrinsic.paymentInfo) && isFunction(api.rpc.payment?.queryInfo) &&
      setTimeout((): void => {
        try {
          extrinsic
            .paymentInfo(accountId)
            .then((info) => mountedRef.current && setDispatchInfo(info))
            .catch(console.error);
        } catch (error) {
          console.error((error as Error).message);
        }
      }, 0);
  }, [api, accountId, extrinsic, mountedRef]);

  if (!dispatchInfo) {
    return null;
  }

  // console.log('dispatchInfo.partialFee', unitToEco(dispatchInfo.partialFee.toString()));
  // const fee = new BN(10).pow(new BN(8)).mul(dispatchInfo.partialFee);

  return (
    <Expander
      className={className}
      summary={
        <Trans i18nKey='feesForSubmission'>
          {/* Fees of <span className='highlight'>{formatBalance(dispatchInfo.partialFee, { withSiFull: false })}</span> ECO2 will be applied to the submission */}
          Fees of <span className='highlight'>{unitToEco(dispatchInfo.partialFee.toString())}</span> ECO2 will be applied to the submission
        </Trans>
      }
    />
  );
}

export default React.memo(PaymentInfo);
