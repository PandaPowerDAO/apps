// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * 注册碳汇资产
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button, message } from 'antd';

// import styled from 'styled-components';

import { useApi } from '@polkadot/react-hooks';
import { Input, Checkbox, Dropdown } from '@polkadot/react-components';
import Panel from '../Components/Panel';
// import Button from '../Components/Button';
import TextArea from '../Components/TextArea';
// import { Keyring } from '@polkadot/api';
import FieldDecorator from '../Components/FormComponents';
import Row from '../Components/Row';

import { submitAsset, queryProjectsList } from '../service';
import { useECOAccount } from '../Components/Account/accountContext';

import { notAllprotocalChecked,
  requiredValidator,
  urlValidator,
  dateValidator, yearValidator, numberValidator } from '../Utils';

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
  const [projects, setProjects] = useState<Project[]>([
    {
      text: '请选择碳汇项目',
      value: '_empty_',
      symbol: '请选择碳汇项目',
      projectId: '_empty_'
    }
  ]);

  const [ecoAccount] = useECOAccount();

  console.log('ecoAccount', ecoAccount);

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
      const projects = await queryProjectsList();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (projects && (projects.docs as Project[])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setProjects([{
          symbol: '请选择碳汇项目',
          projectId: '_empty_'
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...(projects.docs || [])
        ].map((pro: Project): Project => {
          return {
            ...pro,
            text: pro.symbol,
            value: pro.projectId
          };
        }));
      }
      // console.log(projects);
    }

    init();
  }, []);

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

  const projectValidator = async (rule: any, value: any): Promise<void> => {
    console.log('projectValidator');

    if (!value || value === '_empty_') {
      throw new Error('required');
    }

    await Promise.resolve(undefined);
  };

  const onFinish = (values: FormProps): void => {
    console.log('ecoAccount', ecoAccount);

    if (notAllprotocalChecked(protocals)) {
      message.error('请先同意协议内容');

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
        ecoAccount as string,
        projectId as string,
        vintage as string,
        initialSupply as string,
        additional
      );

      message.info('申请提交成功');
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
        <Panel title='您好'>
          <p>完成碳汇项⽬注册后，已签发后的碳汇可以申请上链⾄ECO2 Ledger，请将要上链的碳汇资 产的信息完整填⼊下⽅栏位，请注意输⼊信息与数量必须与汇⼊ECO2 Ledger的托管账户之 碳汇完全吻合，此操作完成后，资产审查委员会对碳汇资产的信息与托管账户中的碳汇资产 进⾏审核，请注意碳汇资产的数量、年份与相关信息，必须完全吻合，才可完成碳汇资产上 链的操作。资产审查委员会审核完成后，您将可以在您的ECO2 Ledger碳钱包中看到所申请 的碳汇资产。</p>
          <p>
          1. 完成资料注册资料填写后，请于三⽇内将同⼀笔碳汇资产汇⼊ECO2 Ledger之托管账户，
          <li>
          <ul/> VCS (Verified Carbon Standard)： 
          <ul/> GS (Gold Standard)：
          </li>
          <br/>
          2. 如有任何信息与汇⼊托管账户之碳汇资产不⼀致，申请上链将会失败，申请费⽤将不 退回，已汇⼊托管账户之碳汇资产，将于七个⼯作⽇内退回⾄原账户。
          </p>
        </Panel>
        <Panel
          title='注册碳汇资产'
        >
          <Row>
            <Form.Item
              initialValue='_empty_'
              label=' '
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
                  label={<div>碳汇项目</div>}
                  options={projects}
                  placeholder='请选择'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=' '
              name='symbol'
              rules={[{
                validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>资产名称</div>}
                  maxLength={500}
                  // onChange={(name: string) => setFieldsValue({ name })}
                  placeholder='仅支持输入最多6位大写字母'
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
                  label={<div>资产年限</div>}
                  maxLength={500}
                  // onChange={(vintage: string) => setFieldsValue({ vintage })}
                  placeholder='请输入您需要发行的碳汇年限: 2020'
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
                  label={<div>项目发行数量</div>}
                  labelExtra={<div>克</div>}
                  maxLength={500}
                  // onChange={(initialSupply: string) => setFieldsValue({ initialSupply })}
                  placeholder='请输入您签发的数量'
                  // value={form.initialSupply}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
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
                  label={<div>项目签发日期</div>}
                  maxLength={500}
                  // onChange={(issuanceDate: string) => setFieldsValue({ issuanceDate })}
                  placeholder='日期格式如 2020-10-10'
                  // value={form.issuanceDate}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
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
                  label={<div>项目起始日期</div>}
                  maxLength={500}
                  // onChange={(startDate: string) => setFieldsValue({ startDate })}
                  placeholder='日期格式如 2020-10-10'
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
                  label={<div>项目终止日期</div>}
                  maxLength={500}
                  // onChange={(endDate: string) => setFieldsValue({ endDate })}
                  placeholder='日期格式如 2020-10-10'
                  // value={form.endDate}
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
                  label={<div>第三方核查者</div>}
                  maxLength={500}
                  // onChange={(verifier: string) => setFieldsValue({ verifier })}
                  placeholder='请输入'
                  // value={form.verifier}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
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
                  label={<div>第三方核时间</div>}
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
                  label={<div>碳汇签发次数</div>}
                  maxLength={500}
                  // onChange={(issuanceNumbers: string) => setFieldsValue({ issuanceNumbers })}
                  placeholder='请输入'
                  // value={form.issuanceNumbers}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
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
                  label={<div>签发报告</div>}
                  labelExtra='资源链接'
                  maxLength={500}
                  // onChange={(projectDoc: string) => setFieldsValue({ projectDoc })}
                  placeholder='请输入'
                  // value={form.projectDoc}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=' '
              name='extraCertificate'
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
                  label={<div>额外签发证书</div>}
                  labelExtra='资源链接'
                  maxLength={500}
                  // onChange={(extraCertificate: string) => setFieldsValue({ extraCertificate })}
                  placeholder='请输入'
                  // value={form.extraCertificate}
                  withLabel
                />
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
                  label={<div>碳汇转入证明</div>}
                  labelExtra='资源链接'
                  maxLength={500}
                  // onChange={(proof: string) => setFieldsValue({ proof })}
                  placeholder='请输入'
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
              rules={[{
                // validator: requiredValidator
              }]}>
              <FieldDecorator
                required
              >
                <TextArea
                  isFull={false}
                  label={<div>描述</div>}
                  labelExtra={<div>最多500字</div>}
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
              label='注册资产，将消耗 100ECO及 10,000 ECC'
              onChange={(agreed: boolean) => setProtocalValue({ costPro: agreed })}
              value={protocals.costPro}
            />

          </div> */}
          <div>
            <Checkbox
              label='我同意遵守TOS协议内容'
              onChange={(registerPro: boolean) => setProtocalValue({ registerPro })}
              value={protocals.registerPro}
            />
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <Button htmlType='submit'>注册</Button>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default RegisterCoins;
