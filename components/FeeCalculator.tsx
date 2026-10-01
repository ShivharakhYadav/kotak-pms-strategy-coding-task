"use client";

import { useId, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import {
  HOLDING_PERIODS_YEARS,
  calculateFee,
  validateCalculatorInput,
  type HoldingPeriodYears,
} from "@/lib/calc/feeCalculator";

interface FeeCalculatorProps {
  strategyReturn: number;
  returnLabel: string;
}

export function FeeCalculator({ strategyReturn, returnLabel }: FeeCalculatorProps) {
  const [amountInput, setAmountInput] = useState("100000");
  const [years, setYears] = useState<HoldingPeriodYears>(1);

  const amountInputId = useId();
  const yearsId = useId();
  const amountErrorId = useId();
  const yearsErrorId = useId();

  const { valid, errors } = useMemo(
    () => validateCalculatorInput(amountInput, years),
    [amountInput, years]
  );

  const breakdown = useMemo(() => {
    if (!valid) return null;
    return calculateFee(Number(amountInput), years, strategyReturn);
  }, [valid, amountInput, years, strategyReturn]);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">Fee Calculator</h2>
      <p className="mt-1 text-sm text-gray-500">
        Projection based on the {returnLabel.toLowerCase()} strategy return of{" "}
        {strategyReturn.toFixed(2)}%. 2% annual management fee; 1% exit load if redeemed
        within 1 year.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={amountInputId} className="block text-sm font-medium text-gray-700">
            Investment Amount (₹)
          </label>
          <input
            id={amountInputId}
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? amountErrorId : undefined}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.amount && (
            <p id={amountErrorId} role="alert" className="mt-1 text-sm text-red-600">
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={yearsId} className="block text-sm font-medium text-gray-700">
            Holding Period
          </label>
          <select
            id={yearsId}
            value={years}
            onChange={(e) => setYears(Number(e.target.value) as HoldingPeriodYears)}
            aria-invalid={Boolean(errors.years)}
            aria-describedby={errors.years ? yearsErrorId : undefined}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {HOLDING_PERIODS_YEARS.map((y) => (
              <option key={y} value={y}>
                {y} {y === 1 ? "year" : "years"}
              </option>
            ))}
          </select>
          {errors.years && (
            <p id={yearsErrorId} role="alert" className="mt-1 text-sm text-red-600">
              {errors.years}
            </p>
          )}
        </div>
      </div>

      <div
        aria-live="polite"
        className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        {breakdown ? (
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-500">Gross Value</dt>
            <dd className="text-right font-medium text-gray-900">
              {formatCurrency(breakdown.grossValue)}
            </dd>
            <dt className="text-gray-500">Management Fee</dt>
            <dd className="text-right font-medium text-gray-900">
              -{formatCurrency(breakdown.managementFee)}
            </dd>
            <dt className="text-gray-500">Exit Load {years >= 1 && "(not applicable, held ≥ 1 year)"}</dt>
            <dd className="text-right font-medium text-gray-900">
              -{formatCurrency(breakdown.exitLoad)}
            </dd>
            <dt className="text-gray-900 font-semibold border-t border-gray-200 pt-2">
              Net Value
            </dt>
            <dd className="text-right font-semibold text-gray-900 border-t border-gray-200 pt-2">
              {formatCurrency(breakdown.netValue)}
            </dd>
          </dl>
        ) : (
          <p className="text-sm text-gray-500">
            Enter a valid amount and holding period to see the projected breakdown.
          </p>
        )}
      </div>
    </section>
  );
}
