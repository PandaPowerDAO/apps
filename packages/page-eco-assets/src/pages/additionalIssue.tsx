// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { Form, Button, message } from 'antd';

import { Input,
  Checkbox,
  // Dropdown,
  InputAddress } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import Panel from '@eco/eco-components/Panel';
// import Button from '@eco/eco-components/Button';
import TextArea from '@eco/eco-components/TextArea';
import FieldDecorator from '@eco/eco-components/FormComponents';
import Row from '@eco/eco-components/Row';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';

import { parseQuery,
  requiredValidator,
  urlValidator,
  // dateValidator,
  notAllprotocalChecked, numberValidator } from '@eco/eco-utils/utils';
import { queryAsset, submitIssue } from '@eco/eco-utils/service';

interface Props {
  className?: string,
}

interface FormProps {
  [key: string]: string
}

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

interface AnyObj {
  [key: string]: string | number | undefined
}

const Hidden = styled.div`
  width: 0;
  height: 0;
  opacity: 0;
`;

function AdditionalIssue ({ className }: Props): React.ReactElement<Props> {
  const [form] = Form.useForm();
  const [ecoAccount] = useECOAccount();

  const [assetsInfo, updateAssetsInfo] = useState<AnyObj>({});

  const [protocals, setProtocals] = useState<ProtocalProps>({
    costPro: false,
    registerPro: false
  });

  const { api } = useApi();
  const location = useLocation();
  const assetId = parseQuery(location.search || '').asset || '';

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);

  useEffect((): void => {
    // 获取碳汇资产及相关信息

    async function init () {
      const assetDetail = await queryAsset(api, assetId);

      console.log('additionals ---', assetDetail);

      updateAssetsInfo({
        ...(assetDetail.asset || {}),
        ...(assetDetail.additionals || {})
      });
    }

    init();
  }, []);

  const onFinish = (values: FormProps): void => {
    if (notAllprotocalChecked(protocals)) {
      message.error('请先同意协议');

      return;
    }

    async function submit () {
      // form.proponent
      const { amount, ...additionals } = values;
      const result = await submitIssue(api, ecoAccount as string, assetId, amount, additionals);

      console.log('result ----', result);
      message.info('申请提交成功');
      form.resetFields();
      setProtocals({
        costPro: false,
        registerPro: false
      });
    }

    submit();
  };

  return (
    <Form
      form={form}
      name='transfer-form'
      onFinish={onFinish}>
      <div className={className}>
        {/* <Panel title='您好，A女士'>
        <p>1、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>2、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>3、阿斯顿发送到发送到发的是发送到发送到发送到</p>
      </Panel> */}
        <Panel
          title='增发碳汇资产'
        >
          <Row>
            <Hidden>
              <InputAddress
              // isError={!!errorMap.proponent}
                label={<div>账户</div>}
                // onChange={(proponent: string | null) => setFieldsValue({ proponent })}
                placeholder='请输入项目发起人名称'
                // //value={form.proponent}
                withLabel
              />
            </Hidden>
          </Row>
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
                  withLabel
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
                  label={<div>资产年限</div>}
                  value={assetsInfo.vintage as string}
                  withLabel
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
                  label={<div>资产上限</div>}
                  labelExtra={<div>克</div>}
                  value={assetsInfo.total_supply as string}
                  withLabel
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
                  maxLength={500}
                  value={assetsInfo.total_supply as string}
                  withLabel
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
                  label={<div>申请增发数量</div>}
                  maxLength={500}
                  // onChange={(amount: string) => setFieldsValue({ amount })}
                  placeholder='请填写'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='proof'
              rules={[{
                validator: requiredValidator
              }, {
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>碳汇转入证明</div>}
                  maxLength={500}
                  // onChange={(proof: string) => setFieldsValue({ proof })}
                  placeholder='请输入'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='remark'
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
                  // onChange={(remark: string) => setFieldsValue({ remark })}
                  rows={3}
                  // value={form.remark}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
        </Panel>
        <Panel>
          <div>
            <Checkbox
              label='增发碳汇资产需要等待资产审查委员会审查通过后，您发行的碳汇资产会增加相应的可发行上限'
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div>
          <div>
            <Checkbox
              label='发布提案将消耗 100ECO及 10,000 ECC'
              onChange={(registerPro: boolean) => setProtocalValue({ registerPro })}
              value={protocals.registerPro}
            />
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <Button htmlType='submit'>增发</Button>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default AdditionalIssue;
