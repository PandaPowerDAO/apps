// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';
// import styled, { css } from 'styled-components';

import { Input, Checkbox } from '@polkadot/react-components';
import Panel from '../../Components/Panel';
import Button from '../../Components/Button';
import Row from '../../Components/Row';

interface Props {
  className?: string,
}

// interface DataItem {
//   [key: string]: string | number | undefined | null
// }

interface FormProps {
  [key: string]: string | null | undefined
}

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

function Home ({ className }: Props): React.ReactElement<Props> {
  const [form, setForm] = useState<FormProps>({
    name: '',
    description: ''
  });

  const [protocals, setProtocals] = useState<ProtocalProps>({
    costPro: false,
    registerPro: false
  });

  const setFieldsValue = useCallback((field: FormProps): void => {
    setForm({
      ...form,
      ...field
    });
  }, [form]);

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);

  return (
    <div className={className}>
      <Panel title='您好，A女士'>
        <p>1、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>2、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>3、阿斯顿发送到发送到发的是发送到发送到发送到</p>
      </Panel>
      <Panel
        title='完善提案细节'
      >
        <Row>
          <Input
            isFull={false}
            label={<div>发行商名称</div>}
            labelExtra={<div>{form.name?.length}/15</div>}
            maxLength={15}
            onChange={(issuerName: string) => setFieldsValue({ name: issuerName })}
            value={form.name}
            withLabel={true}
          />
        </Row>
        <Row>
          <Input
            isFull={false}
            label={<div>描述</div>}
            labelExtra={<div>{form.remark?.length} / 500</div>}
            maxLength={500}
            onChange={(remark: string) => setFieldsValue({ remark })}
            value={form.name}
            withLabel={true}
          />
        </Row>
      </Panel>
      <Panel>
        <div>
          <Checkbox
            label='注册成为发行商，将消耗 100ECO及 10,000 ECC'
            onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
            value={protocals.costPro}
          />

        </div>
        <div>
          <Checkbox
            label='我同意遵守TOS协议内容'
            onChange={(registerPro: boolean) => setProtocalValue({ registerPro })}
            value={protocals.registerPro}
          />
        </div>
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <Button>注册</Button>
        </div>
      </Panel>
    </div>
  );
}

export default Home;
