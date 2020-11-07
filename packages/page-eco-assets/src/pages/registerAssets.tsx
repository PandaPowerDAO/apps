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

import { submitAsset, queryProjectsList } from '@eco/eco-utils/service';
import { useECOAccount } from '@eco/eco-components/Account/accountContext';

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
        setProjects([
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
        <Panel title='您好'>
          <p>注册碳汇资产说明</p>
        </Panel>
        <Panel
          title='完善信息'
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
                  label={<div>碳汇项目</div>}
                  options={projects}
                  placeholder='请选择'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            {/* <Form.Item
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
            </Form.Item> */}
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
                  label={<div>碳汇发行数量</div>}
                  labelExtra={<div>吨</div>}
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
                  label={<div>碳汇签发日期</div>}
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
                  label={<div>碳汇起始日期</div>}
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
                  label={<div>碳汇终止日期</div>}
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
                validator: numberValidator
              }]}
              validateFirst
            >
              <FieldDecorator
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
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
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
            >
              <FieldDecorator
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
              label='注册成为发行商，将消耗 100 ECO2 及 10,000 ECC'
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
            <SubmitBtn htmlType='submit'>注册</SubmitBtn>
          </div>
        </Panel>
      </div>
    </Form>
  );
}

export default RegisterCoins;
