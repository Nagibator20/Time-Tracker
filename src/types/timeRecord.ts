export interface TimeRecord {
  id: string;
  tabId: string;
  date: string;
  dayOfWeek: number;
  timeIn: string | null;
  timeOut: string | null;
  hoursWorked: number;
  overtimeHours: number;
  undertimeHours: number;
  dailyEarnings: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeRecordInput {
  timeIn?: string;
  timeOut?: string;
  comment?: string;
}
