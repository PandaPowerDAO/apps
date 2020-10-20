// // Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// // SPDX-License-Identifier: Apache-2.0
// /* eslint-disable */

// import React, { useCallback } from 'react';
// import { BareProps } from '@polkadot/react-components/types';
// import { Dropdown } from '@polkadot/react-components';
// // import { FormItemProps } from 'antd/lib/form/FormItem';
// // import { IDropdown } from '@polkadot/react-components/Dropdown';

// interface Props extends BareProps {
//   onChange: (e: any) => void,

// }

// function NDropdown ({ children, ...rest }: Props): React.ReactElement<Props> {
//   const hanldeChange = useCallback((value) => {
//     if (rest.onChange) {
//       rest.onChange(value);
//     }
//   }, [rest.onChange]);

//   return (
//     <Dropdown {...rest}
//       onChange={hanldeChange}>
//       {children}
//     </Dropdown>
//   );
// }
