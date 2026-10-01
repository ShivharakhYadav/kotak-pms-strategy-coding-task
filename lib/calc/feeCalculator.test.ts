import { describe, expect, it } from "vitest";
import { calculateFee, validateCalculatorInput, MAX_INVESTMENT_AMOUNT } from "./feeCalculator";

describe("validateCalculatorInput", () => {
  it("rejects an empty amount", () => {
    expect(validateCalculatorInput("", 1).valid).toBe(false);
  });

  it("rejects a non-numeric amount", () => {
    expect(validateCalculatorInput("abc", 1).errors.amount).toBeDefined();
  });

  it("rejects a negative amount", () => {
    expect(validateCalculatorInput("-100", 1).errors.amount).toBeDefined();
  });

  it("rejects a zero amount", () => {
    expect(validateCalculatorInput("0", 1).errors.amount).toBeDefined();
  });

  it("rejects an amount above the sane ceiling", () => {
    expect(validateCalculatorInput(String(MAX_INVESTMENT_AMOUNT + 1), 1).errors.amount).toBeDefined();
  });

  it("rejects zero or negative years", () => {
    expect(validateCalculatorInput("1000", 0).errors.years).toBeDefined();
    expect(validateCalculatorInput("1000", -1).errors.years).toBeDefined();
  });

  it("accepts valid input", () => {
    expect(validateCalculatorInput("100000", 3)).toEqual({ valid: true, errors: {} });
  });
});

describe("calculateFee", () => {
  it("matches the brief's formulas at 1 year (no exit load)", () => {
    const result = calculateFee(100000, 1, 17.9);
    expect(result.grossValue).toBeCloseTo(117900, 5);
    expect(result.managementFee).toBeCloseTo(2000, 5);
    expect(result.exitLoad).toBe(0);
    expect(result.netValue).toBeCloseTo(115900, 5);
  });

  it("compounds correctly over multiple years", () => {
    const result = calculateFee(100000, 10, 17.9);
    expect(result.grossValue).toBeCloseTo(100000 * Math.pow(1.179, 10), 5);
    expect(result.managementFee).toBeCloseTo(20000, 5);
    expect(result.exitLoad).toBe(0);
  });

  it("applies the 1% exit load only when years < 1", () => {
    const result = calculateFee(100000, 0.5, 17.9);
    expect(result.exitLoad).toBeCloseTo(1000, 5);
    expect(result.netValue).toBeCloseTo(result.grossValue - result.managementFee - 1000, 5);
  });

  it("applies zero exit load at exactly 1 year", () => {
    expect(calculateFee(100000, 1, 10).exitLoad).toBe(0);
  });
});
