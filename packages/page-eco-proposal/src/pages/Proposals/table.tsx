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
import { formatDate, reformatAssetName } from '@eco/eco-utils/utils';
import ProposalModal from './proposalModal';
import { useTranslation } from '@eco/eco-utils/translate';

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SumaryItemCol = styled.div`
  display: flex;
`;

// state：0/待提交, 1/审批中 2/已审批

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
  const { t } = useTranslation('page-eco-propposal');
  const StateMap = [t<string>('待提交'), t<string>('审批中'), t<string>('已审批')];
  // project | asset | issue | burn
  const ProposalTypes: Record<string, string> = {
    project: t<string>('注册碳汇项目'),
    asset: t<string>('注册碳汇资产'),
    issue: t<string>('增发碳汇资产'),
    burn: t<string>('销毁碳汇资产')
  };

  const resolveState = (rowData, t) => {
    const { state, threshold, ayes, nays } = rowData;

    const isPassed = ayes >= threshold && threshold > 0;

    if (state === 0) {
      return StateMap[0];
    } else if (state === 2) {
      if (isPassed) {
        return t<string>('已同意');
      } else {
        return t<string>('已拒绝');
      }
      // return StateMap[2];
    } else {
      if (ayes >= threshold || nays >= threshold) {
        return StateMap[2];
      }

      return StateMap[1];
    }
  };

  const [ecoAccount] = useECOAccount();

  const [records, updateRecords] = useState<Proposal []>([]);
  const history = useHistory();

  const header = useMemo(() => {
    return [
      [t<string>('全部提案'), 'header'],
      [t<string>('申请时间'), 'header'],
      [t<string>('费用'), 'header'],
      [t<string>('状态'), 'header'],
      ['', 'header'],
      // [{t<string>('可发行总量')}, 'header'],
      // [{t<string>('资产精度')}, 'header'],
      // [{t<string>('发行商')}, 'header'],
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
    const name = ((record.title || '').match(/\([^)]*\)/g) || '')[0].replace(/(\(|\))/g, '');
    const url = `/ecassets/ec-${record.type}-detail?id=${record.key}&proposalId=${record.proposalId || ''}&state=${record.state as string}&name=${reformatAssetName(name)}`;

    history.push(url);
  };

  const renderTitle = (record: Proposal) => {
    const { title } = record;
    // const _name = (title || '').match(/(?<=\()[^)]*/g)[0];
    const _name = ((title || '').match(/\([^)]*\)/g) || '')[0].replace(/(\(|\))/g, '');

    return <div>
      {ProposalTypes[record.type]}{reformatAssetName(_name)}
    </div>;
  };

  return (
    <div>
      <Part>
        <Panel>
          <SummaryRow>
            <SumaryItemCol>
              <SummaryItem>
                <div className='title'>{t<string>('总共')}</div>
                <div className='content'>{nums.total}</div>
              </SummaryItem>
              <SummaryItem>
                <div className='title'>{t<string>('审批中')}</div>
                <div className='content'>{nums.voting}</div>
              </SummaryItem>
              <SummaryItem>
                <div className='title'>{t<string>('已审批')}</div>
                <div className='content'>{nums.closed}</div>
              </SummaryItem>
              <SummaryItem>
                <div className='title'>{t<string>('待提交')}</div>
                <div className='content'>{nums.pending}</div>
              </SummaryItem>
            </SumaryItemCol>
            <div>
              {/* <ProposalModal isMember={isMember}
                propSenderId={ecoAccount} /> */}
              {/* <Button icon='plus'
                label={t<string>('发起提案')}></Button> */}
            </div>
          </SummaryRow>
        </Panel>
      </Part>
      <Panel>
        <div>
          <Input label={t<string>('通过名字或者标签过滤')} />
        </div>
        <TableWrapper>
          <Table
            empty={<div style={{ textAlign: 'center' }}>{t<string>('暂无数据')}</div>}
            footer={null}
            header={header}
            remainHeader
          >
            {records.map((record: Proposal) => {
              return <tr key={record._id}>
                <td>
                  {renderTitle(record)}
                </td>
                <td>{formatDate(record.timestamp as number)}</td>
                <td>200 ECO2</td>
                <td>{resolveState(record, t) || '-'}</td>
                <td>
                  {
                    record.state !== 0 && <div>
                      <div>{t<string>('同意')}({record.ayes === undefined ? '-' : record.ayes})</div>
                      <div>
                        {t<string>('拒绝')}({record.nays === undefined ? '-' : record.nays})
                      </div>
                    </div>
                  }
                  {
                    record.state === 0 && <div>-</div>
                  }
                </td>
                <td>
                  <Button onClick={() => goDetail(record)}>{t<string>('查看')}</Button>
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
