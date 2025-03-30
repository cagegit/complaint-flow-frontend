export interface ComplaintItem {
  id: string;
  caseNumber: string;
  title: string;
  mainContent: string;
  receiveStatus: ReceiveStatus;
  sourceType: SourceType;
  monitorType: MonitorType;
  keywords: string;
  workOrderNumber: string;
  startImportTime: string;
  endImportTime: string;
  startSendTime: string;
  endSendTime: string;
  createTime: string;
  updateTime: string;
}

export interface QueryParams {
  caseNumber?: string;
  endImportTime?: string;
  endSendTime?: string;
  keywords?: string;
  mainContent?: string;
  monitorType?: MonitorType;
  orderColumn?: string;
  pageNum: number;
  pageSize: number;
  receiveStatus?: ReceiveStatus;
  sort?: SortOrder;
  sourceType?: SourceType;
  start?: number;
  startImportTime?: string;
  startSendTime?: string;
  title?: string;
  workOrderNumber?: string;
}

export interface PaginationConfig {
  total: number;
  current: number;
  pageSize: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
}

export interface ResponseData {
  list: ComplaintItem[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// Enums
export enum ReceiveStatus {
  RECEIVED = 1,
  NO = 2,
}

export enum SourceType {
  GOVERNMENT = 1,
  MEDIA = 2,
  PUBLIC = 3,
  OTHER = 4,
}

export enum MonitorType {
  IMPORTANT = 1,
  NORMAL = 2,
  LOW = 3,
}

export enum SortOrder {
  ASCENDING = 1,
  DESCENDING = 0,
}
