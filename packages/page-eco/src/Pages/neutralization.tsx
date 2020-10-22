// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
// import styled from 'styled-components';
import { Form, Button, message } from 'antd';
// import { useLocation } from 'react-router-dom';

import { Input, Dropdown } from '@polkadot/react-components';
import Panel from '../Components/Panel';
// import Button from '../Components/Button';
import TextArea from '../Components/TextArea';

import FieldDecorator from '../Components/FormComponents';
import Row from '../Components/Row';

import { queryAssetsList, neutralize } from '../service';
import { useECOAccount } from '../Components/Account/accountContext';
import { useApi } from '@polkadot/react-hooks';

import { requiredValidator,
  numberValidator } from '../Utils';

interface Props {
  className?: string,
}

// interface DataItem {
//   [key: string]: string | number | undefined | null
// }

interface FormProps {
  [key: string]: string
}

// interface ProtocalProps {
//   [key: string]: undefined | null | boolean
// }

interface Asset {
  assetId: string,
  [key:string]: string | number
}

function RegisterCoins ({ className }: Props): React.ReactElement<Props> {
  const [assetsList, updateAssetsList] = useState<Asset[]>([]);

  // const [protocals, setProtocals] = useState<ProtocalProps>({
  //   costPro: false,
  //   registerPro: false
  // });

  // const setProtocalValue = useCallback((protocal): void => {
  //   setProtocals({
  //     ...protocals,
  //     ...protocal
  //   });
  // }, [protocals]);

  // const AssetsOpts = useMemo(() => {
  //   return [{
  //     text: '碳汇资产',
  //     value: 'eco'
  //   }];
  // }, []);

  const [form] = Form.useForm();
  const { api } = useApi();
  const [ecoAccount] = useECOAccount();

  const getAssetsList = useCallback((account) => {
    async function _query () {
      const result = await queryAssetsList({
        owner: (account || '') as string,
        offset: 0,
        limit: 100
      });

      updateAssetsList(() => {
        return (result.docs as Asset[]).map((doc: Asset): Asset => {
          return {
            ...doc,
            text: `${doc.symbol}(${doc.vintage})`,
            value: doc.assetId
          };
        });
      });
    }

    _query();
  }, []);

  useEffect(() => {
    if (ecoAccount) {
      getAssetsList(ecoAccount);
    }
  }, [ecoAccount]);

  // 1. 商业活动
  // 2. 日常生活
  // 3. 交通出行
  // 4. 生产制造
  // 5. 企业组织
  // 6. 其他
  const NeoTypes = useMemo(() => {
    return [{
      text: '商业活动',
      value: '1'
    }, {
      text: '日常生活',
      value: '2'
    }, {
      text: '交通出行',
      value: '3'
    }, {
      text: '生产制造',
      value: '4'
    }, {
      text: '企业组织',
      value: '5'
    }, {
      text: '其他',
      value: '6'
    }];
  }, []);

  const onFinish = useCallback((values: FormProps) => {
    const { assetId, amount, ...additionals } = values;

    _neutralize();

    async function _neutralize () {
      await neutralize(api, ecoAccount as string, assetId, amount, additionals);
      message.info('提交成功');
      form.resetFields();
      // setProtocals({
      //   costPro: false,
      //   registerPro: false
      // });
    }
  }, [ecoAccount]);

  return (
    <div className={className}>
      <Form
        form={form}
        name='transfer-form'
        onFinish={onFinish}>
        <Panel
          title='碳中和'
        >
          <Row>
            <Form.Item
              label=' '
              name='assetId'
              rules={[{
                validator: requiredValidator
              }]}
              validateTrigger={['onSubmit']}
            >
              <FieldDecorator
                required
              >
                <Dropdown
                  defaultValue={''}
                  label={<div>选择资产</div>}
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  options={assetsList}
                  placeholder='请选择'
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
                  label={<div>碳中和数量</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder='碳中和数量'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='name'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>抵消人名称</div>}
                  // labelExtra={<div>克</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder='抵消人名称'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='type'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Dropdown
                  defaultValue={'1'}
                  label={<div>碳中和类型</div>}
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  options={NeoTypes}
                  placeholder='请选择'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='country'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>所在国家</div>}
                  // labelExtra={<div>克</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder='请输入您签发的数量'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='reason'
              rules={[{
                // validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <TextArea
                  isFull={false}
                  label={<div>抵消原因</div>}
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
          {/* <Row>
            <Form.Item
              label=' '
            >
              <FieldDecorator
                required
              >
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>手续费用</div>}
                  maxLength={500}
                  value='10000'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row> */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <Button htmlType='submit'>碳中和</Button>
          </div>
        </Panel>
      </Form>
    </div>
  );
}

export default RegisterCoins;
