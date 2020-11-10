// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Form } from 'antd';

import { Input, Dropdown } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import Panel from '@eco/eco-components/Panel';
import TextArea from '@eco/eco-components/TextArea';
import FieldDecorator from '@eco/eco-components/FormComponents';
import SubmitBtn from '@eco/eco-components/SubmitBtn';
import Row from '@eco/eco-components/Row';
import { useLocation } from 'react-router-dom';
import { queryAsset, neutralize, queryPotentialBalance } from '@eco/eco-utils/service';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { requiredValidator,
  numberValidator, fromHex, parseQuery, Countries } from '@eco/eco-utils/utils';

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

interface QueryDetailFn {
  (asset: Asset): Promise<void> | void
}

interface Country {
  text: string,
  value: string,
  cn: string,
  en: string,
}

const CountriesOptions: Country[] = Countries.map((country) => {
  return {
    ...country,
    value: country.text
  };
});

function PageNeutralization ({ className }: Props): React.ReactElement<Props> {
  const [assetsList, updateAssetsList] = useState<Asset[]>([]);
  const tempAssetListRef = useRef<Asset[]>([]);

  const location = useLocation();
  const urlAssetId = parseQuery(location.search || '').asset || '';
  const [form] = Form.useForm();
  const { api } = useApi();
  const [ecoAccount] = useECOAccount();

  const queryAssetInfo = useCallback((asset: Asset) => {
    async function _query () {
      const result = await queryAsset(api, asset.assetId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const _item = {
        ...result.asset,
        ...result.additionals,
        ...asset
      };

      console.log('result', _item);

      // tempAssetListRef.current = [
      //   ...tempAssetListRef.current,
      //   {
      //     ..._item,
      //     text: fromHex((_item as Asset).symbol as string),
      //     value: asset.assetId,
      //     assetId: asset.assetId
      //   }];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (_item.status !== 1) {
        return;
      }

      tempAssetListRef.current.push({
        ..._item,
        text: fromHex((_item as Asset).symbol as string),
        value: asset.assetId,
        assetId: asset.assetId
      });
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

      recursionQueryDetail((result as unknown as Asset[])
        .filter((asset: Asset) => asset.type === 'carbon'), queryAssetInfo);

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
      const _curItem = (arr || []).slice(0, 1)[0];

      if (!_curItem) {
        updateAssetsList(() => {
          return tempAssetListRef.current;
        });

        // tempAssetListRef.current = [];

        return;
      }

      await queryFn(_curItem);

      if (arr.length > 0) {
        recursionQueryDetail(arr.slice(1), queryFn);
      } else {
        console.log('all is done');
      }
    }

    _run();
  }, []);

  useEffect(() => {
    if (ecoAccount) {
      getAssetsList(ecoAccount);
    }
  }, [ecoAccount]);

  useEffect(() => {
    if (assetsList && assetsList.length) {
      if (assetsList.some((v) => {
        return v.assetId === urlAssetId;
      }) && urlAssetId !== 'eco2') {
        form.setFieldsValue({
          assetId: urlAssetId
        });
      }
    }
  }, [assetsList]);

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
      await neutralize(api, ecoAccount, assetId, amount, additionals);
      // message.info('提交成功');
      form.resetFields();
    }
  }, [ecoAccount]);

  const handleSelectAsset = useCallback((value) => {
    if (value) {
      form.validateFields(['assetId']);
    }
  }, []);

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
                onChange={handleSelectAsset}
                required
              >
                <Dropdown
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
                  labelExtra={<div>可中和数量{}</div>}
                  maxLength={500}
                  placeholder='碳中和数量'
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
                  label={<div>抵消受益人名称</div>}
                  maxLength={500}
                  placeholder='请输入抵消受益人名称'
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
            >
              <FieldDecorator>
                <Dropdown
                  defaultValue={''}
                  label={<div>所在国家</div>}
                  onSearch={(options: Country[], query: string): Country[] => {
                    return options.filter((v: Country): boolean => v.text.indexOf(query) > -1);
                  } }
                  options={CountriesOptions}
                  placeholder='请选择所在国家'
                  searchInput={{
                    autoFocus: false
                  }}
                  withLabel
                />
                {/* <Input
                  isFull={false}
                  label={<div>所在国家</div>}
                  maxLength={500}
                  placeholder='请输入所在国家'
                  withLabel
                /> */}
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
                  rows={3}
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
            <SubmitBtn htmlType='submit'>碳中和</SubmitBtn>
          </div>
        </Panel>
      </Form>
    </div>
  );
}

export default PageNeutralization;
