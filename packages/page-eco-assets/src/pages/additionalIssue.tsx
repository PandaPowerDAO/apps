// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useLocation, useHistory } from 'react-router-dom';
import { Form, Button, message } from 'antd';

import { Input,
  Checkbox,
  Dropdown,
  InputAddress } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import Panel from '@eco/eco-components/Panel';
// import Button from '@eco/eco-components/Button';
import TextArea from '@eco/eco-components/TextArea';
import FieldDecorator from '@eco/eco-components/FormComponents';
import Row from '@eco/eco-components/Row';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import Header from '../components/header';
import { parseQuery,
  requiredValidator,
  urlValidator,
  // dateValidator,
  notAllprotocalChecked, numberValidator, fromHex, unitToEco, ecoToUnit } from '@eco/eco-utils/utils';
import { queryAsset, submitIssue, queryProject } from '@eco/eco-utils/service';
import { useTranslation } from '@eco/eco-utils/translate';
import BannerImgSource from './addtionalBanner.png';
interface Props {
  className?: string,
}

interface FormProps {
  [key: string]: string
}

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

interface AnyObj {
  [key: string]: string | number | undefined
}

const Hidden = styled.div`
  width: 0;
  height: 0;
  opacity: 0;
`;

const Banner = styled.div`
  background: white;
  margin-bottom: 12px;
  padding: 0.75rem 1.5rem;
`;

function AdditionalIssue ({ className }: Props): React.ReactElement<Props> {
  const [form] = Form.useForm();
  const [ecoAccount] = useECOAccount();
  const history = useHistory();
  const { t } = useTranslation('page-eco-assets');

  const [assetsInfo, updateAssetsInfo] = useState<AnyObj>({});

  const [protocals, setProtocals] = useState<ProtocalProps>({
    costPro: false,
    registerPro: false,
    agreed2: false
  });

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

  const [unit, updateUnit] = useState<number>(SIOptions[2].value);

  const handleUnitChange = useCallback((_unit) => {
    updateUnit(_unit);
  }, []);

  const { api } = useApi();
  const location = useLocation();
  const _query = parseQuery(location.search || '') || {};

  const assetId = _query.asset || '';
  const assetName = _query.assetName || '';

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);

  useEffect((): void => {
    // 获取碳汇资产及相关信息

    async function init () {
      const assetDetail = await queryAsset(api, assetId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const projectDetail = await queryProject(api, (assetDetail?.asset || {}).project_id || '');

      updateAssetsInfo({
        ...(assetDetail.asset || {}),
        ...(assetDetail.additionals || {}),
        max_supply: (projectDetail?.project || {}).max_supply || 0
      });
    }

    init();
  }, []);

  const onFinish = (values: FormProps): void => {
    if (notAllprotocalChecked(protocals)) {
      message.error(t<string>('请先同意协议'));

      return;
    }

    async function submit () {
      // form.proponent
      const { amount, ...additionals } = values;
      const result = await submitIssue(api, ecoAccount, assetId, ecoToUnit(amount, 6 + unit).toString(), additionals);

      console.log('result ----', result);
      // message.info('申请提交成功');
      form.resetFields();
      setProtocals({
        costPro: false,
        registerPro: false,
        agreed2: false
      });
      history.push('/myassets');
    }

    submit();
  };

  return (
    <Form
      form={form}
      name='transfer-form'
      onFinish={onFinish}>
      <div className={className}>
        <Header title={t<string>('增发碳汇资产')} />

        <Panel>

          <Banner>
            <img height='auto'
              src={BannerImgSource}
              width='100%' />
          </Banner>
        </Panel>
        <Panel title='说明：'>
          <p>{t<string>('ECO2 Ledger的碳汇资产上链，不同年份的碳汇资产分开操作')}</p>
          <p>{t<string>('1、依照前一步骤填写的碳汇资产，选择您要上链的年份，将该年份的碳汇转入至ECO2 Ledger的托管碳汇账户里。')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('您的碳汇资产如果是VCS标准，请汇至：Beijing Qianyuhui International Environmental Investment Co., Ltd')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('如果是Gold Standard 标准，请汇至：Beijing Qianyuhui International Environmental Investment Co., Ltd（1069079）')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('其他标准暂时无法上链，我们将陆续开通。')}</p>
          <p>{t<string>('2、于下方填写相关信息。')}</p>
          <p>{t<string>('3、提交资料后，ECO2 Ledger资产审查委员将会对您填写的资料进行审核。')}</p>
          <p>{t<string>('4、审核成功后，您的钱包中将出现此笔碳汇资产。')}</p>
          <br />

          <p>{t<string>('备注')}</p>
          <p>{t<string>('1、提交碳汇资产上链，一次仅能提交一个年份的碳汇资产。')}</p>
          <p>{t<string>('2、若在碳汇项目中没看到您的碳汇项目，请先「新增碳汇项目」。')}</p>
          <p>{t<string>('3、资产审查委员会一般会在7个工作日内完成审核。')}</p>
          <p>{t<string>('4、若审核不通过，已汇到托管账户的碳汇，将在7个工作日内退回到原账户。')}</p>
          <p>{t<string>('5、上链后的碳汇资产，如要申请下链，可在「我上链的资产」中申请。')}</p>

        </Panel>
        <Panel>
          <Row>
            <Hidden>
              <InputAddress
              // isError={!!errorMap.proponent}
                label={<div>{t<string>('账户')}</div>}
                // onChange={(proponent: string | null) => setFieldsValue({ proponent })}
                placeholder={t<string>('请输入项目发起人名称')}
                // //value={form.proponent}
                withLabel
              />
            </Hidden>
          </Row>
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
                  withLabel
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
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
            >
              <FieldDecorator>
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>{t<string>('资产上限')}</div>}
                  labelExtra={<div>{t<string>('吨')}</div>}
                  value={unitToEco(assetsInfo.initial_supply as string || 0, 6).toString() }
                  withLabel
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
                  labelExtra={<div>吨</div>}
                  maxLength={500}
                  // value={assetsInfo.total_supply as string}
                  value={unitToEco(assetsInfo.total_supply as string || 0, 6).toString() }
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
                  label={<div>{t<string>('申请增发数量')}</div>}
                  labelExtra={<div>吨</div>}
                  maxLength={500}
                  // onChange={(amount: string) => setFieldsValue({ amount })}
                  placeholder={t<string>('请输入您需要发行的碳汇资产数量')}
                  // value={form.name}
                  withLabel
                >
                  {/* <Dropdown
                    defaultValue={unit}
                    dropdownClassName='ui--SiDropdown'
                    isButton
                    onChange={handleUnitChange}
                    options={SIOptions}
                  /> */}
                </Input>
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='proof'
              rules={[{
                validator: requiredValidator
              }, {
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('碳汇转入证明')}</div>}
                  maxLength={500}
                  // onChange={(proof: string) => setFieldsValue({ proof })}
                  placeholder={t<string>('请输入该碳汇资料在APX/VCS 转入担保账户的证明材料链接')}
                  // value={form.name}
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
              <FieldDecorator
              >
                <TextArea
                  isFull={false}
                  label={<div>{t<string>('描述')}</div>}
                  labelExtra={<div>{t<string>('请输入增发资产的原因，最大500字符')}</div>}
                  maxLength={500}
                  // onChange={(remark: string) => setFieldsValue({ remark })}
                  rows={3}
                  // value={form.remark}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
        </Panel>
        <Panel>
          <div>
            <Checkbox
              label={t<string>('增发碳汇资产需要等待 资产审查委员会审查通过后，您发行的碳汇数字资产会增加;')}
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div>
          <div>
            <Checkbox
              label={t<string>('增发碳汇资产将支付 100 ECO2 用于 资产审查委员会的审核费用  及 额外的网络资源使用手续费;')}
              onChange={(registerPro: boolean) => setProtocalValue({ registerPro })}
              value={protocals.registerPro}
            />
          </div>
          <div>
            <Checkbox
              label={t<string>('我同意 遵守TOS协议内容')}
              onChange={(agreed2: boolean) => setProtocalValue({ agreed2 })}
              value={protocals.agreed2}
            />
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <Button htmlType='submit'>{t<string>('增发碳汇资产')}</Button>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default AdditionalIssue;
