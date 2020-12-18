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
import { queryProject } from '@eco/eco-utils/service';
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
  [key: string]: string | number
}

const DetailsMap = [
  [{
    type: () => {
      return <>
        <span className='label'>注册类型:</span>
        <span className='labelVal'>碳汇项目</span>
      </>;
    }
  }],
  [{
    // name: '资产名称',
    name: (v) => {
      return <>
        <span className='label'>资产名称:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }, {
    lifetime: '资产年限'
  }],
  [{
    projectName: '项目名称'
  }, {
    proponent: '发起人'
  }],
  [{
    max_supply: (v) => {
      return <>
        <span className='label'>碳汇总数:</span>
        <span className='labelVal'>{resolveAmountNumber(v || 0)}</span>
      </>;
    }
    // render (v) {
    //   return ['碳汇总数', resolveAmountNumber(v)];
    // }
  }, {
    // annualEmissionCuts: '预估年减排量',
    annualEmissionCuts: (v) => {
      return <>
        <span className='label'>预估年减排量:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
      // return ['预估年减排量', resolveAmountNumber(v)];
    }
  }],
  [{
    registerDate: '注册日期'
  }],
  [{
    projectStartDate: '项目起始日期'
  }, {
    projectEndDate: '项目终止日期'
  }],
  [{
    standard: '碳汇标准'
  }],
  [{
    projectType: '项目类型'
  }, {
    methodology: '采用方法学'
  }],
  [{
    certificateUrl: '其他证书链接'
  }, {
    validator: '第三方验证'
  }],
  [{
    registry: '注册处'
  }],
  [{
    registryId: '注册处ID'
  }, {
    status: '状态'
  }],
  [{
    gps: 'GPS坐标'
  }],
  [{
    country: '所在国家'
  }],
  [{
    province: '省份'
  }, {
    city: '城市'
  }], [{
    website: '项目网站'
  }, {
    projectInformationUrl: '项目资料链接'
  }], [{
    projectDoc: '项目报告'
  }, {
    projectPhotosUrl: '项目照片'
  }], [{
    remark: '备注'
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
      const result = await queryProject(api, projectId);

      console.log('result', result);

      updateProjectInfo({
        ...result.project,
        ...result.additionals
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
                        <span className='label'>{val[itemKey as number]}:</span>
                        <span className='labelVal'>{projectInfo[itemKey] || '-'}</span>
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
          subjectId={`asset_${projectId}`}
        />
      </Panel>
    </div>
  );
};

export default ProjectDetail;
