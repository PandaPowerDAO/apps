// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {} from 'react';
import { Table } from '@polkadot/react-components';
import { BareProps } from '@polkadot/react-components/types';
import styled from 'styled-components';
import clsx from 'clsx';
import { Pagination } from 'antd';

type TableColumns = {
  key: string | number,
  render?: (rowVal: any) => any,
  className?: string;
  colSpan?: number;
  title: string | React.ReactNode;
  [key: string]: any;
}

type ObjectAny = {
  [key: string]: any;
}

interface TableProps extends BareProps {
  datasource: any[],
  columns: TableColumns[],
  empty?: string | React.ReactElement,
  footer?: React.ReactNode,
  onChange?: (...args: any[]) => any,
  pagination?: {
    pageSize?: number,
    total?: number,
    current: number,
  }
}

const StyledTable = styled(Table)`
  .cell,.theader {
    text-align: right;
    border-top: none!important;
    border-left: none!important;
    border-right: none!important;
  }
  .cell:first-of-type, .theader:first-of-type{
    text-align: left;
  }
`;

const FooterTr = styled.tr`
  & > td {
    border-left: none!important;
  }
`;

function CmptTable ({
  datasource,
  empty,
  columns,
  className,
  footer,
  pagination,
  onChange
} : TableProps): React.ReactElement<TableProps> {
  const header: any[] = columns.map((col): any[] => {
    return [col.title, clsx(col.className, 'theader'), col.colSpan];
  });

  const Footer = footer === null ? null : (footer || <Pagination
    current={pagination?.current || 1}
    onChange={onChange}
    pageSize={pagination?.pageSize}
    total={pagination?.total || 0}
  />);

  return <StyledTable
    className={clsx(className)}
    empty={empty}
    footer={<FooterTr>
      <td colSpan={100}
        style={{ border: 'none!important' }}>
        {Footer}
      </td>
    </FooterTr>}
    header={header}
  >
    {datasource.map((item:ObjectAny, rowIndex:number):React.ReactNode => {
      return <tr key={rowIndex}>
        {columns.map((h):React.ReactNode => {
          return <td
            className={clsx('cell', h.className)}
            key={h.key}>
            {h.render ? h.render(item) : item[h.key]}
          </td>;
        })}
      </tr>;
    })}
  </StyledTable>;
}

const NoPaddingTable = styled(CmptTable)`
  td:first-child, th:first-child{
    padding-left: 0!important;
  }
  td:last-child, th:last-child{
    padding-right: 0!important;
  }
`;

export default CmptTable;

export {
  NoPaddingTable
};
