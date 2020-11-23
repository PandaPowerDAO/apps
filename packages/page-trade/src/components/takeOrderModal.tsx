// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';
import { Modal, Input, Button } from '@polkadot/react-components';
import { Form } from 'antd';
import { useApi } from '@polkadot/react-hooks';

import { takeOrder } from '@eco/eco-utils/service';
import { requiredValidator, reformatAssetName } from '@eco/eco-utils/utils';
import { ModalProps } from '@polkadot/react-components/Modal/types';
import styled from 'styled-components';
import { OrderDetailType, OrderItem } from '../types';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import FieldDecorator from '@eco/eco-components/FormComponents';

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
}
`;

function CreateModal (props: Props): React.ReactElement<Props> {
  const {
    onClose,
    open,
    orderDetail
  } = props;
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

  const confirmMakeOrder = useCallback((orderItem: OrderItem) => {
    async function _takeOrder () {
      try {
        const formValues = await form.validateFields();

        await takeOrder(api, ecoAccount, orderItem.orderId, formValues.amount);
        onClose();
        // message.info('发送成功');
      } catch (e) {
        console.log(e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        // message.error(e.msg as string || e.message as string || '发送失败');
      }
    }

    _takeOrder();
  }, []);

  const amountValidator = async (rule: any, value: string): Promise<void> => {
    if (!orderDetail || !orderDetail.left_amount || +value > +orderDetail.left_amount) {
      throw new Error('订单剩余数量不足，请刷新');
    }

    return Promise.resolve(undefined);
  };

  return (
    <Modal
      onClose={onClose}
      open={open}
    >
      <Modal.Header>创建订单</Modal.Header>
      <Modal.Content>
        <FormWrapper>
          <Form
            form={form}
            name='take-order-form'
          >
            <Form.Item
              label='资产'
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
              label='数量'
              name='amount'
              rules={[{
                validator: requiredValidator
              }, {
                validator: amountValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>数量</div>}
                  labelExtra={<div>剩余数量:{((orderDetail || { left_amount: 0 })).left_amount as number}</div>}
                  maxLength={500}
                  // onChange={(name: string) => setFieldsValue({ name })}
                  placeholder='请输入数量'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Form>
        </FormWrapper>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button
          icon='trash'
          label={'交易'}
          onClick={() => confirmMakeOrder(orderDetail as unknown as OrderItem)}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default CreateModal;
