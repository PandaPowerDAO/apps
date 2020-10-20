// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import React, { FormEvent, useCallback } from 'react';
import { BareProps } from '@polkadot/react-components/types';
import styled from 'styled-components';
import clsx from 'clsx';
// @ts-ignore
import createDOMForm from '@eco/eco-components/Form/node_modules/rc-form/lib/createDOMForm';
import { FormProvider, FormConsumer } from './formContext';
import { FormControl } from '@material-ui/core';
import { FIELD_DATA_PROP,
  FIELD_META_PROP, FORM_ITEM_ERROR } from './const';

interface SubmitFunc {
  (e: FormEvent): any
}

interface FormProps extends BareProps {
  onSubmit: SubmitFunc,
}

interface CreateProps {
  [key: string]: any
}

const FormControlWrapper = styled.div`
  &.has-error {
    .ui--Labelled, .selection.dropdown{
      border-color: red!important;
    }

  }
`;

function Form (params:FormProps): React.ReactElement {
  const { children, onSubmit, ...rest } = params;

  return (
    <FormProvider value={{ ...rest }}>
      <form onSubmit={onSubmit}
        {...rest}>
        {children}
      </form>
    </FormProvider>
  );
}

Form.create = function create (options:CreateProps): React.ReactElement {
  return createDOMForm(
    Object.assign({
      fieldDataProp: FIELD_DATA_PROP,
      fieldMetaProp: FIELD_META_PROP
    },
    options
    ));
};

interface FormItemProps extends BareProps {
  error?: string,
  children: React.ReactElement
}

Form.Item = function Item (props:FormItemProps): React.ReactElement {
  const { children, error, className, ...rest } = props;
  const fieldDataProp = children.props && children.props[FIELD_DATA_PROP];
  const errorMsg = error || (fieldDataProp && fieldDataProp.errors && fieldDataProp.errors[0] && fieldDataProp.errors[0].message);

  const renderChildren = useCallback(() => {
    return React.cloneElement(children, {
      value: children.props && children.props.value ? children.props.value : '',
      // size: children.props && children.props.size ? children.props.size : size,
      [FORM_ITEM_ERROR]: error ? '1' : '0'
      // classNamw: clsx('form-item-content', 'has-error')
    });
  }, [children, error]);

  return (
    <FormConsumer>
      {(formProp) => {
        if (!formProp) {
          throw new Error('You should not use FormItem outside Form');
        }

        return (
          <FormControlWrapper className={clsx(errorMsg ? 'has-error' : '')}>
            <FormControl className={clsx(className, 'form-item')}
              {...rest}
              error={!!errorMsg}>
              {renderChildren()}
              {errorMsg && <div>{errorMsg}</div>}
            </FormControl>
          </FormControlWrapper>

        );
      }}
    </FormConsumer>
  );
};

export default Form;
