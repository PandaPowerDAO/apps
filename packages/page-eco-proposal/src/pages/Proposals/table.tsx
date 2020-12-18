// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AddressInfo, AddressSmall, Button, Input, Table } from '@polkadot/react-components';
import { Pagination, Divider } from 'antd';
import { Panel, Part } from '@eco/eco-components';
import styled from 'styled-components';
import { useLocation, useHistory } from 'react-router-dom';

import { useECOAccount } from '@eco/eco-components/Account/accountContext';

import { queryCarbonProposals } from '@eco/eco-utils/service';
import { formatDate } from '@eco/eco-utils/utils';
import ProposalModal from './proposalModal';

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SumaryItemCol = styled.div`
  display: flex;
`;

// state：0/待提交, 1/审批中 2/已审批
const StateMap = ['待提交', '审批中', '已审批'];

const resolveState = (rowData) => {
  const { state, threshold, ayes, nays } = rowData;

  if (state === 0) {
    return StateMap[0];
  } else if (state === 2) {
    return StateMap[2];
  } else {
    if (ayes >= threshold || nays >= threshold) {
      return StateMap[2];
    }

    return StateMap[1];
  }
};

const SummaryItem = styled.div`
padding: 8px 20px;
& + & {
  margin-left: 12px;
}
.title{
  color: #333333;
  font-size: 12px;
  text-align: center;
}
.content{
  font-weight: 650;
  font-style: normal;
  font-size: 20px;
}
`;

interface PageType {
  total?: number,
  current?: number,
  pageSize: number,
}

interface Proposal {
  title: string;
  type: string;
  proposalId?: string;
  key: string;
  timestamp: number | string;
  _id: string;
  ayes?: number;
  nays?: number;
  state?: number;
  proposalIndex?: number;
}

const TableWrapper = styled.div`
.ui--Table{
  overflow-y: auto;
  *{
    border-left: none!important;
    border-right: none!important;
  }
}
  tr td {
    text-align: right;
  }
  tr td:first-of-type, th:first-of-type {
    text-align: left;
  }
`;

// project | asset | issue | burn
const ProposalTypes: Record<string, string> = {
  project: '注册碳汇项目',
  asset: '注册碳汇资产',
  issue: '增发碳汇资产',
  burn: '销毁碳汇资产'
};

const StatusMap = {

};

const ProposalTable = ({ isMember }) => {
  const [pagination, updatePagination] = useState<PageType>({
    total: 0,
    current: 0,
    pageSize: 10
  });
  const [nums, updateNums] = useState({
    closed: 0,
    pending: 0,
    voting: 0,
    total: 0
  });

  const [ecoAccount] = useECOAccount();

  const [records, updateRecords] = useState<Proposal []>([]);
  const history = useHistory();

  const header = useMemo(() => {
    return [
      ['全部提案', 'header'],
      ['申请时间', 'header'],
      ['费用', 'header'],
      ['状态', 'header'],
      ['', 'header'],
      // ['可发行总量', 'header'],
      // ['资产精度', 'header'],
      // ['发行商', 'header'],
      ['', 'header']
    ];
  }, []);

  const queryList = useCallback((nextPage: number) => {
    _query();

    async function _query () {
      const result = await queryCarbonProposals({
        limit: pagination.pageSize,
        offset: (nextPage - 1) * pagination.pageSize,
        reverse: 1,
        state: ''
      });

      updatePagination({
        ...pagination,
        current: nextPage,
        total: result.count || 0
      });
      updateNums({
        closed: result.closed || 0,
        pending: result.pending || 0,
        voting: result.voting || 0,
        total: result.total || 0
      });
      updateRecords(result.docs);
    }
  }, [pagination]);

  useEffect(() => {
    queryList(1);
  }, []);

  const goDetail = (record: Proposal) => {
    const url = `/ecassets/ec-${record.type}-detail?id=${record.key}&proposalId=${record.proposalId || ''}&state=${record.state as string}`;

    history.push(url);
  };

  return (
    <div>
      <Part>
        <Panel>
          <SummaryRow>
            <SumaryItemCol>
              <SummaryItem>
                <div className='title'>总共</div>
                <div className='content'>{nums.total}</div>
              </SummaryItem>
              <SummaryItem>
                <div className='title'>审批中</div>
                <div className='content'>{nums.voting}</div>
              </SummaryItem>
              <SummaryItem>
                <div className='title'>已审批</div>
                <div className='content'>{nums.closed}</div>
              </SummaryItem>
              <SummaryItem>
                <div className='title'>待提交</div>
                <div className='content'>{nums.pending}</div>
              </SummaryItem>
            </SumaryItemCol>
            <div>
              <ProposalModal isMember={isMember}
                propSenderId={ecoAccount} />
              {/* <Button icon='plus'
                label='发起提案'></Button> */}
            </div>
          </SummaryRow>
        </Panel>
      </Part>
      <Panel>
        <div>
          <Input label='通过名字或者标签过滤' />
        </div>
        <TableWrapper>
          <Table
            empty={<div style={{ textAlign: 'center' }}>暂无数据</div>}
            footer={null}
            header={header}
            remainHeader
          >
            {records.map((record: Proposal) => {
              return <tr key={record._id}>
                <td>
                  <div>
                    {ProposalTypes[record.type]}
                    <p>
                      {record.title}
                    </p>
                  </div>
                </td>
                <td>{formatDate(record.timestamp as number)}</td>
                <td>200 ECO2</td>
                <td>{resolveState(record) || '-'}</td>
                <td><div>
                  <div>同意({record.ayes === undefined ? '-' : record.ayes})</div>
                </div>拒绝({record.nays === undefined ? '-' : record.nays})</td>
                <td>
                  <Button onClick={() => goDetail(record)}>查看</Button>
                </td>
              </tr>;
            })}
          </Table>
        </TableWrapper>
      </Panel>
      <table style={{ width: '100%', textAlign: 'right' }}>
        <tr>
          <td colSpan={100}>
            <Pagination
              {...pagination}
              onChange={(nextPage: number) => queryList(nextPage)}
            />
          </td>
        </tr>
      </table>
    </div>
  );
};

export default ProposalTable;
