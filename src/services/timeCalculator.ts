import { StatusType } from '../types';
import { parseTime } from './dateUtils';

export class TimeCalculator {
  private standardHours: number;
  private hourlyRate: number;
  private overtimeMultiplier: number;
  private lunchDuration: number;

  constructor(standardHours: number = 8, hourlyRate: number = 0, overtimeMultiplier: number = 1.0) {
    this.standardHours = standardHours;
    this.hourlyRate = hourlyRate;
    this.overtimeMultiplier = overtimeMultiplier;
    this.lunchDuration = 1;
  }

  setStandardHours(hours: number): void {
    this.standardHours = hours;
  }

  setHourlyRate(rate: number): void {
    this.hourlyRate = rate;
  }

  setLunchDuration(hours: number): void {
    this.lunchDuration = hours;
  }

  calculateHours(timeIn: string, timeOut: string): number {
    const inTime = parseTime(timeIn);
    const outTime = parseTime(timeOut);
    
    if (!inTime || !outTime) return 0;

    let inTotalMinutes = inTime.hours * 60 + inTime.minutes;
    let outTotalMinutes = outTime.hours * 60 + outTime.minutes;

    // Support for night shifts: if out time is before in time, it's the next day
    if (outTotalMinutes < inTotalMinutes) {
      outTotalMinutes += 24 * 60;
    }

    const totalHours = (outTotalMinutes - inTotalMinutes) / 60;
    const workHours = Math.max(0, totalHours - this.lunchDuration);
    
    return Math.round(workHours * 100) / 100;
  }

  calculateOvertime(hoursWorked: number): number {
    return Math.max(0, Math.round((hoursWorked - this.standardHours) * 100) / 100);
  }

  calculateUndertime(hoursWorked: number): number {
    return Math.max(0, Math.round((this.standardHours - hoursWorked) * 100) / 100);
  }

  getOvertimeRate(): number {
    return this.hourlyRate * this.overtimeMultiplier;
  }

  calculateDailyEarnings(hoursWorked: number): number {
    if (hoursWorked <= 0) return 0;
    const overtime = this.calculateOvertime(hoursWorked);
    const regularHours = hoursWorked - overtime;
    const overtimeRate = this.getOvertimeRate();
    
    return Math.round((regularHours * this.hourlyRate + overtime * overtimeRate) * 100) / 100;
  }

  getStatusType(hoursWorked: number): StatusType {
    if (hoursWorked === 0) return 'empty';
    if (hoursWorked > this.standardHours) return 'overtime';
    if (hoursWorked < this.standardHours) return 'undertime';
    return 'normal';
  }
}


