import { describe, it, expect, beforeEach } from 'vitest';
import { TimeCalculator } from './timeCalculator';

describe('TimeCalculator', () => {
  let calculator: TimeCalculator;

  beforeEach(() => {
    calculator = new TimeCalculator(8, 100, 1.5);
  });

  describe('calculateHours', () => {
    it('should calculate hours correctly with lunch break', () => {
      calculator.setLunchDuration(1);
      expect(calculator.calculateHours('09:00', '18:00')).toBe(8);
    });

    it('should calculate hours for short day', () => {
      calculator.setLunchDuration(1);
      expect(calculator.calculateHours('09:00', '14:00')).toBe(4);
    });

    it('should handle night shift (next day)', () => {
      calculator.setLunchDuration(1);
      const hours = calculator.calculateHours('22:00', '06:00');
      expect(hours).toBe(7);
    });

    it('should return 0 for invalid time', () => {
      expect(calculator.calculateHours('invalid', '18:00')).toBe(0);
      expect(calculator.calculateHours('09:00', 'invalid')).toBe(0);
    });

    it('should work without lunch duration', () => {
      calculator.setLunchDuration(0);
      expect(calculator.calculateHours('09:00', '17:00')).toBe(8);
    });
  });

  describe('calculateOvertime', () => {
    it('should calculate overtime correctly', () => {
      expect(calculator.calculateOvertime(10)).toBe(2);
      expect(calculator.calculateOvertime(8)).toBe(0);
      expect(calculator.calculateOvertime(6)).toBe(0);
    });

    it('should handle decimal hours', () => {
      expect(calculator.calculateOvertime(8.5)).toBe(0.5);
    });
  });

  describe('calculateUndertime', () => {
    it('should calculate undertime correctly', () => {
      expect(calculator.calculateUndertime(6)).toBe(2);
      expect(calculator.calculateUndertime(8)).toBe(0);
      expect(calculator.calculateUndertime(10)).toBe(0);
    });
  });

  describe('calculateDailyEarnings', () => {
    it('should calculate earnings for regular hours', () => {
      calculator.setHourlyRate(200);
      calculator.setStandardHours(8);
      expect(calculator.calculateDailyEarnings(8)).toBe(1600);
    });

    it('should calculate earnings with overtime', () => {
      calculator.setHourlyRate(100);
      calculator.setStandardHours(8);
      // 10 hours: 8 regular + 2 overtime
      // 8 * 100 + 2 * 150 = 800 + 300 = 1100
      expect(calculator.calculateDailyEarnings(10)).toBe(1100);
    });

    it('should return 0 for zero hours', () => {
      expect(calculator.calculateDailyEarnings(0)).toBe(0);
    });
  });

  describe('getStatusType', () => {
    it('should return correct status types', () => {
      expect(calculator.getStatusType(0)).toBe('empty');
      expect(calculator.getStatusType(6)).toBe('undertime');
      expect(calculator.getStatusType(8)).toBe('normal');
      expect(calculator.getStatusType(10)).toBe('overtime');
    });
  });

  describe('setters', () => {
    it('should update settings correctly', () => {
      calculator.setStandardHours(7);
      calculator.setHourlyRate(150);
      calculator.setLunchDuration(0.5);

      expect(calculator.calculateDailyEarnings(7)).toBe(1050);
    });
  });
});
