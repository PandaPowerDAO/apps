// [object Object]
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
export interface AnyObj {
  [key: string]: string | number | undefined
}

export interface PaginationType {
  current: number,
  total?: number,
  pageSize: number,
}
