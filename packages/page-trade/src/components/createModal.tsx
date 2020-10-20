// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Dropdown, Input, Button } from '@polkadot/react-components';
import { Form } from 'antd';
import { useApi } from '@polkadot/react-hooks';

import { queryAssetsList, makeOrder } from '@eco/eco-utils/service';
import { requiredValidator } from '@eco/eco-utils/utils';
import { ModalProps } from '@polkadot/react-components/Modal/types';
import styled from 'styled-components';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import FieldDecorator from '@eco/eco-components/FormComponents';
import { AssetItemType } from '../types';

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

function CreateModal (props: Props): React.ReactElement<Props> {
  const {
    onClose,
    open
  } = props;
  const [form] = Form.useForm();
  const { api } = useApi();
  const [ecoAccount] = useECOAccount();

  const [assets, updateAssets] = useState<AssetItemType[]>([]);

  // const [assetsList, updateAssetsList] = useState<Record<string, any>[]>([]);

  const Sides = [{
    value: '0',
    text: '卖'
  }, {
    value: '1',
    text: '买'
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

        await makeOrder(api, ecoAccount as string, formValues.assetId, '', formValues.price, formValues.amount, formValues.direction);
        onClose();
      } catch (e) {
        console.log(e);
      }
    }

    _commit();
  }, []);

  const getAssets = useCallback(() => {
    async function _query () {
      const result = await queryAssetsList({
        limit: 100,
        offset: 0
      });

      updateAssets(result.docs.map((doc: AssetItemType): AssetItemType => {
        return {
          ...doc,
          text: `${doc.symbol as string}(${doc.vintage as string})`,
          value: doc.assetId
        };
      }));

      console.log(result);
    }

    _query();
  }, []);

  useEffect(() => {
    getAssets();
  }, []);

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
            name='maker-order-form'
          >
            <Form.Item
              initialValue='1'
              label='方向'
              name='direction'
            >
              <FieldDecorator
              >
                <Dropdown
                  defaultValue={'1'}
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  label={<div>方向</div>}
                  options={Sides}
                  placeholder='请选择'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              initialValue='_empty_'
              label='资产'
              name='projectId'
              rules={[{
                validator: projectValidator
              }]}
              validateTrigger={['onSubmit']}>
              <FieldDecorator
                required
              >
                <Dropdown
                  defaultValue={'_empty_'}
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  label={<div>资产</div>}
                  options={assets}
                  placeholder='请选择'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label='价格'
              name='price'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>价格</div>}
                  maxLength={500}
                  // onChange={(name: string) => setFieldsValue({ name })}
                  placeholder='请输入价格'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label='数量'
              name='amount'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>数量</div>}
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
          onClick={confirmMakeOrder}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default CreateModal;
