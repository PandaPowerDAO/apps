// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { Input, Dropdown } from '@polkadot/react-components';
import Panel from '@eco/eco-components/Panel';
// import Button from '@eco/eco-components/Button';
import TextArea from '@eco/eco-components/TextArea';
// import Form from '@eco/eco-components/Form';
import { Form, message } from 'antd';
import FieldDecorator from '@eco/eco-components/FormComponents';
import { queryAsset, transferCarbonAsset, queryPotentialBalance, transfer, queryBalance, queryCarbonBalance } from '@eco/eco-utils/service';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { useApi } from '@polkadot/react-hooks';
import { beautifulNumber, parseQuery, fromHex } from '@eco/eco-utils/utils';
import SubmitBtn from '@eco/eco-components/SubmitBtn';
import { useLocation } from 'react-router-dom';
import { getValuesFromString } from '@polkadot/react-components/InputNumber';
// import { BitLengthOption } from '@polkadot/react-components/constants';
// import { Keyring } from '@polkadot/api';
import BN from 'bn.js';

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
interface BalanceType {
  [key: string] : string | number,
}

interface Asset {
  assetId: string,
  // balance?: BalanceType,
  [key:string]: string | number | BalanceType
}

interface QueryDetailCallback {
  (a: Asset, b: Asset): void
}

interface QueryDetailFn {
  (asset: Asset, callback: QueryDetailCallback): Promise<void> | void
}

let timer: any = null;

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

function PageTransfer ({ className }: Props): React.ReactElement<Props> {
  const [form] = Form.useForm();

  const [curAsset, updateCurAsset] = useState<Asset | null>(null);

  const [assetsList, updateAssetsList] = useState<Asset[]>([]);
  const tempAssetListRef = useRef<Asset[]>([]);

  const { api } = useApi();
  const [ecoAccount] = useECOAccount();
  const location = useLocation();
  const initAssetId: string = parseQuery(location.search || '').asset || '';

  const hanleUpdateTempList = useCallback((_item:Asset, item:Asset) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tempAssetListRef.current = [
      ...tempAssetListRef.current,
      {
        ..._item,
        text: fromHex(_item.symbol as string),
        value: item.assetId,
        assetId: item.assetId
      }
    ];
  }, []);

  const queryAssetInfo = useCallback((asset: Asset, callback: QueryDetailCallback) => {
    async function _query () {
      const result = await queryAsset(api, asset.assetId);
      let balance;

      if (asset.assetId === 'eco2') {
        balance = await queryBalance(api, ecoAccount as string);
        balance.balance = new BN(balance.balance).mul(new BN(10).pow(new BN(-8))).toString();
      } else {
        balance = await queryCarbonBalance(api, asset.assetId, ecoAccount as string);
      }

      console.log('result', tempAssetListRef.current);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const _item:Asset = {
        ...(result.asset || {}),
        ...(result.additionals || {}),
        balance
      };

      if (asset.assetId === 'eco2') {
        _item.symbol = 'ECO2';
      }

      callback(_item, asset);

      // updateCurAsset({
      //   ...result.asset,
      //   ...result.additionals
      // });
    }

    _query();
  }, []);

  const getAssetsList = useCallback((account) => {
    async function _query () {
      const result = await queryPotentialBalance({
        owner: (account || '') as string,
        offset: 0,
        limit: 100
      });
      const _alist: Asset = {
        assetId: 'eco2',
        text: 'ECO2',
        value: 'eco2',
        symbol: 'ECO2'
      };

      recursionQueryDetail([_alist, ...result as unknown as Asset[]], queryAssetInfo);

      // updateAssetsList(() => {
      //   return (result.docs as Asset[]).map((doc: Asset): Asset => {
      //     return {
      //       ...doc,
      //       text: `${doc.symbol}(${doc.vintage})`,
      //       value: doc.assetId
      //     };
      //   });
      // });
    }

    _query();
  }, []);

  // 递归查询资产详情
  const recursionQueryDetail = useCallback((arr: Asset[], queryFn: QueryDetailFn) => {
    async function _run () {
      if (!arr) {
        updateAssetsList((_list) => {
          return tempAssetListRef.current.slice(0);
        });

        return;
      }

      const _curItem = arr.slice(0, 1)[0];

      if (!_curItem) {
        console.log('tempAssetListRef.current', tempAssetListRef.current);
        setTimeout(() => {
          updateAssetsList(() => {
            return tempAssetListRef.current.slice(0);
          });
        }, 1000);

        return;
      }

      await queryFn(_curItem, hanleUpdateTempList);

      if (arr.length > 0) {
        recursionQueryDetail(arr.slice(1), queryFn);
      } else {
        console.log('all is done');
      }
    }

    _run();
  }, []);

  useEffect(() => {
    if (initAssetId && assetsList.some((_asset: Asset) => _asset.assetId === initAssetId)) {
      setTimeout(() => {
        console.log('set init');
        form.setFieldsValue({
          assetId: initAssetId
        });
      }, 100);
    }
  }, [assetsList]);

  useEffect(() => {
    if (ecoAccount) {
      getAssetsList(ecoAccount);
    }
  }, [ecoAccount]);

  useEffect(() => {
    if (!curAsset || !curAsset.assetId) {
      console.log('do nothing');
    } else {
      timer = setInterval(() => {
        // tempAssetListRef.current = [];
        // getAssetsList(ecoAccount);
        queryAssetInfo(curAsset, (newAsset: Asset) => {
          updateCurAsset(newAsset);
        });
      }, 10000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, [curAsset]);

  const handleSubmit = useCallback((values: FormProps) => {
    // form.validateFields({ force: true }, (err: Error, values: any): void => {
    //   console.log(err, values);
    // });

    async function _transfer () {
      if (values.assetId === 'eco2') {
        const _amount = getValuesFromString(values.amount as string, {
          power: 0,
          text: 'ECO2',
          value: '-'
        }, 8, true);

        await transfer(api, ecoAccount as string, values.to as string, (_amount[1] || 0).toString());
      } else {
        await transferCarbonAsset(
          api,
          ecoAccount as string,
          values.assetId as string,
          values.to as string,
          values.amount as string
        );
      }

      message.info('操作成功');
      form.resetFields();
      updateCurAsset(null);
      tempAssetListRef.current = [];
      setTimeout(() => {
        getAssetsList(ecoAccount);
      }, 1000);

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

  const selectAsset = useCallback((value) => {
    const _selected = tempAssetListRef.current.filter((asset: Asset): boolean => asset.assetId === value)[0];

    // updateCurAsset(_selected || null);
    // queryAssetInfo(_selected.assetId);
    if (_selected) {
      updateCurAsset(_selected);
      setTimeout(() => {
        form.validateFields(['assetId']);
      }, []);
    }

    console.log('_selected', _selected);
  }, []);

  // const selectedAssets = useMemo(() => {
  //   const asset = form.
  // }, [form]);

  const accountValidator = async (rule: any, value: any): Promise<void> => {
    return Promise.resolve(undefined);
  };

  return (
    <div className={className}>
      {/* <Panel title='您好，A女士'>
        <p>1、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>2、阿斯顿发送到发送到发的是发送到发送到发送到</p>
        <p>3、阿斯顿发送到发送到发的是发送到发送到发送到</p>
      </Panel> */}
      <Panel
        title='转账'
      >
        <Form
          form={form}
          name='transfer-form'
          onFinish={onFinish}>
          <Row>
            <Form.Item
              // initialValue={initAssetId || ''}
              label=' '
              name='assetId'
              rules={[{
                validator: requiredValidator
              }]}
              validateTrigger={['onSubmit']}>
              <FieldDecorator
                onChange={selectAsset}
                required

              >
                <Dropdown
                  // defaultValue={initAssetId || ''}
                  // defaultValue='eco'
                  label={<div>选择资产</div>}

                  options={assetsList}
                  // value='eco'
                  placeholder='请选择'
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
              }, {
                validator: accountValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>收款账户</div>}
                  maxLength={500}
                  placeholder='请输入您要转账的账户昵称或地址'
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
                  // isSi
                  label={<div>转账金额</div>}
                  // labelExtra={<div>克</div>}
                  // onChange={(amount: string) => setFieldsValue({ description })}
                  placeholder='请输入您要转账的金额'
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
              label={<div>总量</div>}
              labelExtra={<div>{curAsset ? fromHex(curAsset.symbol as string) : '' }</div>}
              maxLength={500}
              value={beautifulNumber((curAsset ? (curAsset.balance as BalanceType).balance : 0) || 0)}
              withLabel={true}
            />
          </Row>
          <Row>
            <Input
              isDisabled
              isFull={false}
              label={<div>手续费用</div>}
              labelExtra={<div>ECO2</div>}
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

export default PageTransfer;
