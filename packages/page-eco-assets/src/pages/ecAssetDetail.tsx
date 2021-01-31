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
import { queryProject, queryAsset } from '@eco/eco-utils/service';
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
  [key: string]: string | number
}

const DetailsMap = [
  [{
    // name: '资产名称',
    projectName: (v, t) => {
      return <>
        <span className='label'>{t<string>('碳汇项目')}:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }],
  [{
    // name: '资产名称',
    name: (v, t) => {
      return <>
        <span className='label'>{t<string>('资产代码')}:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }, {
    vintage: (v, t) => {
      return <>
        <span className='label'>{t<string>('资产年份')}:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }],
  [{
    initial_supply: (v, t) => {
      return <>
        <span className='label'>{t<string>('资产上限')}:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
    }
  }, {
    initial_supply: (v, t) => {
      return <>
        <span className='label'>{t<string>('碳汇资产上链数量')}:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
    }
  }],
  [{
    // verifier: '第三方核查者'
    verifier: (v, t) => {
      return <>
        <span className='label'>{t<string>('第三方核查机构')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  [{
    // projectDoc: '签发报告'
    projectDoc: (v, t) => {
      return <>
        <span className='label'>{t<string>('核查报告')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
    // extraCertificate: '额外签发证书'
    extraCertificate: (v, t) => {
      return <>
        <span className='label'>{t<string>('其他报告')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],

  [{
    issuanceDate: (v, t) => {
      // 碳汇签发日期
      return <>
        <span className='label'>{t<string>('碳汇签发日期')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  // [{
  //   startDate: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('碳汇起始日期')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  //   // 碳汇起始日期
  //   // render (v) {
  //   //   return ['碳汇总数', resolveAmountNumber(v)];
  //   // }
  // }, {
  //   // annualEmissionCuts: '预估年减排量',
  //   endDate: (v, t) => {
  //     // 碳汇终止日期
  //     return <>
  //       <span className='label'>{t<string>('碳汇终止日期')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }],
  // [ {
  //   // verifyDate: '第三方核时间'
  //   verifyDate: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('第三方核时间')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }
  // ],
  // [{
  //   // issuanceNumbers: '碳汇签发次数'
  //   issuanceNumbers: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('碳汇签发次数')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }],

  [{
    // proof: '碳汇转入证明'
    proof: (v, t) => {
      return <>
        <span className='label'>{t<string>('碳汇转入证明')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  [{
    // proof: '碳汇转入证明'
    proofAccountName: (v, t) => {
      return <>
        <span className='label'>{t<string>('碳汇转出账户名称')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  [{
    // remark: '描述'
    remark: (v, t) => {
      return <>
        <span className='label'>{t<string>('描述')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }]
];

const ProjectDetail = () => {
  const [projectInfo, updateProjectInfo] = useState<ProjectDetail>({});

  const location = useLocation();
  const queryObj = parseQuery(location.search || '') || {};
  const { id: projectId, proposalId, state, name } = queryObj;

  const { api } = useApi();
  const { t } = useTranslation('page-eco-assets');

  useEffect(() => {
    _queryDetail();

    async function _queryDetail () {
      const result = await queryAsset(api, projectId);
      let projectResult = {};

      if (result && result.asset && result.asset.project_id) {
        projectResult = await queryProject(api, result?.asset?.project_id);
      }

      console.log('result', projectResult);

      // updateProjectInfo({
      //   ...result.project,
      //   ...result.additionals,
      // });

      console.log('asset', result);

      updateProjectInfo({
        ...result.additionals,
        ...result.asset,
        name,
        projectName: projectResult?.additionals?.projectName || ''
      });
    }
  }, []);

  return (
    <div>
      <Panel>
        <DetailHeader>
          <div>{t<string>('碳汇资产详情页')}</div>
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
                        <span className='labelVal'>{projectInfo[itemKey] || '-'}</span>
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
