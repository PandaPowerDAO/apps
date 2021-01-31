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
import { queryProject, queryBurn, queryAsset, queryIssue } from '@eco/eco-utils/service';
import { map as lodashMap } from 'lodash';
import Voting from '../components/Voting';
import { Icon } from '@polkadot/react-components';
import { useTranslation } from '@eco/eco-utils/translate';

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
    name: (v, t) => {
      return <>
        <span className='label'>{t<string>('资产')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
    vintage: (v, t) => {
      return <>
        <span className='label'>{t<string>('资产年限')}:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }],
  [{
    // annualEmissionCuts: '预估年减排量',
    initial_supply: (v, t) => {
      return <>
        <span className='label'>{t<string>('资产上限')}:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
      // return ['{t<string>('预估年减排量')}', resolveAmountNumber(v)];
    }
  }, {
    // annualEmissionCuts: '{t<string>('预估年减排量')}',
    total_supply: (v, t) => {
      return <>
        <span className='label'>{t<string>('已发行总量')}:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
      // return ['{t<string>('预估年减排量')}', resolveAmountNumber(v)];
    }
  }],
  [{
    amount: (v, t) => {
      return <>
        <span className='label'>{t<string>('申请增发数量')}:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
    }
  }],
  [{
    proof: (v, t) => {
      return <>
        <span className='label'>{t<string>('碳汇转入证明')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  [{
    remark: (v, t) => {
      return <>
        <span className='label'>{t<string>('描述')}:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }]
];

const ProjectDetail = () => {
  const [projectInfo, updateProjectInfo] = useState<ProjectDetail>({});
  const { t } = useTranslation('page-eco-assets');
  const location = useLocation();
  const queryObj = parseQuery(location.search || '') || {};
  const { id: projectId, proposalId, state, name } = queryObj;

  const { api } = useApi();

  useEffect(() => {
    _queryDetail();

    async function _queryDetail () {
      const result = await queryIssue(api, projectId);
      let assetDetail = {};

      if (result && result.asset_id) {
        assetDetail = await queryAsset(api, result.asset_id);
      }

      updateProjectInfo({
        // ...assetDetail.asset,
        // ...assetDetail.additional,
        ...(result as Record<string, any> || {}),
        ...result.additional,
        name: name,
        vintage: assetDetail.asset.vintage,
        initial_supply: assetDetail.asset.initial_supply,
        // max_supply: assetDetail.,
        total_supply: assetDetail.asset.total_supply
      });
    }
  }, []);

  return (
    <div>
      <Panel>
        <DetailHeader>
          <div>{t<string>('增发碳汇资产详情页')}</div>
          <div>
            <Icon icon='reply'
              onClick={() => window.history.go(-1)}></Icon>
          </div>
        </DetailHeader>
      </Panel>
      <Panel title={t<string>('项目信息')}>
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
                    ) : val[itemKey](projectInfo[itemKey], t)
                  }

                </Col>;
              })}
            </Row>;
          })
        }
      </Panel>
      <Panel title={t<string>('投票情况')}>
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
