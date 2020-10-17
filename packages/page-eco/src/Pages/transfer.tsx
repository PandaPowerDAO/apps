// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';

import { Input, Dropdown } from '@polkadot/react-components';
import Panel from '../Components/Panel';
// import Button from '../Components/Button';
import TextArea from '../Components/TextArea';
// import Form from '../Components/Form';
import { Form, message } from 'antd';
import FieldDecorator from '../Components/FormComponents';
import { queryAssetsList, transferCarbonAsset } from '../service';
import { useECOAccount } from '../Components/Account/accountContext';
import { useApi } from '@polkadot/react-hooks';
import { beautifulNumber } from '../Utils';
import SubmitBtn from '../Components/SubmitBtn';

interface Props {
  className?: string,
}

// interface DataItem {
//   [key: string]: string | number | undefined | null
// }

interface FormProps {
  [key: string]: string | null | undefined
}

// interface ProtocalProps {
//   [key: string]: undefined | null | boolean
// }

interface Asset {
  assetId: string,
  [key:string]: string | number
}

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  label{
    left: 1rem!important;
  }

  & > div{
    width: 45%;
    padding: 0!important;
  }
  & > div + div{
    margin-left: 5%;
  }
  .dropdown {
    // border-left: 1px solid rgba(34,36,38,.15)!important;
  }
  .ui--Labelled{
    padding-left: 0!important;
  }
`;

function RegisterCoins ({ className }: Props): React.ReactElement<Props> {
  const [form] = Form.useForm();

  // const [formValues, setForm] = useState<FormProps>({
  //   name: '',
  //   description: ''
  // });

  const [assetsList, updateAssetsList] = useState<Asset[]>([]);

  // const [protocals, setProtocals] = useState<ProtocalProps>({
  //   costPro: false,
  //   registerPro: false
  // });

  // const setFieldsValue = useCallback((field: FormProps): void => {
  //   setForm({
  //     ...formValues,
  //     ...field
  //   });
  // }, [formValues]);

  // const setProtocalValue = useCallback((protocal): void => {
  //   setProtocals({
  //     ...protocals,
  //     ...protocal
  //   });
  // }, [protocals]);

  const { api } = useApi();
  const [ecoAccount] = useECOAccount();

  // const AssetsOpts = useMemo(() => {
  //   return [{
  //     text: '碳汇资产',
  //     value: 'eco'
  //   }];
  // }, []);

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

  const handleSubmit = useCallback((values: FormProps) => {
    // form.validateFields({ force: true }, (err: Error, values: any): void => {
    //   console.log(err, values);
    // });
    async function _transfer () {
      await transferCarbonAsset(
        api,
        ecoAccount as string,
        values.assetId as string,
        values.to as string,
        values.amount as string
      );
      message.info('操作成功');
      form.resetFields();

      // setProtocals({
      //   costPro: false,
      //   registerPro: false
      // });
    }

    _transfer();
  }, [ecoAccount]);

  const onFinish = (values: any) => {
    console.log(values);
    handleSubmit(values);
  };

  /**
   * 必填校验
   */
  const requiredValidator = useCallback(async function _validator (rule: any, value: any): Promise<void> {
    if (!value) {
      throw new Error('required');
    }

    await Promise.resolve(undefined);
  }, []);

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
        <Form
          form={form}
          name='transfer-form'
          onFinish={onFinish}>
          <Row>
            <Form.Item
              label=' '
              name='assetId'
              rules={[{
                validator: requiredValidator
              }]}
              validateTrigger={['onSubmit']}>
              <FieldDecorator
                required
              >
                <Dropdown
                // initialValues='eco'
                  // defaultValue='eco'
                  label={<div>选择资产</div>}
                  options={assetsList}
                  placeholder='请选择'
                  // value='eco'
                  withLabel
                />
              </FieldDecorator>

            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='to'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>收款账户</div>}
                  maxLength={500}
                  placeholder='仅支持输入最多6位大写字母'
                  // value={formValues.name}
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
              }]}>
              <FieldDecorator required>
                <Input
                  isFull={false}
                  label={<div>转账金额</div>}
                  // labelExtra={<div>克</div>}
                  maxLength={500}
                  // onChange={(amount: string) => setFieldsValue({ description })}
                  placeholder='请输入您签发的数量'
                  // value={formValues.name}
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
              <FieldDecorator>
                <TextArea
                  isFull={false}
                  label={<div>描述</div>}
                  labelExtra={<div>最多500字</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  rows={3}
                  // value={formValues.description}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Input
              isDisabled
              isFull={false}
              label={<div>ECC总量</div>}
              maxLength={500}
              value={beautifulNumber(1000000)}
              withLabel={true}
            />
          </Row>
          <Row>
            <Input
              isDisabled
              isFull={false}
              label={<div>手续费用</div>}
              labelExtra={<div>ECC</div>}
              maxLength={500}
              value={beautifulNumber(10000)}
              withLabel
            />
          </Row>
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <SubmitBtn htmlType='submit'
              type='primary'>转账</SubmitBtn>
          </div>
        </Form>
      </Panel>
    </div>
  );
}

export default RegisterCoins;
