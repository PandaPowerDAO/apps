// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useEffect } from 'react';
// import styled from 'styled-components';
import { Form, Button, message } from 'antd';
import { useLocation } from 'react-router-dom';

import { useApi } from '@polkadot/react-hooks';
import { Input, Checkbox } from '@polkadot/react-components';
import Panel from '../Components/Panel';
// import Button from '../Components/Button';
import TextArea from '../Components/TextArea';
import FieldDecorator from '../Components/FormComponents';
import Row from '../Components/Row';
import { useECOAccount } from '../Components/Account/accountContext';

import { AnyObj } from '../Utils/types';

import { parseQuery,
  requiredValidator,
  // urlValidator,
  // dateValidator,
  numberValidator,
  notAllprotocalChecked } from '../Utils';

import { submitBurn, queryAsset, queryCarbonBalance } from '../service';

interface Props {
  className?: string,
}

// interface DataItem {
//   [key: string]: string | number | undefined | null
// }

interface FormProps {
  [key: string]: string
}

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

function RegisterCoins ({ className }: Props): React.ReactElement<Props> {
  const [protocals, setProtocals] = useState<ProtocalProps>({
    // costPro: false,
    registerPro: false
  });

  // const [isReady, setReady] = useState<boolean>(false);

  const [ecoAccount] = useECOAccount();

  const [assetsInfo, updateAssetsInfo] = useState<AnyObj>({});

  const [form] = Form.useForm();
  const { api } = useApi();
  const location = useLocation();

  const assetId = parseQuery(location.search || '').asset || '';

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);

  const queryCarbonAsset = useCallback((address) => {
    async function init () {
      const {
        // assetId as asset_id,
        balance
      } = await queryCarbonBalance(api, assetId, address);
      const assetDetail = await queryAsset(api, assetId);

      console.log('additionals', balance);
      updateAssetsInfo({
        ...(assetDetail.asset || {}),
        ...(assetDetail.additionals || {}),
        balance: balance as string as unknown as number
      });
    }

    init();
  }, [ecoAccount]);

  useEffect(() => {
    if (ecoAccount) {
      queryCarbonAsset(ecoAccount);
    }
  }, [ecoAccount]);

  /**
   * 申请销毁资产
   */

  const onFinish = (values: FormProps) => {
    if (notAllprotocalChecked(protocals)) {
      message.error('请先同意协议');

      return;
    }

    async function submit () {
      // form.proponent
      const { amount, ...additionals } = values;
      const result = await submitBurn(api, ecoAccount as string, assetId, amount, additionals);

      message.info('申请提交成功');
      form.resetFields();
      setProtocals({
        // costPro: false,
        registerPro: false
      });

      console.log('result ----', result);
    }

    submit();
  };

  return (
    <Form
      form={form}
      name='burning-form'
      onFinish={onFinish}>
      <div className={className}>
        <Panel
          title='销毁碳汇资产'
        >
          <Row>
            <Form.Item
              label=' '
            >
              <FieldDecorator>
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>当前资产</div>}
                  value={assetsInfo.symbol as string}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
            >
              <FieldDecorator>
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>资产年限</div>}
                  value={assetsInfo.vintage as string}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
            >
              <FieldDecorator>
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>资产上限</div>}
                  labelExtra={<div>克</div>}
                  maxLength={500}
                  value={assetsInfo.total_supply as string}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='amount'
              rules={[{
                validator: requiredValidator
              }, {
                validator: numberValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>申请销毁数量</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder='请选择'
                  // value={form.name}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='type'
              rules={[{
                // validator: requiredValidator
              }]}>
              <FieldDecorator
              >
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>当前账户余额</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder='请输入'
                  value={assetsInfo.balance as string || ''}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='type'
              rules={[{
                // validator: requiredValidator
              }]}>
              <FieldDecorator
              >
                <TextArea
                  isFull={false}
                  label={<div>描述</div>}
                  labelExtra={<div>最多500字</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  rows={3}
                  // value={form.description}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
        </Panel>
        <Panel>
          {/* <div>
            <Checkbox
              label='注册成为发行商，将消耗 100ECO及 10,000 ECC'
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div> */}
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
            <Button htmlType='submit'>申请</Button>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default RegisterCoins;
