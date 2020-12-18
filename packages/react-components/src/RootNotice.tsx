// Copyright 2017-2020 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-call */

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { TxButtonProps as Props } from './types';

import React, { useContext, useEffect } from 'react';

// import Button from './Button';
import { StatusContext } from './Status';
// import { useTranslation } from './translate';

import { EE } from '@eco/eco-utils/utils';

function RootNotice ({ extrinsic: propsExtrinsic, icon, isBasic, isBusy, isDisabled, isIcon, isToplevel, isUnsigned, label, onClick, onFailed, onSendRef, onStart, onSuccess, onUpdate, params, tooltip, tx, withSpinner, withoutLink }: Props): React.ReactElement {
  // const { t } = useTranslation();
  // const { api } = useApi();
  // const mountedRef = useIsMountedRef();
  const { queueExtrinsic } = useContext(StatusContext);
  // const [, setIsSending] = useState(false);
  // const [isStarted, setIsStarted] = useState(false);
  // const needsAccount = !isUnsigned && !accountId;

  // useEffect((): void => {
  //   (isStarted && onStart) && onStart();
  // }, [isStarted, onStart]);

  useEffect(() => {
    console.log('register __ss__quq_event');
    EE.on('__ss__quq_event', ({
      txs,
      sender,
      onFailed: _failedFn,
      onSuccess: _successFn
    }) => {
      console.log('__ss__quq_event');
      (txs as SubmittableExtrinsic<'promise'>[]).forEach((extrinsic: SubmittableExtrinsic<'promise'>): void => {
        queueExtrinsic({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          accountId: sender && (sender as string).toString(),
          extrinsic,
          isUnsigned,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          txFailedCb: _failedFn,
          // txStartCb: _onStart,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          txSuccessCb: _successFn,
          txUpdateCb: onUpdate
        });
      });
    });

    return () => {
      EE.off('__ss__quq_event');
    };
  }, []);

  return <div></div>;
}

export default React.memo(RootNotice);
