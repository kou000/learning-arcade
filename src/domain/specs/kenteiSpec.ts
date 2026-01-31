import type { Grade, GradeSpec } from "./types";

/**
 * 1〜10級の出題枠（桁・題数・時間）をデータ化。
 * 出典：全国珠算技能検定試験要項（級別一覧）
 * https://shuzan-gakko.com/kentei/images/entry001.pdf
 *
 * 注：
 * - 伝票算は 1〜3級のみ
 * - 伝票算の体裁は地域/教材差が出やすいので、このアプリではまず「大きめ桁の加算」として練習できる形で提供
 */
export const KENTEI_SPEC: Record<Grade, GradeSpec> = {
  1:  { mul:{digitsSum:11,count:20,minutes:10}, div:{digitsSum:10,count:20,minutes:10}, mitori:{digitsMin:6,digitsMax:10,count:10,minutes:8,terms:10}, denpyo:{digitsMin:5,digitsMax:9,count:10,minutes:8,terms:10,chars:75}},
  2:  { mul:{digitsSum:9,count:20,minutes:10},  div:{digitsSum:8,count:20,minutes:10},  mitori:{digitsMin:5,digitsMax:7,count:10,minutes:8,terms:10},  denpyo:{digitsMin:5,digitsMax:7,count:10,minutes:8,terms:10,chars:60}},
  3:  { mul:{digitsSum:7,count:20,minutes:10},  div:{digitsSum:6,count:20,minutes:10},  mitori:{digitsMin:3,digitsMax:6,count:10,minutes:8,terms:10},  denpyo:{digitsMin:3,digitsMax:6,count:10,minutes:8,terms:10,chars:40}},
  4:  { mul:{digitsSum:7,count:20,minutes:10},  div:{digitsSum:6,count:20,minutes:10},  mitori:{digitsMin:3,digitsMax:5,count:10,minutes:8,terms:10}},
  5:  { mul:{digitsSum:6,count:20,minutes:10},  div:{digitsSum:5,count:20,minutes:10},  mitori:{digitsMin:3,digitsMax:4,count:10,minutes:8,terms:10}},
  6:  { mul:{digitsSum:5,count:20,minutes:10},  div:{digitsSum:4,count:20,minutes:10},  mitori:{digitsMin:2,digitsMax:3,count:10,minutes:8,terms:10}},
  7:  { mul:{digitsSum:4,count:20,minutes:10},  div:{digitsSum:4,count:20,minutes:10},  mitori:{digitsMin:2,digitsMax:2,count:10,minutes:8,terms:10}},
  8:  { mul:{digitsSum:4,count:20,minutes:10},  div:{digitsSum:3,count:20,minutes:10},  mitori:{digitsMin:2,digitsMax:2,count:10,minutes:8,terms:7}},
  9:  { mul:{digitsSum:3,count:20,minutes:10},  div:{digitsSum:3,count:20,minutes:10},  mitori:{digitsMin:1,digitsMax:2,count:10,minutes:8,terms:7}},
  10: { mul:{digitsSum:3,count:20,minutes:10},  div:{digitsSum:3,count:20,minutes:10},  mitori:{digitsMin:1,digitsMax:1,count:10,minutes:8,terms:7}},
};
