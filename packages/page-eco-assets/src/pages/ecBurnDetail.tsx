// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable react/display-name */

import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useApi } from '@polkadot/react-hooks';
import Panel from '@eco/eco-components/Panel';
import { useLocation } from 'react-router-dom';
import { parseQuery, fromHex, resolveAmountNumber } from '@eco/eco-utils/utils';
import { queryProject, queryBurn, queryAsset } from '@eco/eco-utils/service';
import { map as lodashMap } from 'lodash';
import Voting from '../components/Voting';
import { Icon } from '@polkadot/react-components';

const Summary = styled.div`
  text-align: center;
  .appr{
    font-size: 20px;
    color: #169BD5;
  }
  .refu{
    font-size: 20px;
    color: #D9001B;
  }
  .status {
    font-size: 20px;
    color: #4B7900;
  }
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 8px 0px;
  & + & {
    margin-top: 4px;
  }
`;
const Col = styled.div`
  // width: 45%;
  width: 100%;
  & + & {
    margin-left: 25px;
  }
  .label{
    font-weight: 500;
    margin-right: 8px;
    color: #AAAAAA;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface ProjectDetail {
  assetDetail?: any,
  [key: string]: string | number,
}

const DetailsMap = [
  [{
    type: () => {
      return <>
        <span className='label'>资产:</span>
      </>;
    }
  }],
  [{
    vintage: (v) => {
      return <>
        <span className='label'>资产年限:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
    // render (v) {
    //   return ['碳汇总数', resolveAmountNumber(v)];
    // }
  }, {
    // annualEmissionCuts: '预估年减排量',
    total_supply: (v) => {
      return <>
        <span className='label'>已发行总量:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
      // return ['预估年减排量', resolveAmountNumber(v)];
    }
  }],
  [{
    amount: '申请销毁数量'
  }],
  [{
    issueRemark: (v) => {
      return <>
        <span className='label'>描述:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }]
];

const ProjectDetail = () => {
  const [projectInfo, updateProjectInfo] = useState<ProjectDetail>({});

  const location = useLocation();
  const queryObj = parseQuery(location.search || '') || {};
  const { id: projectId, proposalId, state } = queryObj;

  const { api } = useApi();

  useEffect(() => {
    _queryDetail();

    async function _queryDetail () {
      const result = await queryBurn(api, projectId);
      let assetDetail = {};

      if (result && result.asset_id) {
        assetDetail = await queryAsset(api, result.asset_id);
      }

      updateProjectInfo({
        ...assetDetail.asset,
        ...assetDetail.additional,
        ...(result as Record<string, any> || {}),
        issueRemark: result.additional.remark
      });
    }
  }, []);

  return (
    <div>
      <Panel>
        <DetailHeader>
          <div>碳汇项目详情页</div>
          <div>
            <Icon icon='reply'
              onClick={() => window.history.go(-1)}></Icon>
          </div>
        </DetailHeader>
      </Panel>
      <Panel title='项目信息'>
        {
          DetailsMap.map((item, idx) => {
            return <Row key={idx}>
              {lodashMap(item, (val, key) => {
                const [itemKey] = Object.keys(val);

                return <Col key={key}>
                  {/* {val}: {item.render ? item.render(projectInfo[key]) : projectInfo[key]} */}
                  {
                    typeof val[itemKey] !== 'function' ? (
                      <>
                        <span className='label'>{val[itemKey]}:</span>
                        <span className='labelVal'>{projectInfo[itemKey]}</span>
                      </>
                    ) : val[itemKey](projectInfo[itemKey])
                  }

                </Col>;
              })}
            </Row>;
          })
        }
      </Panel>
      <Panel title='投票情况'>
        <Voting
          proposalId={proposalId}
          state={state}
          subjectId={`project_${projectId}`}
        />
      </Panel>
    </div>
  );
};

export default ProjectDetail;
