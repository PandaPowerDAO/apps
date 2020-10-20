// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * 注册碳汇项目
 */
import React, { useCallback, useMemo, useState } from 'react';
// import styled from 'styled-components';
import { Form, Button, message } from 'antd';

import { Input, Checkbox, Dropdown, InputAddress } from '@polkadot/react-components';
import Panel from '../Components/Panel';
// import Button from '../Components/Button';
import TextArea from '../Components/TextArea';

import { useApi } from '@polkadot/react-hooks';

import { submitProject } from '../service';
// import { Keyring } from '@polkadot/api';
import FieldDecorator from '../Components/FormComponents';
import Row from '../Components/Row';

import { notAllprotocalChecked,
  requiredValidator,
  urlValidator,
  dateValidator,
  numberValidator, yearValidator } from '../Utils';

interface Props {
  className?: string,
}

// interface FormProps {
//   [key: string]: string | null
// }

interface ProtocalProps {
  [key: string]: undefined | null | boolean
}

function RegisterProject ({ className }: Props): React.ReactElement<Props> {
  const { api } = useApi();

  const [form] = Form.useForm();

  // const [formAddress, setFormAddress] = useState<string>('');
  const [errorMap] = useState<Record<string, boolean | undefined>>({});

  const [protocals, setProtocals] = useState<ProtocalProps>({
    // costPro: false,
    registerPro: false
  });

  const setProtocalValue = useCallback((protocal): void => {
    setProtocals({
      ...protocals,
      ...protocal
    });
  }, [protocals]);

  const AssetsOpts = useMemo(() => {
    return [{
      text: '碳汇资产',
      value: 'carbon'
    }, {
      text: '标准资产',
      value: 'standard'
    }];
  }, []);

  const onFinish = (values: Record<string, string>) => {
    const { proponent, symbol, maxSupply, ...rest } = values;

    if (notAllprotocalChecked(protocals)) {
      message.error('请先确定协议');

      return;
    }

    submit();

    async function submit () {
      await submitProject(
        api,
        proponent || '',
        symbol || '',
        maxSupply || '',
        rest
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
          <p>在将碳汇资产上链⾄ECO2 Ledger前，请先完善预备上链的碳汇项⽬之基础信息。依照碳汇 项⽬之报告，如实完成下⽅信息填写，为提⾼碳汇项⽬的辨识度，请尽可能完成每个栏位的 信息填写，以便资产审查委员会审核。此申请⽆法撤回与修改，故请谨慎填写。⽬前ECO2 Ledger仅⽀持VCS (Verified Carbon Standard) 和GS (Gold Standard) 的碳标准申请上链，其他 碳标准之碳汇资产暂不⽀持。</p>
        </Panel>
        <Panel
          title='完善提案细节'
        >
          <Row>
            <Form.Item>
              <Dropdown
                defaultValue={'carbon'}
                label={<div>资产类型</div>}
                options={AssetsOpts}
                placeholder='请选择'
                withLabel
              />
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
                  isError={!!errorMap.symbol}
                  isFull={false}
                  label={<div>资产名称</div>}
                  maxLength={500}
                  placeholder='仅支持输入最多6位大写字母'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
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
                  label={<div>资产年限</div>}
                  maxLength={500}
                  placeholder='请输入您需要发行的碳汇年限'
                  withLabel={true}
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
                  label={<div>项目名称</div>}
                  maxLength={500}
                  placeholder='请输入项目名称'
                  withLabel
                />
              </FieldDecorator>
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
                <InputAddress
                  isError={!!errorMap.proponent}
                  label={<div>项目发起人</div>}
                  placeholder='请输入项目发起人名称'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
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
                  label={<div>项目碳汇总数</div>}
                  labelExtra='克'
                  placeholder='请输入该笔碳汇总数，仅支持数字'
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
                  label={<div>预估年减排量</div>}
                  labelExtra='吨'
                  placeholder='吨请输入该笔碳汇总数，仅支持数字'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
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
                  label={<div>项目注册日期</div>}
                  maxLength={500}
                  placeholder='请输入'
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
                  label={<div>项目起始日期</div>}
                  maxLength={500}
                  placeholder='请输入'
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
                  label={<div>项目终止日期</div>}
                  maxLength={500}
                  placeholder='请输入'
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
                <Input
                  isFull={false}
                  label={<div>碳汇标准</div>}
                  maxLength={500}
                  placeholder='请输入'
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
                <Input
                  isFull={false}
                  label={<div>项目类型</div>}
                  maxLength={500}
                  placeholder='请输入'
                  withLabel
                />
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
                  label={<div>采用方法学</div>}
                  maxLength={500}
                  placeholder='请输入'
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
                  label={<div>项目其他证书</div>}
                  labelExtra='资源链接'
                  maxLength={500}
                  placeholder='请输入'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='validator'
              rules={[{
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>第三方验证</div>}
                  maxLength={500}
                  placeholder='请输入'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
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
                  label={<div>注册处</div>}
                  maxLength={500}
                  placeholder='请输入'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='registryId'
              // rules={}
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>注册处ID</div>}
                  maxLength={500}
                  placeholder='请输入'
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
                  label={<div>状态</div>}
                  maxLength={500}
                  placeholder='请输入'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
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
                  label={<div>项目GPS位置</div>}
                  maxLength={500}
                  placeholder='请输入GPS坐标,如 132.2,123.1'
                  withLabel={true}
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='country'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <Input
                  isFull={false}
                  label={<div>国家</div>}
                  maxLength={500}
                  placeholder='请输入'
                  withLabel={true}
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
                  label={<div>州/省</div>}
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
                  label={<div>城市</div>}
                  maxLength={500}
                  placeholder='请输入'
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
                validator: urlValidator
              }]}
              validateFirst
            >
              <FieldDecorator
              >
                <Input
                  isFull={false}
                  label={<div>项目网站</div>}
                  maxLength={500}
                  placeholder='请输入https:// 开头的链接'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
            <Form.Item
              label=''
              name='projectInformationUrl'
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
                  label={<div>项目资料链接</div>}
                  maxLength={500}
                  placeholder='请输入https:// 开头的链接'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
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
                  label={<div>项目报告</div>}
                  maxLength={500}
                  placeholder='请输入https:// 开头的链接'
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
                  label={<div>项目照片</div>}
                  maxLength={500}
                  placeholder='请输入https:// 开头的链接'
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              label=''
              name='remark'
              rules={[{
                validator: requiredValidator
              }]}
            >
              <FieldDecorator
                required
              >
                <TextArea
                  isFull={false}
                  label={<div>描述</div>}
                  maxLength={500}
                  rows={3}
                  withLabel
                />
              </FieldDecorator>
            </Form.Item>
          </Row>
        </Panel>
        <Panel>
          {/* <div>
            <Checkbox
              label='注册碳汇项目，将消耗 100ECO及 10,000 ECC'
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

export default RegisterProject;
