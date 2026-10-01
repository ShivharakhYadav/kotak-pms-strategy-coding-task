export const MAX_INVESTMENT_AMOUNT = 1_000_000_000; // ₹100 crore — sane UI ceiling, not a business rule

export const HOLDING_PERIODS_YEARS = [1, 3, 5, 10] as const;
export type HoldingPeriodYears = (typeof HOLDING_PERIODS_YEARS)[number];

const ANNUAL_MANAGEMENT_FEE_RATE = 0.02;
const EXIT_LOAD_RATE = 0.01;

export interface CalculatorValidationErrors {
  amount?: string;
  years?: string;
}

export interface CalculatorValidationResult {
  valid: boolean;
  errors: CalculatorValidationErrors;
}

/**
 * Validates raw calculator input before it's trusted by calculateFee().
 * amount stays a string here since it mirrors the controlled input's typing
 * state (which must tolerate "", "-", partial numbers, etc).
 */
export function validateCalculatorInput(
  amountInput: string,
  years: number
): CalculatorValidationResult {
  const errors: CalculatorValidationErrors = {};
  const trimmed = amountInput.trim();

  if (trimmed === "") {
    errors.amount = "Enter an investment amount.";
  } else {
    const amount = Number(trimmed);
    if (!Number.isFinite(amount)) {
      errors.amount = "Enter a valid number.";
    } else if (amount <= 0) {
      errors.amount = "Amount must be greater than zero.";
    } else if (amount > MAX_INVESTMENT_AMOUNT) {
      errors.amount = `Amount must be at most ₹${MAX_INVESTMENT_AMOUNT.toLocaleString("en-IN")}.`;
    }
  }

  if (!Number.isFinite(years) || years <= 0) {
    errors.years = "Select a valid holding period.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export interface FeeBreakdown {
  grossValue: number;
  managementFee: number;
  exitLoad: number;
  netValue: number;
}

/**
 * Pure projection per the brief's exact formulas. Callers must validate
 * inputs first (see validateCalculatorInput) — this does not re-validate.
 */
export function calculateFee(
  amount: number,
  years: number,
  strategyReturnPercent: number
): FeeBreakdown {
  const grossValue = amount * Math.pow(1 + strategyReturnPercent / 100, years);
  const managementFee = amount * ANNUAL_MANAGEMENT_FEE_RATE * years;
  const exitLoad = years < 1 ? amount * EXIT_LOAD_RATE : 0;
  const netValue = grossValue - managementFee - exitLoad;

  return { grossValue, managementFee, exitLoad, netValue };
}
