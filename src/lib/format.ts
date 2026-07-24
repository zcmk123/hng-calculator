/**
 * 数字 / 字符串格式化辅助。
 */

export const fmt = (n: number, d = 0): string =>
  Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })

/** 千分位逗号格式化（与原站 toLocaleString 一致）。 */
export const fmtInt = (n: number): string => fmt(n, 0)
