// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * 注册碳汇资产
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Form, message } from 'antd';

// import styled from 'styled-components';

import { useApi } from '@polkadot/react-hooks';
import { Input, Checkbox, Dropdown } from '@polkadot/react-components';
import Panel from '@eco/eco-components/Panel';
// import Button from '@eco/eco-components/Button';
import TextArea from '@eco/eco-components/TextArea';
// import { Keyring } from '@polkadot/api';
import FieldDecorator from '@eco/eco-components/FormComponents';
import Row from '@eco/eco-components/Row';
import SubmitBtn from '@eco/eco-components/SubmitBtn';
import Header from '../components/header';

import { submitAsset, queryProjectsList } from '@eco/eco-utils/service';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';
import { useTranslation } from '@eco/eco-utils/translate';

import { notAllprotocalChecked,
  requiredValidator,
  urlValidator,
  ecoToUnit,
  dateValidator, yearValidator, numberValidator } from '@eco/eco-utils/utils';

interface Props {
  className?: string,
}

// interface DataItem {
//   [key: string]: string | number | undefined | null
// }

interface FormProps {
  [key: string]: string | null | undefined
}

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

interface Project {
  projectId: string,
  symbol: string,
  [key: string]: string | number
}

function RegisterCoins ({ className }: Props): React.ReactElement<Props> {
  const [form] = Form.useForm();
  const { t } = useTranslation('page-eco-assets');
  const [projects, setProjects] = useState<Project[]>([
    {
      text: t<string>('请选择碳汇项目'),
      value: '_empty_',
      symbol: t<string>('请选择碳汇项目'),
      projectId: '_empty_'
    }
  ]);

  const [ecoAccount] = useECOAccount();

  // console.log('ecoAccount', ecoAccount);

  const [protocals, setProtocals] = useState<ProtocalProps>({
    // costPro: false,
    registerPro: false
  });

  const { api } = useApi();

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);

  useEffect(() => {
    async function init () {
      const projects = await queryProjectsList(ecoAccount, 1);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (projects && (projects.docs as Project[])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setProjects([
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          ...(projects.docs || [])
        ].map((pro: Project): Project => {
          return {
            ...pro,
            text: pro.symbol,
            value: pro.projectId
          };
        }).filter((v: Project): boolean => {
          return v.approved === 1;
        }));
      }
      // console.log(projects);
    }

    if (ecoAccount) {
      init();
    }
  }, [ecoAccount]);

  // const handleSubmit = useCallback(() => {
  //   async function _submit () {
  //     const { projectId = '',
  //       vintage = '',
  //       initialSupply = '',
  //       ...additional } = form;
  //     const result = await submitAsset(
  //       api,
  //       '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  //       projectId || '0x7ffc632266aeb1637e62732995f7b4a50786f1ad00de309519b033dbf34ecb2d',
  //       vintage as string,
  //       initialSupply as string,
  //       // additional:
  //       { remark: 'register asset remark' }
  //     );

  //     console.log(result);
  //   }

  //   _submit();
  // }, [form, api]);

  // const projectValidator = async (rule: any, value: any): Promise<void> => {
  //   console.log('projectValidator');

  //   if (!value || value === '_empty_') {
  //     throw new Error('required');
  //   }

  //   await Promise.resolve(undefined);
  // };

  const handleProjectSelect = useCallback((value) => {
    if (value) {
      form.validateFields(['projectId']);
    }
  }, []);

  const onFinish = (values: FormProps): void => {
    // console.log('ecoAccount', ecoAccount);

    if (notAllprotocalChecked(protocals)) {
      message.error(t<string>('请先同意协议内容'));

      return;
    }

    _submit();

    async function _submit () {
      const {
        projectId = '',
        vintage = '',
        initialSupply = '',
        ...additional
      } = values;

      await submitAsset(
        api,
        ecoAccount,
        projectId as string,
        vintage as string,
        ecoToUnit(initialSupply as string, 6).toString(),
        additional
      );

      // message.info('申请提交成功');
      form.resetFields();
      setProtocals({
        // costPro: false,
        registerPro: false
      });
    }
  };

  return (
    <Form
      form={form}
      name='transfer-form'
      onFinish={onFinish}>
      <div className={className}>
        <Header title={t<string>('上链碳汇资产')} />
        <Panel title={t<string>('说明:')}>
          <p>{t<string>('ECO2 Ledger的碳汇資產上链，不同年份的碳汇资产分开操作。为保证碳汇量的真实性和避免双重计算，上链的碳汇需要完成链下签发，并汇入ECO2 Ledger托管账户 。')}</p>
          <br />
          <p>{t<string>('1. 将该年份的碳汇转入至ECO2 Ledger的托管碳汇账户里。')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('您的碳汇资产如果是VCS标准，请汇至：Beijing Qianyuhui International Environmental Investment Co., Ltd')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('如果是Gold Standard 标准，请汇至：Beijing Qianyuhui International Environmental Investment Co., Ltd（1069079）')}</p>
          <p style={{ textIndent: '1em ' }}>{t<string>('其他标准暂时无法上链，我们将陆续开通。')}</p>
          <p>{t<string>('2. 依照前一步骤填写的碳汇资产，填写上链碳汇的年份，操作完成后请将“碳汇转入凭据”以电子档方式留存。')}</p>
          <p>{t<string>('3. 于下方填写相关信息。')}</p>
          <p>{t<string>('4. 提交资料后，ECO2 Ledger资产审查委员将会对您填写的资料进行审核。')}</p>
          <p>{t<string>('5. 审核成功后，您的钱包中将出现此笔碳汇资产。')}</p>
          <br/>
          <p>{t<string>('备注：')}</p>
          <p>{t<string>('1. 提交碳汇资产上链，一次仅能提交一个年份的碳汇资产。')}</p>
          <p>{t<string>('2. 若在碳汇项目中没看到您的碳汇项目，请至「新增碳汇项目」。')}</p>
          <p>{t<string>('3. 资产审查委员会一般会在7个工作日内完成审核。')}</p>
          <p>{t<string>('4. 若审核不通过，已汇到托管账户的碳汇，将在7个工作日内退回到原账户。')}</p>
          <p>{t<string>('5. 上链后的碳汇资产，如要申请下链，可在「我链上的资产」中申请。')}</p>
        </Panel>
        <Panel
          title={t<string>('完善信息')}
        >
          <Row>
            <Form.Item
              label=' '
              name='projectId'
              rules={[{
                validator: requiredValidator
              }]}
              validateTrigger={['onSubmit']}>
              <FieldDecorator
                onChange={handleProjectSelect}
                required
              >
                <Dropdown
                  // onChange={(assetsType) => setFieldsValue(assetsType)}
                  label={<div>{t<string>('碳汇项目')}</div>}
                  options={projects}
                  placeholder={t<string>('请选择')}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='symbol'

            >
              <FieldDecorator
                required
              >
                <Input
                  isDisabled
                  isFull={false}
                  label={<div>资产代码</div>}
                  // onChange={(name: string) => setFieldsValue({ name })}
                  placeholder='请选择碳汇项目'
                  // value={form.name}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='vintage'
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
                  isFull={false}
                  label={<div>{t<string>('资产年份')}</div>}
                  maxLength={500}
                  // onChange={(vintage: string) => setFieldsValue({ vintage })}
                  placeholder={t<string>('请输入您需要发行的碳汇年限: 2020')}
                  // value={form.vintage}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='initialSupply'
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
                  label={<div>{t<string>('资产上限')}</div>}
                  labelExtra={<div>{t<string>('吨')}</div>}
                  maxLength={500}
                  // onChange={(initialSupply: string) => setFieldsValue({ initialSupply })}
                  placeholder={t<string>('请输入该年份内的碳汇总量')}
                  // value={form.initialSupply}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='upChainNum'
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
                  label={<div>{t<string>('碳汇资产上链数量')}</div>}
                  labelExtra={<div>{t<string>('吨')}</div>}
                  maxLength={500}
                  // onChange={(initialSupply: string) => setFieldsValue({ initialSupply })}
                  placeholder={t<string>('请输入本次要上链的碳汇数量')}
                  // value={form.initialSupply}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>

          </Row>
          <Row>
            <Form.Item
              label=' '
              name='verifier'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('第三方核查机构')}</div>}
                  maxLength={500}
                  // onChange={(verifier: string) => setFieldsValue({ verifier })}
                  placeholder={t<string>('请输入')}
                  // value={form.verifier}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            {/* <Form.Item
              label=' '
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
                  label={<div>{t<string>('签发报告')}</div>}
                  labelExtra={t<string>('资源链接')}
                  maxLength={500}
                  // onChange={(projectDoc: string) => setFieldsValue({ projectDoc })}
                  placeholder={t<string>('请输入')}
                  // value={form.projectDoc}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item> */}
            <Form.Item
              label=' '
              name='checkDoc'
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
                  label={<div>{t<string>('核查报告')}</div>}
                  labelExtra={t<string>('资源链接')}
                  maxLength={500}
                  // onChange={(projectDoc: string) => setFieldsValue({ projectDoc })}
                  placeholder={t<string>('请输入')}
                  // value={form.projectDoc}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='extraDoc'
              rules={[{
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('其他报告')}</div>}
                  labelExtra={t<string>('资源链接')}
                  maxLength={500}
                  // onChange={(extraCertificate: string) => setFieldsValue({ extraCertificate })}
                  placeholder={t<string>('请输入')}
                  // value={form.extraCertificate}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            {/* <Form.Item
              label=' '
              name='extraCertificate'
              rules={[{
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('其他报告')}</div>}
                  labelExtra={t<string>('资源链接')}
                  maxLength={500}
                  // onChange={(extraCertificate: string) => setFieldsValue({ extraCertificate })}
                  placeholder={t<string>('请输入')}
                  // value={form.extraCertificate}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item> */}
          </Row>

          <Row>
            <Form.Item
              label=' '
              name='issuanceDate'
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
                  label={<div>{t<string>('碳汇签发日期')}</div>}
                  maxLength={500}
                  // onChange={(issuanceDate: string) => setFieldsValue({ issuanceDate })}
                  placeholder={t<string>('日期格式如 2020-10-10')}
                  // value={form.issuanceDate}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          {/* <Row>
            <Form.Item
              label=' '
              name='startDate'
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
                  label={<div>{t<string>('碳汇起始日期')}</div>}
                  maxLength={500}
                  // onChange={(startDate: string) => setFieldsValue({ startDate })}
                  placeholder={t<string>('日期格式如 2020-10-10')}
                  // value={form.startDate}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='endDate'
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
                  label={<div>{t<string>('碳汇终止日期')}</div>}
                  maxLength={500}
                  // onChange={(endDate: string) => setFieldsValue({ endDate })}
                  placeholder={t<string>('日期格式如 2020-10-10')}
                  // value={form.endDate}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>

            <Form.Item
              label=' '
              name='verifyDate'
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
                  label={<div>{t<string>('第三方核时间')}</div>}
                  maxLength={500}
                  // onChange={(verifyDate: string) => setFieldsValue({ verifyDate })}
                  placeholder='请选择'
                  // value={form.verifyDate}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='issuanceNumbers'
              rules={[{
                validator: numberValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>{t<string>('碳汇签发次数')}</div>}
                  maxLength={500}
                  // onChange={(issuanceNumbers: string) => setFieldsValue({ issuanceNumbers })}
                  placeholder={t<string>('请输入')}
                  // value={form.issuanceNumbers}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
           */}

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
                  labelExtra={t<string>('请输入该碳汇资料在APX/VCS 转入担保账户的证明材料链接')}
                  maxLength={500}
                  // onChange={(proof: string) => setFieldsValue({ proof })}
                  placeholder={t<string>('请输入')}
                  // value={form.proof}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='proofAccountName'
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
                  label={<div>{t<string>('碳汇转出账户名称')}</div>}
                  labelExtra={t<string>('请输入您在VCS/GS 的碳汇账户名称')}
                  maxLength={500}
                  // onChange={(proof: string) => setFieldsValue({ proof })}
                  placeholder={t<string>('请输入')}
                  // value={form.proof}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='remark'
            >
              <FieldDecorator
              >
                <TextArea
                  isFull={false}
                  label={<div>{t<string>('描述')}</div>}
                  labelExtra={<div>{t<string>('最多500字')}</div>}
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
          {/* <div>
            <Checkbox
              label='注册成为发行商，将消耗 100 ECO2 及 10,000 ECC'
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div> */}
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
            <SubmitBtn htmlType='submit'>{t<string>('注册')}</SubmitBtn>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default RegisterCoins;
