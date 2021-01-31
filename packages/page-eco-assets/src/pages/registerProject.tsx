// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * 注册碳汇项目
 */
import React, { useCallback, useMemo, useState } from 'react';
// import styled from 'styled-components';
import { Form, message } from 'antd';

import { Input, Checkbox, Dropdown, InputAddress, Button } from '@polkadot/react-components';
import Panel from '@eco/eco-components/Panel';
// import Button from '@eco/eco-components/Button';
import TextArea from '@eco/eco-components/TextArea';

import { useApi } from '@polkadot/react-hooks';

import { submitProject } from '@eco/eco-utils/service';
// import { Keyring } from '@polkadot/api';
import FieldDecorator from '@eco/eco-components/FormComponents';
import Row from '@eco/eco-components/Row';

import SubmitBtn from '@eco/eco-components/SubmitBtn';
import Header from '../components/header';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';

import { notAllprotocalChecked,
  requiredValidator,
  urlValidator,
  dateValidator,
  ProjectTypes,
  numberValidator, yearValidator, ecoToUnit, Countries } from '@eco/eco-utils/utils';
import { useTranslation } from '@eco/eco-utils/translate';
interface Props {
  className?: string,
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

// interface FormProps {
//   [key: string]: string | null
// }

const ProjectTypeOptions = ProjectTypes.map((val, index) => {
  return {
    text: val,
    value: val
  };
});

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

function RegisterProject ({ className }: Props): React.ReactElement<Props> {
  const { api } = useApi();

  const [form] = Form.useForm();
  const [ecoAccount] = useECOAccount();

  // const [formAddress, setFormAddress] = useState<string>('');
  const [errorMap] = useState<Record<string, boolean | undefined>>({});

  const [protocals, setProtocals] = useState<ProtocalProps>({
    costPro: false,
    registerPro: false,
    agreed2: false
  });

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);
  const { t } = useTranslation('page-eco-assets');

  const AssetsOpts = useMemo(() => {
    return [{
      text: t<string>('注册碳汇项目'),
      value: 'carbon'
    }
    // , {
    //   text: '标准资产',
    //   value: 'standard'
    // }
    ];
  }, []);

  const CarbonStandsTypes = useMemo(() => {
    return [{
      text: t<string>('VCS'),
      value: 'VCS'
    }, {
      text: t<string>('GS'),
      value: 'GS'
    }];
  }, []);

  const assetsNameValidator = async (rule: any, value: any): Promise<void> => {
    const _reg = /^[A-Z\d]{1,8}$/;

    if (!_reg.test(value)) {
      throw new Error(t<string>('仅支持1到6位大写字母'));
    }

    return Promise.resolve();
  };

  const onFinish = (values: Record<string, string>) => {
    const { symbol, maxSupply, annualEmissionCuts, ...rest } = values;

    if (notAllprotocalChecked(protocals)) {
      message.error(t<string>('请先确定协议'));

      return;
    }

    submit();

    async function submit () {
      await submitProject(
        api,
        ecoAccount || '',
        symbol || '',
        ecoToUnit(maxSupply, 6).toString(),
        {
          ...rest,
          annualEmissionCuts: ecoToUnit(annualEmissionCuts, 6).toString()
        }
      );

      // message.info('申请提交成功');
      form.resetFields();
      setProtocals({
        costPro: false,
        registerPro: false,
        agreed2: false
      });
    }
  };

  const handleCountryChange = useCallback((value) => {
    if (value) {
      form.validateFields(['country']);
    }
  }, []);

  return (
    <Form
      form={form}
      name='transfer-form'
      onFinish={onFinish}>
      <div className={className}>
        <Header title={t<string>('新增碳汇项目')} />
        <Panel>
          <p>{t<string>('说明:')}</p>
          <p>{t<string>('若要将您的碳汇资产上链至ECO2 Ledger, 请正确填写以下资料：')}</p>
          <p>{t<string>('请注意:')}</p>
          <p>{t<string>('1. 提交资料前，请确认提交内容正确无误，一旦提交成功，该数据即写入区块链，无法修改。')}</p>
          <p>{t<string>('2. 提交成功后发现项目资料有误，需要重新提交「新增碳汇项目」。')}</p>
          <p>{t<string>('3. 写入区块链的资料无论正确与否都无法删除。')}</p>
        </Panel>
        <Panel
          title={t<string>('完善信息')}
        >
          <Row>
            <Form.Item>
              <Dropdown
                defaultValue={'carbon'}
                isDisabled
                label={<div>{t<string>('注册类型')}</div>}
                options={AssetsOpts}
                placeholder={t<string>('请选择')}
                withLabel
              />
            </Form.Item>
            <Form.Item
              label=''
              name='proponent'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isError={!!errorMap.proponent}
                  isFull={false}
                  label={<div>{t<string>('项目发起人')}</div>}
                  placeholder={t<string>('请输入项目发起人名称')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='projectName'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isError={!!errorMap.projectName}
                  isFull={false}
                  label={<div>{t<string>('项目全称')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入碳汇项目的完整名称，例如：内蒙古林业碳汇')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='symbol'
              rules={[{
                validator: requiredValidator
              }, {
                validator: assetsNameValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isError={!!errorMap.symbol}
                  isFull={false}
                  label={<div>{t<string>('项目代码')}</div>}
                  maxLength={500}
                  placeholder={t<string>('项目名称缩写，仅支持输入最多8位大写字母或数字')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>

          </Row>
          {/* <Row>
            <Form.Item
              label=''
              name='lifetime'
              rules={[{
                validator: requiredValidator
              }, {
                validator: yearValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isError={!!errorMap.lifetime}
                  isFull={false}
                  label={<div>{t<string>('资产年限')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入您需要发行的碳汇年限')}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>

          </Row> */}
          <Row>
            <Form.Item
              label=''
              name='maxSupply'
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
                  label={<div>{t<string>('项目碳汇总数')}</div>}
                  labelExtra={t<string>('吨')}
                  placeholder={t<string>('请输入，仅支持输入数字')}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='annualEmissionCuts'
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
                  label={<div>{t<string>('预估年减排量')}</div>}
                  labelExtra={t<string>('吨')}
                  placeholder={t<string>('请输入，仅支持输入数字')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='registerNumber'
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
                  label={<div>{t<string>('项目注册编号')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入项目注册编号，例如：GS18060或VCS18060')}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='registerDate'
              rules={[{
                validator: requiredValidator
              }, {
                validator: dateValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目注册日期')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入该项目申请碳标准日期，示例 2015-01-01')}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='projectStartDate'
              rules={[{
                validator: requiredValidator
              }, {
                validator: dateValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目起始日期')}</div>}
                  maxLength={500}
                  placeholder={t<string>('示例 2015-01-01')}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='projectEndDate'
              rules={[{
                validator: requiredValidator
              }, {
                validator: dateValidator
              }]}
              validateFirst
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目终止日期')}</div>}
                  maxLength={500}
                  placeholder={t<string>('示例 2015-01-01')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='standard'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                {/* <Input
                  isFull={false}
                  label={<div>{t<string>('碳汇标准')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入')}
                  withLabel
                /> */}
                <Dropdown
                  defaultValue={CarbonStandsTypes[0].value}
                  label={<div>{t<string>('碳汇标准')}</div>}
                  options={CarbonStandsTypes}
                  placeholder={t<string>('请选择')}
                  withLabel
                >

                </Dropdown>
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='methodology'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('采用方法学')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='projectType'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                {/* <Input
                  isFull={false}
                  label={<div>项目类型</div>}
                  maxLength={500}
                  placeholder='请输入'
                  withLabel
                /> */}
                <Dropdown
                  defaultValue={ProjectTypeOptions[0].value}
                  label={<div>{t<string>('项目类型')}</div>}
                  options={ProjectTypeOptions}
                  placeholder={t<string>('请选择')}
                  withLabel
                >

                </Dropdown>
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='addtionalRemarks'
              rules={[{
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目类型补充说明')}</div>}
                  labelExtra={t<string>('选填')}
                  maxLength={500}
                  placeholder={t<string>('请输入您要补充的内容')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>

          </Row>
          <Row>
            <Form.Item
              label=''
              name='certificateUrl'
              rules={[{
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目其他证书')}</div>}
                  labelExtra={t<string>('资源链接')}
                  maxLength={500}
                  placeholder={t<string>('请输入http://开头的报告链接，并请确保链接可用')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='validator'
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
                  label={<div>{t<string>('第三方核查机构')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          {/* <Row>
            <Form.Item
              label=''
              name='registry'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('注册处')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row> */}
          {/* <Row>
            <Form.Item
              label=''
              name='registryId'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('注册处ID')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入')}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='status'

            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('状态')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row> */}
          <Row>
            <Form.Item
              label=''
              name='gps'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目GPS位置')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入GPS数字坐标，例如：40.0882377,116.3699724')}
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='country'
              rules={[{
                validator: requiredValidator
              }]}
              validateTrigger={['onSubmit']}
            >
              <FieldDecorator
                onChange={handleCountryChange}
                required
              >

                <Dropdown
                  // defaultValue={CountriesOptions[0].value}
                  label={<div>{t<string>('项目所在国家')}</div>}
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
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='province'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目所在 州/省')}</div>}
                  maxLength={500}
                  placeholder='请输入'
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='city'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目所在城市(市/县)')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='website'
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
                  label={<div>{t<string>('项目网站')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入http://开头的网站链接，并请确保链接可用')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='projectDoc'
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
                  label={<div>{t<string>('项目报告')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入http://开头的网站链接，并请确保链接可用')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>

          </Row>
          <Row>
            <Form.Item
              label=''
              name='projectInformationUrl'
              rules={[{
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目资料链接')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入http://开头的网站链接，并请确保链接可用')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='projectPhotosUrl'
              rules={[{
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator

              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('项目照片')}</div>}
                  maxLength={500}
                  placeholder={t<string>('请输入http://开头的网站链接，并请确保链接可用')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='remark'
            >
              <FieldDecorator
              >
                <TextArea
                  isFull={false}
                  label={<div>{t<string>('请输入资产描述，最大1000字符')}</div>}
                  maxLength={1000}
                  rows={3}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
        </Panel>
        <Panel>
          <div>
            <Checkbox
              label='注册碳汇项目需要等待 资产审查委员会审查通过后，您申请的碳汇项目才会生效;'
              onChange={(agreed2: boolean) => setProtocalValue({ agreed2 })}
              value={protocals.agreed2}
            />

          </div>
          <div>
            <Checkbox
              label='注册碳汇项目，将支付 100 ECO2 用于 资产审查委员会的审核费用  及 额外的网络资源使用手续费;'
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div>
          <div>
            <Checkbox
              label={t<string>('我同意遵守TOS协议内容')}
              onChange={(registerPro: boolean) => setProtocalValue({ registerPro })}
              value={protocals.registerPro}
            />
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <SubmitBtn htmlType='submit'>{t<string>('提交')}</SubmitBtn>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default RegisterProject;
