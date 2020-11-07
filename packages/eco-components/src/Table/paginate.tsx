// // Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// // SPDX-License-Identifier: Apache-2.0

// /* eslint-disable @typescript-eslint/ban-ts-comment */

// import React, { useCallback, useEffect, useState } from 'react';
// // import { Table } from '@polkadot/react-components';
// import { BareProps } from '@polkadot/react-components/types';
// import styled from 'styled-components';
// // import clsx from 'clsx';

// interface Props extends BareProps{
//   pageSize?: number,
//   total: number,
//   curPage: number,
//   onChange?: (nextPage: number) => any
// }

// type StringOrNumber = string | number;

// type TypePageItem = {
//   tar?: StringOrNumber,
//   cur: StringOrNumber
// }

// const PageItem = styled.span`
//   padding: 4px 7px;
//   cursor: pointer;
// `;

// function Pagination ({ pageSize = 12, total = 0, curPage = 1, onChange }: Props): React.ReactElement<Props> {
//   const pages = Math.floor(total / pageSize) + 1;

//   const [middleNum, setMiddleNum] = useState(0);

//   useEffect(() => {
//     if (pages > 7) {
//       const _middle = Math.floor(pages / 2);

//       setMiddleNum(_middle);
//     }
//   }, [pages]);

//   let _pageArr: any[] = [];

//   const _pageItemDefault = {
//     isPrev: false,
//     isNext: false
//   };

//   if (pages < 7) {
//     _pageArr = new Array(pages).fill(1).map((v, idx) => {
//       return {
//         cur: idx
//       };
//     });
//   } else {
//     const _middle = Math.floor(pages / 2);

//     _pageArr = [{
//       cur: 1
//     }, {
//       cur: '...',
//       tar: _middle - 2
//     }, {
//       cur: _middle - 1
//     }, {
//       cur: _middle
//     }, {
//       cur: _middle + 1
//     }, {
//       cur: '...',
//       tar: _middle + 2
//     }, {
//       ..._pageItemDefault,
//       cur: pages
//     }];
//   }

//   // const _pageArr = useMemo(() => {

//   // }, [middleNum, pages]);

//   console.log('_pageArr', _pageArr);

//   const handlePageChange = useCallback((e: React.MouseEvent): void => {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     // @ts-ignore
//     const _targetPage = e.target.dataset.page;

//     console.log(_targetPage);

//     // onChange(_targetPage);
//   }, []);

//   return <div style={{ textAlign: 'right' }}>
//     {_pageArr.map((v: TypePageItem, idx: number) => {
//       return <PageItem
//         data-page={v.tar || v.cur}
//         key={`${idx}`}
//         onClick={handlePageChange}>
//         {v.cur}
//       </PageItem>;
//     })}
//   </div>;
// }

// export default Pagination;
