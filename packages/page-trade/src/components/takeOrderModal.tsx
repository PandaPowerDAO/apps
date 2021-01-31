// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';
import { Modal, Input, Button, Dropdown } from '@polkadot/react-components';
import { Form } from 'antd';
import { useApi } from '@polkadot/react-hooks';

import { takeOrder } from '@eco/eco-utils/service';
import { requiredValidator, reformatAssetName, resolveAmountNumber } from '@eco/eco-utils/utils';
import { ModalProps } from '@polkadot/react-components/Modal/types';
import styled from 'styled-components';
import { OrderDetailType, OrderItem } from '../types';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import FieldDecorator from '@eco/eco-components/FormComponents';
import Decimal from 'decimal.js';
import { useTranslation } from '@eco/eco-utils/translate';

interface Props extends ModalProps {
  onClose: () => void,
  orderDetail: OrderDetailType,
}

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
  .labelExtra{
    right: 6.75rem!important;
  }
}
`;

function CreateModal (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation('page-eco-trade');

  const unitOptions = [{
    text: t('克'),
    value: 0
  }, {
    text: t('千克'),
    value: 3
  }, {
    text: t('吨'),
    value: 6
  }];
  const {
    onClose,
    open,
    orderDetail
  } = props;
  const [unit, updateUnit] = useState<number>(unitOptions[0].value);
  const [form] = Form.useForm();
  const { api } = useApi();
  const [ecoAccount] = useECOAccount();

  // const [assetsList, updateAssetsList] = useState<Record<string, any>[]>([]);

  // const Sides = [{
  //   value: '0',
  //   text: '卖'
  // }, {
  //   value: '1',
  //   text: '买'
  // }];

  // const projectValidator = async (rule: any, value: any): Promise<void> => {
  //   console.log('projectValidator');

  //   if (!value || value === '_empty_') {
  //     throw new Error('required');
  //   }

  //   await Promise.resolve(undefined);
  // };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const confirmMakeOrder = useCallback((orderItem: OrderItem) => {
    async function _takeOrder () {
      try {
        const formValues = await form.validateFields();
        const _amount = new Decimal(formValues.amount).mul(new Decimal(10).pow(unit)).toString();

        await takeOrder(api, ecoAccount, orderItem.orderId, _amount);
        onClose();
        // message.info('发送成功');
      } catch (e) {
        console.log(e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        // message.error(e.msg as string || e.message as string || '发送失败');
      }
    }

    _takeOrder();
  }, [unit]);

  const handleUnitChange = useCallback((_unit) => {
    updateUnit(_unit);
  }, []);

  const amountValidator = async (rule: any, value: string): Promise<void> => {
    const _realValue = new Decimal(value || 0).mul(new Decimal(10).pow(unit || 0)).toString();

    if (!(new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${unit}})?$`).test(value))) {
      throw new Error(unit > 0 ? t('最多{{unit}}小数', { replace: { unit } }) : t('请输入整数'));
    }

    if (!orderDetail || !orderDetail.left_amount || +_realValue > +orderDetail.left_amount) {
      throw new Error(t('订单剩余数量不足，请刷新'));
    }

    if (!(+_realValue > 0)) {
      throw new Error(t('必须大于0'));
    }

    return Promise.resolve(undefined);
  };

  return (
    <Modal
      onClose={handleClose}
      open={open}
    >
      <Modal.Header>{t('下单')}</Modal.Header>
      <Modal.Content>
        <FormWrapper>
          <Form
            form={form}
            name='take-order-form'
          >
            <Form.Item
              label={t('资产')}
            >
              <FieldDecorator>
                <Input
                  isDisabled
                  value={reformatAssetName(String((orderDetail || {}).assetSymbol))}
                />
              </FieldDecorator>
            </Form.Item>
            {/* <Form.Item>
              <span>
                {orderDetail && orderDetail.direction == 1 ? '买':'卖'}
              </span>
            </Form.Item> */}
            <Form.Item
              label={t('数量')}
              name='amount'
              rules={[{
                validator: requiredValidator
              }, {
                validator: amountValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t('数量')}</div>}
                  labelExtra={<div>{t('剩余数量')}:{resolveAmountNumber(((orderDetail || { left_amount: 0 })).left_amount as number || 0)}</div>}
                  maxLength={500}
                  // onChange={(name: string) => setFieldsValue({ name })}
                  placeholder={t('请输入数量')}
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
          label={t('交易')}
          onClick={() => confirmMakeOrder(orderDetail as unknown as OrderItem)}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default CreateModal;
