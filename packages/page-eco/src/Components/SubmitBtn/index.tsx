// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import { Button } from 'antd';
// import
import { ButtonProps } from 'antd/lib/button';

const ButtonWrapper = styled(Button)`
  background: #7db8a8!important;
  color: white!important;
  border-color: #7db8a8!important;
  width: 12rem;
`;

function SubmitBtn (props: ButtonProps): React.ReactElement<ButtonProps> {
  return <ButtonWrapper {...props} />;
}

export default SubmitBtn;
