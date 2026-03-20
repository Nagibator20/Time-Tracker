export interface Tab {
  id: string;
  name: string;
  year: number;
  month: number;
  orderIndex: number;
  isReportTab: boolean;
  createdAt: string;
}

export interface TabInput {
  name: string;
  year: number;
  month: number;
}
