// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import styled from 'styled-components';
import { BareProps } from '@polkadot/react-components/types';
import clsx from 'clsx';
// import { Table, Input, Checkbox, Dropdown } from '@polkadot/react-components';
import { FormConsumer } from './formContext';
// import { Form } from 'antd';

// interface validator

interface FieldProps extends BareProps {
  onChange?: (val: string) => any,
  validator?: (val: string) => string | null | undefined,
  required?: boolean,
}

const FieldWrapper = styled.div`
  position:relative;
  // margin-bottom: 20px;

  &.required{
    &::before{
      position: absolute;
      left: -8px;
      top: 50%;
      content: '*';
      // width: 3px;
      // height: 3px;
      transform: translate(0, -50%);
      z-index:1;
      // border-radius: 50%;
      color: #ff4d4f;

    }
  }
`;

const ErrorInfo = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  position: absolute;
  bottom: -15px;
  left: 0;
`;

function FieldDecorator ({ onChange, children, validator, className, required = false, ...rest }: FieldProps): React.ReactElement {
  const [errorInfo, setErrorInfo] = useState<string>('');

  const handleChange = (value: string): void => {
    onChange && onChange(value);

    if (validator) {
      setErrorInfo(validator(value) || '');
    }
  };

  return (
    <FormConsumer>
      {() => {
        return (
          <FieldWrapper className={clsx(className, 'field-item', required ? 'required' : '')}>
            {React.cloneElement((children as React.ReactElement), {
              onChange: handleChange,
              ...rest
            })}
            {errorInfo && <ErrorInfo>{errorInfo}</ErrorInfo>}
          </FieldWrapper>
        );
      }}
    </FormConsumer>
  );
}

export default FieldDecorator;
