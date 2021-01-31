// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Form, Button, message } from 'antd';
import { useLocation } from 'react-router-dom';

import { useApi } from '@polkadot/react-hooks';
import { Input, Checkbox, Dropdown } from '@polkadot/react-components';
import Panel from '@eco/eco-components/Panel';
// import Button from '@eco/eco-components/Button';
import TextArea from '@eco/eco-components/TextArea';
import FieldDecorator from '@eco/eco-components/FormComponents';
import Row from '@eco/eco-components/Row';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import Header from '../components/header';
import { AnyObj } from '@eco/eco-utils/types';
import { resolveAmountNumber, parseQuery,
  requiredValidator,
  // urlValidator,
  // dateValidator,
  numberValidator,
  notAllprotocalChecked,
  fromHex,
  beautifulNumber,
  unitToEco,
  ecoToUnit } from '@eco/eco-utils/utils';

import { submitBurn, queryAsset, queryCarbonBalance } from '@eco/eco-utils/service';
import { useTranslation } from '@eco/eco-utils/translate';

import BannerImgSource from './burningBanner.png';
interface Props {
  className?: string,
}

// interface DataItem {
//   [key: string]: string | number | undefined | null
// }

interface FormProps {
  [key: string]: string
}

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

const Banner = styled.div`
  background: white;
  margin-bottom: 12px;
  padding: 0.75rem 1.5rem;
`;

function PageBurning ({ className }: Props): React.ReactElement<Props> {
  const [protocals, setProtocals] = useState<ProtocalProps>({
    costPro: false,
    // registerPro: false,
    agreed3: false,
    agreed2: false
  });
  const { t } = useTranslation('page-eco-assets');

  // const [isReady, setReady] = useState<boolean>(false);

  const [ecoAccount] = useECOAccount();

  const [assetsInfo, updateAssetsInfo] = useState<AnyObj>({});

  const [form] = Form.useForm();
  const { api } = useApi();
  const location = useLocation();

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
  }, []);

  const [unit, updateUnit] = useState<number>(SIOptions[0].value);

  const handleUnitChange = useCallback((_unit) => {
    updateUnit(_unit);
  }, []);

  const _query = parseQuery(location.search || '') || {};

  const assetId = _query.asset || '';
  const assetName = _query.assetName || '';

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);

  const queryCarbonAsset = useCallback((address) => {
    async function init () {
      const {
        // assetId as asset_id,
        balance
      } = await queryCarbonBalance(api, assetId, address);
      const assetDetail = await queryAsset(api, assetId);

      updateAssetsInfo({
        ...(assetDetail.asset || {}),
        ...(assetDetail.additionals || {}),
        balance: balance as string as unknown as number
      });
    }

    init();
  }, [ecoAccount]);

  useEffect(() => {
    if (ecoAccount) {
      queryCarbonAsset(ecoAccount);
    }
  }, [ecoAccount]);

  /**
   * 申请销毁资产
   */

  const onFinish = (values: FormProps) => {
    if (notAllprotocalChecked(protocals)) {
      message.error(t<string>('请先同意协议'));

      return;
    }

    async function submit () {
      // form.proponent
      const { amount, ...additional } = values;
      const result = await submitBurn(api, ecoAccount, assetId, ecoToUnit(amount, 6 + unit).toString(), additional);

      // message.info('申请提交成功');
      form.resetFields();
      setProtocals({
        costPro: false,
        // registerPro: false,
        agreed2: false,
        agreed3: false
      });

      console.log('result ----', result);
    }

    submit();
  };

  const amountValidtor = async (rule, value) => {
    if (assetsInfo.balance < value * 10 ^ 6) {
      throw new Error(t<string>('最大可销毁{{amount}}', { replace: { amount: resolveAmountNumber(assetsInfo.balance || 0) } }));
    }

    return Promise.resolve();
  };

  return (
    <Form
      form={form}
      name='burning-form'
      onFinish={onFinish}>
      <div className={className}>
        <Header title={t<string>('销毁碳汇资产')} />

        <Panel>

          <Banner>
            <img height='auto'
              src={BannerImgSource}
              width='100%' />
          </Banner>
        </Panel>
        <Panel title='说明：'>
          <p>{t<string>('如您要将ECO2 Ledger链上碳汇资产转回链下碳汇账户，须先将链上该笔碳汇资产先行销毁，避免产生重复计算的问题。')}</p>
          <p>{t<string>('1、在「钱包」中选择您要销毁的碳汇资产。')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('请输入收取这笔碳汇的链下碳汇账户。')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('如果是Gold Standard 标准，请汇至：Beijing Qianyuhui International Environmental Investment Co., Ltd（1069079）')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('其他标准暂时无法上链，我们将陆续开通。')}</p>
          <p>{t<string>('2、请输入收取这笔碳汇的链下碳汇账户。')}</p>
          <p>{t<string>('3、输入要销毁的数量。')}</p>
          <p>{t<string>('4、提交申请')}</p>
          <br />

          <p>{t<string>('备注')}</p>
          <p>{t<string>('1、资产审查委员会一般会在24小时内完成审核。')}</p>
          <p>{t<string>('2、若审核不通过，您钱包申请销毁的碳汇资产，将在24小时内退回至钱包。')}</p>
          <p>{t<string>('3、仅将这笔碳汇资产上链的用户有权销毁。')}</p>

        </Panel>
        <Panel>
          <Row>
            <Form.Item
              label=' '
            >
              <FieldDecorator>
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>{t<string>('当前资产')}</div>}
                  value={assetName}
                  withLabel={true}
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
                  label={<div>{t<string>('资产年限')}</div>}
                  value={fromHex(assetsInfo.vintage as string)}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>

            <Form.Item
              label=' '
            >
              <FieldDecorator
              >
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>{t<string>('当前账户余额')}</div>}
                  labelExtra={<div>{t<string>('吨')}</div>}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  value={beautifulNumber(unitToEco(assetsInfo.balance as string || '0', 6).toString())}
                  // value={beautifulNumber(assetsInfo.balance as string || '')}
                  withLabel={true}
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
                  label={<div>{t<string>('链上流通总量')}</div>}
                  labelExtra={<div>{t<string>('吨')}</div>}
                  maxLength={500}
                  value={beautifulNumber(unitToEco(assetsInfo.total_supply as string, 6).toString() || '')}
                  withLabel={true}
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
              }, {
                validator: amountValidtor
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div >{t<string>('申请销毁数量')}</div>}
                  labelExtra={<div style={{
                    paddingRight: '5em'
                  }}>{t<string>('吨')}</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder={t<string>('请输入')}
                  // value={form.name}
                  withLabel={true}
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
              name='accountOffline'
              rules={[{
                validator: requiredValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div >{t<string>('链下碳汇账户')}</div>}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  placeholder={t<string>('请输入该比碳汇的链下碳汇账户')}
                  // value={form.name}
                  withLabel={true}
                >
                </Input>
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
                  label={<div>{t<string>('描述')}</div>}
                  labelExtra={<div>{t<string>('请描述资产销毁原因，最多500字')}</div>}
                  maxLength={500}
                  // onChange={(description: string) => setFieldsValue({ description })}
                  rows={3}
                  // value={form.description}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
        </Panel>
        <Panel>
          <div>
            <Checkbox
              label={t<string>('请知晓，资产一旦销毁，不可撤回')}
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div>
          {/* <div>
            <Checkbox
              label={t<string>('销毁资产会优先扣除您资产可发行但未发行的额度，该部分不足的，将扣除您钱包账户的余额')}
              onChange={(registerPro: boolean) => setProtocalValue({ registerPro })}
              value={protocals.registerPro}
            />
          </div> */}
          <div>
            <Checkbox
              label={t<string>('销毁碳汇资产需要等待资产审查委员会审查通过后，您的碳汇数字资产将被扣除，同时会将您的真实碳汇资产原路转回到您的碳汇资产账户中')}
              onChange={(agreed2: boolean) => setProtocalValue({ agreed2 })}
              value={protocals.agreed2}
            />

          </div>
          <div>
            <Checkbox
              label={t<string>('销毁碳汇资产将消耗 100 ECO2 及 10,000 ECC')}
              onChange={(agreed3: boolean) => setProtocalValue({ agreed3 })}
              value={protocals.agreed3}
            />
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <Button htmlType='submit'>{t<string>('立即销毁')}</Button>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default PageBurning;
