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
  numberValidator,
  fromHex,
  parseQuery,
  Countries,
  reformatAssetName, unitToEco, beautifulNumber, resolveAmountNumber } from '@eco/eco-utils/utils';
import { queryCarbonBalance } from '@polkadot/app-eco/service';
import { useTranslation } from '@eco/eco-utils/translate';
import Decimal from 'decimal.js';
import BN from 'bn.js';

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

interface AssetOpt {
  [key:string]: string | number,
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
  const [curAsset, updateCurAsset] = useState<Asset | null>(null);
  const tempAssetListRef = useRef<Asset[]>([]);

  const location = useLocation();
  const urlAssetId = parseQuery(location.search || '').asset || '';
  const [form] = Form.useForm();
  const { api } = useApi();
  const [ecoAccount] = useECOAccount();
  const { t } = useTranslation('page-eco-neu');

  const SIOptions = useMemo(() => {
    return [{
      text: t<string>('克'),
      value: 0
    }, {
      text: t<string>('千克'),
      value: 3
    }, {
      text: t<string>('吨'),
      value: 6
    }];
  }, [curAsset]);

  const [unit, updateUnit] = useState<number>(SIOptions[0].value);

  const handleUnitChange = useCallback((_unit) => {
    updateUnit(_unit);
  }, []);

  const queryAssetInfo = useCallback((asset: Asset) => {
    async function _query () {
      const result = await queryAsset(api, asset?.assetId);

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
        // ..._item,
        text: reformatAssetName(fromHex((_item as Asset).symbol as string)),
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
      text: t<string>('商业活动'),
      value: '1'
    }, {
      text: t<string>('日常生活'),
      value: '2'
    }, {
      text: t<string>('交通出行'),
      value: '3'
    }, {
      text: t<string>('生产制造'),
      value: '4'
    }, {
      text: t<string>('企业组织'),
      value: '5'
    }, {
      text: t<string>('其他'),
      value: '6'
    }];
  }, []);

  const onFinish = useCallback((values: FormProps) => {
    const { assetId, amount, ...additionals } = values;

    // const _amount = new Decimal(amount).mul(new Decimal(10).pow(unit));
    // new BN(10).pow(new BN(6 - curSi))
    // const _amount = new Decimal(amount).div(new BN(10).pow(new BN(6 - unit))).toString();
    const _amount = new Decimal(amount).div(new Decimal(10).pow(6 - unit)).toString();

    _neutralize();

    async function _neutralize () {
      await neutralize(api, ecoAccount, assetId, _amount, additionals);
      // message.info('提交成功');
      form.resetFields();
    }
  }, [ecoAccount, unit]);

  const queryBalance = useCallback((_asset: Asset) => {
    init();

    async function init () {
      const { balance } = await queryCarbonBalance(api, _asset.assetId, ecoAccount);

      console.log('===========', balance);

      updateCurAsset(() => {
        return {
          ...(_asset || {}),
          balance: (balance as string || '0').replace(/,/g, '')
        };
      });
    }
  }, [api, ecoAccount, curAsset]);

  const handleSelectAsset = useCallback((value) => {
    if (value) {
      form.validateFields(['assetId']);
      const _cur = assetsList.filter((v: Asset): boolean => {
        return v.assetId === value;
      });

      queryBalance(_cur[0]);

      // updateCurAsset(_cur[0]);
    }
  }, [assetsList, queryBalance]);

  const amountValidator = async (rule: any, value: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const formValues = form.getFieldsValue();

    const _value = new Decimal(value || 0);
    const _baseValue = _value.mul(new Decimal(10).pow(unit)).toString();

    if (!(new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${unit}})?$`).test(value))) {
      throw new Error(unit > 0 ? t<string>('最多{{unit}}小数', { replace: { unit } }) : t<string>('请输入整数'));
    }

    const _availableBalance = curAsset?.balance || 0;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!value || new BN(_baseValue).gt(new BN(_availableBalance))) {
      throw new Error(t<string>('余额不足，当前可用资产{{amount}}', { replace: { amount: resolveAmountNumber(_availableBalance) } }));
    }

    await Promise.resolve();
  };

  return (
    <div className={className}>
      <Form
        form={form}
        name='transfer-form'
        onFinish={onFinish}>
        <Panel
          title={t<string>('碳中和')}
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
                  label={<div>{t<string>('选择资产')}</div>}
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  options={assetsList}
                  // options={assetOptions}
                  placeholder={t<string>('请选择')}
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
                validator: amountValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('碳中和数量')}</div>}
                  labelExtra={<div style={{
                    paddingRight: '5em'
                  }}>{t<string>('当前资产余额')}{resolveAmountNumber(curAsset?.balance || 0)}</div>}
                  maxLength={500}
                  placeholder={t<string>('碳中和数量')}
                  withLabel
                >
                  <Dropdown
                    defaultValue={unit}
                    dropdownClassName='ui--SiDropdown'
                    isButton
                    onChange={handleUnitChange}
                    options={SIOptions}
                  />
                </Input>
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
                  label={<div>{t<string>('抵消受益人名称')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入抵消受益人名称')}
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
                  label={<div>{t<string>('碳中和类型')}</div>}
                  options={NeoTypes}
                  placeholder={t<string>('请选择')}
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
                  label={<div>{t<string>('所在国家')}</div>}
                  onSearch={(options: Country[], query: string): Country[] => {
                    return options.filter((v: Country): boolean => v.text.indexOf(query) > -1);
                  } }
                  options={CountriesOptions}
                  placeholder={t<string>('请选择所在国家')}
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
                  label={<div>{t<string>('抵消原因')}</div>}
                  labelExtra={<div>{t<string>('最多500字')}</div>}
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
            <SubmitBtn htmlType='submit'>{t<string>('碳中和')}</SubmitBtn>
          </div>
        </Panel>
      </Form>
    </div>
  );
}

export default PageNeutralization;
