import { describe, it, expect } from 'vitest';
import { validateTime, validateTimeRange, validateHourlyRate } from './validators';

describe('validateTime', () => {
  it('should accept empty string', () => {
    const result = validateTime('');
    expect(result.isValid).toBe(true);
  });

  it('should accept valid time format HH:MM', () => {
    expect(validateTime('09:00').isValid).toBe(true);
    expect(validateTime('23:59').isValid).toBe(true);
    expect(validateTime('00:00').isValid).toBe(true);
  });

  it('should accept 4-digit compact format', () => {
    expect(validateTime('0900').isValid).toBe(true);
    expect(validateTime('2359').isValid).toBe(true);
  });

  it('should reject invalid hour', () => {
    expect(validateTime('25:00').isValid).toBe(false);
    expect(validateTime('-1:00').isValid).toBe(false);
  });

  it('should reject invalid minutes', () => {
    expect(validateTime('09:60').isValid).toBe(false);
    expect(validateTime('09:99').isValid).toBe(false);
  });

  it('should reject invalid format', () => {
    expect(validateTime('09:0').isValid).toBe(false);
    expect(validateTime('invalid').isValid).toBe(false);
  });

  it('should normalize 4-digit compact format', () => {
    expect(validateTime('0900').formatted).toBe('09:00');
    expect(validateTime('1200').formatted).toBe('12:00');
  });
});

describe('validateTimeRange', () => {
  it('should accept valid range', () => {
    expect(validateTimeRange('09:00', '18:00').isValid).toBe(true);
  });

  it('should reject if timeOut is before timeIn (same day)', () => {
    const result = validateTimeRange('18:00', '09:00');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Время ухода должно быть позже времени прихода');
  });

  it('should accept if either time is empty', () => {
    expect(validateTimeRange('', '18:00').isValid).toBe(true);
    expect(validateTimeRange('09:00', '').isValid).toBe(true);
  });

  it('should reject if times are equal', () => {
    const result = validateTimeRange('09:00', '09:00');
    expect(result.isValid).toBe(false);
  });

  it('should reject invalid time format', () => {
    expect(validateTimeRange('invalid', '18:00').isValid).toBe(false);
    expect(validateTimeRange('09:00', 'invalid').isValid).toBe(false);
  });

  it('should accept night shift (next day)', () => {
    expect(validateTimeRange('22:00', '06:00').isValid).toBe(true);
    expect(validateTimeRange('23:00', '07:00').isValid).toBe(true);
  });

  it('should reject if timeOut is too far from timeIn (more than 12h)', () => {
    expect(validateTimeRange('08:00', '06:00').isValid).toBe(false);
  });
});

describe('validateHourlyRate', () => {
  it('should accept empty string as 0', () => {
    const result = validateHourlyRate('');
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('0');
  });

  it('should accept valid positive numbers', () => {
    expect(validateHourlyRate('100').isValid).toBe(true);
    expect(validateHourlyRate('50.50').isValid).toBe(true);
    expect(validateHourlyRate('0').isValid).toBe(true);
  });

  it('should reject negative numbers', () => {
    expect(validateHourlyRate('-100').isValid).toBe(false);
    expect(validateHourlyRate('-0.5').isValid).toBe(false);
  });

  it('should reject non-numeric strings', () => {
    expect(validateHourlyRate('abc').isValid).toBe(false);
  });
});
