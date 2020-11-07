// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  label{
    left: 1rem!important;
  }

  & > div{
    width: 45%;
    padding: 0!important;
  }
  & > div + div{
    margin-left: 5%;
  }
  .dropdown {
    // border-left: 1px solid rgba(34,36,38,.15)!important;
  }
  .ui--Labelled{
    padding-left: 0!important;
  }
`;

export default Row;
