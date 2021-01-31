// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal, Dropdown, Input, Button, InputNumberPre } from '@polkadot/react-components';
import { Form } from 'antd';
import { useApi } from '@polkadot/react-hooks';

import { queryAssetsList, makeOrder, queryPotentialBalance } from '@eco/eco-utils/service';
import { requiredValidator, ecoToUnit, reformatAssetName, unitToEco, beautifulNumber, resolveAmountNumber } from '@eco/eco-utils/utils';
import { ModalProps } from '@polkadot/react-components/Modal/types';
import styled from 'styled-components';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import FieldDecorator from '@eco/eco-components/FormComponents';
import { AssetItemType } from '../types';
import BN from 'bn.js';
import { queryCarbonBalance } from '@polkadot/app-eco/service';
import Decimal from 'decimal.js';
import { useTranslation } from '@eco/eco-utils/translate';
interface Props extends ModalProps {
  onClose: () => void,

}

// interface

const FormWrapper = styled.div`
.ant-form-item-label{
  display:none!important;
}
.ant-form-item-has-error{
  input,textarea{
    background-color: #fff6f6!important;
    border-color: #e0b4b4!important;
  }
}

.ui--Labelled {
  padding-left: 0!important
  label {
    padding-left: 1.45rem;
  }
}
`;

const unitOptions = [{
  text: '克',
  value: 0
}, {
  text: '千克',
  value: 3
}, {
  text: '吨',
  value: 6
}];

function CreateModal (props: Props): React.ReactElement<Props> {
  const {
    onClose,
    open
  } = props;
  const [form] = Form.useForm();
  const { api } = useApi();
  const [ecoAccount] = useECOAccount();
  const { t } = useTranslation('page-eco-trade');

  const [assets, updateAssets] = useState<AssetItemType[]>([]);
  const [unit, updateUnit] = useState<number>(unitOptions[0].value);
  const [assetBalance, updateAssetBalance] = useState<number | string>(0);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };
  // const [assetsList, updateAssetsList] = useState<Record<string, any>[]>([]);

  const Sides = [{
    value: '0',
    text: t<string>('卖')
  }, {
    value: '1',
    text: t<string>('买')
  }];

  const projectValidator = async (rule: any, value: any): Promise<void> => {
    console.log('projectValidator');

    if (!value || value === '_empty_') {
      throw new Error('required');
    }

    await Promise.resolve(undefined);
  };

  const confirmMakeOrder = useCallback(() => {
    async function _commit () {
      try {
        const formValues = await form.validateFields();

        console.log('trigger');

        const _price = ecoToUnit(formValues.price, 2).toString();

        const _amount = new Decimal(formValues.amount).mul(new Decimal(10).pow(unit));

        await makeOrder(
          api,
          ecoAccount,
          formValues.assetId,
          '',
          _price,
          new BN(_amount.toFixed(0)).toString(),
          // new BN(formValues.amount).mul(new BN(10).pow(new BN(unit || 0))).toString(),
          // formValues.amount,
          formValues.direction
        );
        onClose();
        form.resetFields();
        // message.info('订单创建成功');
      } catch (e) {
        console.log(e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        // message.info(e.msg || e.message || '创建失败');
      }
    }

    _commit();
  }, [unit]);

  const getAssets = useCallback((direction) => {
    async function _query () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // const direction = form.getFieldValue('assetId');
      const method = direction === 'buy' ? queryAssetsList : queryPotentialBalance;
      const result = await method({
        limit: 100,
        offset: 0,
        owner: direction === 'sell' ? ecoAccount : ''
      });
      const _result = direction === 'buy' ? result.docs : result;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      updateAssets(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        (_result as AssetItemType[]).map((doc: AssetItemType): AssetItemType => {
          return {
            ...doc,
            text: reformatAssetName(`${doc.symbol as string}${doc.vintage ? `.${doc.vintage as string}` : ''}`),
            value: doc.assetId
          };
        }).filter((v: AssetItemType) => (direction === 'buy' && v.approved === 1) || direction === 'sell'));

      console.log(result);
    }

    _query();
  }, [ecoAccount]);

  useEffect(() => {
    if (ecoAccount) {
      // console.log('ecoAccount', ecoAccount);
      getAssets('buy');
    }
  }, [ecoAccount, getAssets]);

  const priceValidator = async (rule: any, value: string): Promise<void> => {
    if (!/^(([1-9][0-9]*)|0)(\.?\d{0,2})$/.test(value)) {
      throw new Error(t<string>('请输入正确的数字，最大支持2位精度'));
    }

    await Promise.resolve();
  };

  const handleUnitChange = useCallback((_unit) => {
    updateUnit(_unit);
  }, []);

  const handleAssetsChange = useCallback((val) => {
    _queryBalance();

    async function _queryBalance () {
      const { balance } = await queryCarbonBalance(api, val, ecoAccount);

      updateAssetBalance((balance as string | '0').replace(/,/ig, ''));
    }
  }, [api, ecoAccount]);

  const amountValidator = async (rule: any, value: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const formValues = form.getFieldsValue();

    const _value = new Decimal(value || 0);
    const _baseValue = _value.mul(new Decimal(10).pow(unit)).toString();

    if (!(new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${unit}})?$`).test(value))) {
      throw new Error(unit > 0 ? t<string>('最多{{unit}}小数', { replace: { unit } }) : t<string>('请输入整数'));
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (formValues.direction === '0' && formValues.assetId) {
      if (!value || new BN(_baseValue).gt(new BN(assetBalance))) {
        throw new Error(t<string>('余额不足，当前可用资产{{amount}}', { replace: { amount: resolveAmountNumber(assetBalance || 0) } }));
      }
      // if (!value || new BN(value).gt(new BN(assetBalance))) {
      //   throw new Error(`余额不足，当前可用资产${resolveAmountNumber(assetBalance || 0)}`);
      // }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (formValues.direction === '1' && formValues.assetId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const _atotal = _value.mul(new Decimal(10).pow(unit)).mul(formValues.price).toString();

      if (!value || new BN(_atotal).gt(new BN(assetBalance))) {
        throw new Error(t<string>('余额不足，当前可用资产{{amount}}', { replace: { amount: resolveAmountNumber(assetBalance || 0) } }));
      }
    }

    await Promise.resolve();
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _formValues = form.getFieldsValue();

  const amountExtraLabel = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const __unit = unitOptions.filter((v) => v.value === unit)[0];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (_formValues.direction !== '0') {
      return null;
    }

    return <div style={{
      marginRight: '6rem'
    }}>
      {t<string>('当前持有')}:
      {
        // unitToEco(assetBalance as string, __unit.value).toString()
        resolveAmountNumber(assetBalance)
      }
    </div>;
  }, [unit, assetBalance, _formValues]);

  const handleAmountChange = (v) => {
    console.log('amountchange', v);
  };

  return (
    <Modal
      onClose={handleClose}
      open={open}
    >
      <Modal.Header>{t<string>('创建订单')}</Modal.Header>
      <Modal.Content>
        <FormWrapper>
          <Form
            form={form}
            name='maker-order-form'
          >
            <Form.Item
              initialValue='1'
              label={t<string>('方向')}
              name='direction'
            >
              <FieldDecorator
                onChange={(v) => {
                  if (v) {
                    getAssets(v === '1' ? 'buy' : 'sell');
                  }
                }}
              >
                <Dropdown
                  defaultValue={'1'}
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  label={<div>{t<string>('方向')}</div>}
                  options={Sides}
                  placeholder={t<string>('请选择')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label={t<string>('资产')}
              name='assetId'
              rules={[{
                validator: projectValidator
              }]}
              validateTrigger={['onSubmit']}>
              <FieldDecorator
                onChange={handleAssetsChange}
                required
              >
                <Dropdown
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  label={<div>{t<string>('资产')}</div>}
                  options={assets}
                  placeholder={t<string>('请选择')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label={t<string>('价格')}
              name='price'
              rules={[{
                validator: requiredValidator
              }, {
                validator: priceValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('价格')}</div>}
                  // labelExtra='吨'
                  labelExtra={t<string>('ECO2/吨')}
                  maxLength={500}
                  // onChange={(name: string) => setFieldsValue({ name })}
                  placeholder={t<string>('请输入价格')}
                  // value={form.name}
                  withLabel
                >

                </Input>
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label={t<string>('数量')}
              name='amount'
              rules={[{
                validator: requiredValidator
              }, {
                validator: amountValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                onChange={handleAmountChange}
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('数量')}</div>}
                  labelExtra={amountExtraLabel}
                  maxLength={500}
                  // onChange={(name: string) => setFieldsValue({ name })}
                  placeholder={t<string>('请输入数量')}
                  // value={form.name}
                  withLabel
                >
                  <Dropdown
                    defaultValue={unit}
                    dropdownClassName='ui--SiDropdown'
                    isButton
                    onChange={handleUnitChange}
                    options={unitOptions}
                  />
                </Input>
              </FieldDecorator>
            </Form.Item>
          </Form>
        </FormWrapper>
      </Modal.Content>
      <Modal.Actions onCancel={handleClose}>
        <Button
          icon='trash'
          label={t<string>('交易')}
          onClick={confirmMakeOrder}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default CreateModal;
