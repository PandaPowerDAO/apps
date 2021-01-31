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
    type: (a, t) => {
      return <>
        <span className='label'>{t<string>('注册类型')}:</span>
        <span className='labelVal'>{t<string>('碳汇项目')}</span>
      </>;
    }
  }, {
    proponent: (a, t) => {
      return <>
        <span className='label'>{t<string>('项目发起人')}:</span>
        <span className='labelVal'>{t<string>(a)}</span>
      </>;
    }
  }],
  [{
    // projectName: '项目名称'
    projectName: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目名称')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
    // name: '资产名称',
    name: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目代码')}:</span>
        <span className='labelVal'>{fromHex(v)}</span>
      </>;
    }
  }

    // {
    //   // lifetime: '资产年限'
    //   lifetime: (v, t) => {
    //     return <>
    //       <span className='label'>{t<string>('资产年限')}:</span>
    //       <span className='labelVal'>{v}</span>
    //     </>;
    //   }
    // }

  ],
  [{
    max_supply: (v, t) => {
      return <>
        <span className='label'>{t<string>('碳汇总数')}:</span>
        <span className='labelVal'>{resolveAmountNumber(v || 0)}</span>
      </>;
    }
  // render (v) {
  //   return ['碳汇总数', resolveAmountNumber(v)];
  // }
  }, {
  // annualEmissionCuts: '预估年减排量',
    annualEmissionCuts: (v, t) => {
      return <>
        <span className='label'>{t<string>('预估年减排量')}:</span>
        <span className='labelVal'>{resolveAmountNumber(v)}</span>
      </>;
    // return ['预估年减排量', resolveAmountNumber(v)];
    }
  }],
  [{
  // registerDate: '注册日期'
    registerNumber: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目注册编号')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
  // registerDate: '注册日期'
    registerDate: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目注册日期')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  // [{
  //   // projectName: '项目名称'
  //   projectName: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('项目名称')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }, {
  //   // proponent: '发起人'
  //   projectName: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('发起人')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }],

  // [{
  //   // registerDate: '注册日期'
  //   registerDate: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('注册日期')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }],
  [{
    // projectStartDate: '项目起始日期'
    projectStartDate: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目起始日期')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
    // projectEndDate: '项目终止日期'
    projectEndDate: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目终止日期')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  [{
    // standard: '碳汇标准'
    standard: (v, t) => {
      return <>
        <span className='label'>{t<string>('碳汇标准')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
    // methodology: '采用方法学'
    methodology: (v, t) => {
      return <>
        <span className='label'>{t<string>('采用方法学')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  [{
    // projectType: '项目类型'
    projectType: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目类型')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
    // methodology: '采用方法学'
    addtionalRemarks: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目类型补充说明')}:</span>
        <span className='labelVal'>{v || '/'}</span>
      </>;
    }
  }],
  [{
    // certificateUrl: '其他证书链接'
    certificateUrl: (v, t) => {
      return <>
        <span className='label'>{t<string>('其他证书链接')}:</span>
        <span className='labelVal'>{v || '/'}</span>
      </>;
    }
  }, {
    // validator: '第三方验证'
    validator: (v, t) => {
      return <>
        <span className='label'>{t<string>('第三方核查机构')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }],
  // [{
  //   // registry: '注册处'
  //   registry: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('注册处')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }],
  // [{
  //   // registryId: '注册处ID'
  //   registryId: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('注册处ID')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }, {
  //   // status: '状态'
  //   status: (v, t) => {
  //     return <>
  //       <span className='label'>{t<string>('状态')}:</span>
  //       <span className='labelVal'>{v}</span>
  //     </>;
  //   }
  // }],
  [{
    // gps: 'GPS坐标'
    gps: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目GPS坐标')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }, {
    // country: '所在国家'
    country: (v, t) => {
      return <>
        <span className='label'>{t<string>('所在国家')}:</span>
        <span className='labelVal'>{v || '/'}</span>
      </>;
    }
  }],
  [{
    // province: '省份'
    province: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目所在省份')}:</span>
        <span className='labelVal'>{v || '/'}</span>
      </>;
    }
  }, {
    // city: '城市'
    city: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目所在城市')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }], [{
    // website: '项目网站'
    website: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目网站')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  },
  {
    // projectDoc: '项目报告'
    projectDoc: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目报告')}:</span>
        <span className='labelVal'>{v || '/'}</span>
      </>;
    }
  }
  ], [
    {
    // projectInformationUrl: '项目资料链接'
      projectInformationUrl: (v, t) => {
        return <>
          <span className='label'>{t<string>('项目资料链接')}:</span>
          <span className='labelVal'>{v || '/'}</span>
        </>;
      }
    },
    {
    // projectPhotosUrl: '项目照片'
      projectPhotosUrl: (v, t) => {
        return <>
          <span className='label'>{t<string>('项目照片')}:</span>
          <span className='labelVal'>{v || '/'}</span>
        </>;
      }
    }], [{
    // remark: '备注'
    remark: (v, t) => {
      return <>
        <span className='label'>{t<string>('项目介绍')}:</span>
        <span className='labelVal'>{v}</span>
      </>;
    }
  }]
];

const ProjectDetail = () => {
  const [projectInfo, updateProjectInfo] = useState<ProjectDetail>({});
  const { t } = useTranslation('page-eco-assets');
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
          <div>{t<string>('碳汇项目详情页')}</div>
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
                        <span className='label'>{val[itemKey as number]}:</span>
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
          subjectId={`asset_${projectId}`}
        />
      </Panel>
    </div>
  );
};

export default ProjectDetail;
