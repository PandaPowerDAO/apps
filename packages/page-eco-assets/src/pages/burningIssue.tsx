// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useEffect } from 'react';
// import styled from 'styled-components';
import { Form, Button, message } from 'antd';
import { useLocation } from 'react-router-dom';

import { useApi } from '@polkadot/react-hooks';
import { Input, Checkbox } from '@polkadot/react-components';
import Panel from '@eco/eco-components/Panel';
// import Button from '@eco/eco-components/Button';
import TextArea from '@eco/eco-components/TextArea';
import FieldDecorator from '@eco/eco-components/FormComponents';
import Row from '@eco/eco-components/Row';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';

import { AnyObj } from '@eco/eco-utils/types';

import { parseQuery,
  requiredValidator,
  // urlValidator,
  // dateValidator,
  numberValidator,
  notAllprotocalChecked,
  fromHex,
  beautifulNumber,
  unitToEco,
  ecoToUnit } from '@eco/eco-utils/utils';

import { submitBurn, queryAsset, queryCarbonBalance } from '@eco/eco-utils/service';

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

function PageBurning ({ className }: Props): React.ReactElement<Props> {
  const [protocals, setProtocals] = useState<ProtocalProps>({
    costPro: false,
    // registerPro: false,
    agreed3: false,
    agreed2: false
  });

  // const [isReady, setReady] = useState<boolean>(false);

  const [ecoAccount] = useECOAccount();

  const [assetsInfo, updateAssetsInfo] = useState<AnyObj>({});

  const [form] = Form.useForm();
  const { api } = useApi();
  const location = useLocation();

  const _query = parseQuery(location.search || '') || {};

  const assetId = _query.asset || '';
  const assetName = _query.assetName || '';

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
      const result = await submitBurn(api, ecoAccount, assetId, ecoToUnit(amount, 6).toString(), additionals);

      // message.info('申请提交成功');
      form.resetFields();
      setProtocals({
        costPro: false,
        // registerPro: false,
        agreed2: false,
        agreed3: false
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
                  value={assetName}
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
                  value={fromHex(assetsInfo.vintage as string)}
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
                  label={<div>已发行总量</div>}
                  labelExtra={<div>吨</div>}
                  maxLength={500}
                  value={beautifulNumber(unitToEco(assetsInfo.total_supply as string, 6).toString() || '')}
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
                  labelExtra={<div>吨</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder='请输入'
                  // value={form.name}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
            >
              <FieldDecorator
              >
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>当前账户余额</div>}
                  labelExtra={<div>吨</div>}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  value={beautifulNumber(unitToEco(assetsInfo.balance as string || '', 6).toString())}
                  // value={beautifulNumber(assetsInfo.balance as string || '')}
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
          <div>
            <Checkbox
              label='请知晓，资产一旦销毁，不可撤回'
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div>
          {/* <div>
            <Checkbox
              label='销毁资产会优先扣除您资产可发行但未发行的额度，该部分不足的，将扣除您钱包账户的余额'
              onChange={(registerPro: boolean) => setProtocalValue({ registerPro })}
              value={protocals.registerPro}
            />
          </div> */}
          <div>
            <Checkbox
              label='销毁碳汇资产需要等待资产审查委员会审查通过后，您的碳汇数字资产将被扣除，同时会将您的真实碳汇资产原路转回到您的碳汇资产账户中'
              onChange={(agreed2: boolean) => setProtocalValue({ agreed2 })}
              value={protocals.agreed2}
            />

          </div>
          <div>
            <Checkbox
              label='销毁碳汇资产将消耗 100 ECO2 及 10,000 ECC'
              onChange={(agreed3: boolean) => setProtocalValue({ agreed3 })}
              value={protocals.agreed3}
            />
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <Button htmlType='submit'>立即销毁</Button>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default PageBurning;
