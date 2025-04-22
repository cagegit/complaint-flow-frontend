// 	数据来源
export enum SourceTypeEnum {
  // 本地
  LOCAL = 0,
  // 区分转
  DISTRICT = 1,
  // 直派
  DIRECT = 2,
}

// 	数据来源
export const SourceTypeNameMap = {
  // 本地
  [SourceTypeEnum.LOCAL]: '本地',
  // 区分转
  [SourceTypeEnum.DISTRICT]: '区分转',
  // 直派
  [SourceTypeEnum.DIRECT]: '直派',
};

// 时间类型
export enum RangeTypeEnum {
  // 期
  MONTH = 1,
  // 年
  YEAR = 2,
}

export const RomplaintTypeTabs = [
  {
    value: RangeTypeEnum.MONTH,
    label: '期',
  },
  {
    value: RangeTypeEnum.YEAR,
    label: '年',
  },
];

// 单位
export enum UnitTypeEnum {
  //   科室
  DEPT = 1,
  //   管区
  AREA = 2,
  //   社区
  COMMUNITY = 3,
}

// 	数据来源
export const UnitTypeNameMap = {
  // 本地
  [UnitTypeEnum.DEPT]: '科室',
  // 区分转
  [UnitTypeEnum.AREA]: '管区',
  // 直派
  [UnitTypeEnum.COMMUNITY]: '社区',
};
