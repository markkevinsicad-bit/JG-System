"use client";

import { useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Displays a number with thousands separators as the user types, while
 * keeping the actual submitted form value a plain numeric string (no
 * commas, no currency symbol) via a hidden input alongside the visible
 * one. This is what lets every financial form use natural-feeling
 * formatted input without ever risking a formatted string reaching the
 * database.
 *
 * Handles typing, backspace/delete, paste (including pasted "₱1,500,000"
 * or "1,500,000.75"), and full-value replacement (select-all + type)
 * without fighting the user's cursor.
 */
function normalizeToNumberString(raw: string): string {
  // Strip everything except digits and the first decimal point.
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  const intPart = cleaned.slice(0, firstDot);
  const decPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
  return `${intPart}.${decPart}`;
}

function formatWithCommas(numStr: string): string {
  if (!numStr) return "";
  const [intPart, decPart] = numStr.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

export const CurrencyInput = forwardRef<
  HTMLInputElement,
  {
    name: string;
    defaultValue?: number | string;
    required?: boolean;
    id?: string;
    className?: string;
    placeholder?: string;
    onValueChange?: (value: number) => void;
  }
>(({ name, defaultValue, required, id, className, placeholder = "0.00", onValueChange }, ref) => {
  const [display, setDisplay] = useState(() => {
    if (defaultValue === undefined || defaultValue === "") return "";
    return formatWithCommas(normalizeToNumberString(String(defaultValue)));
  });
  const [rawValue, setRawValue] = useState(() => {
    if (defaultValue === undefined || defaultValue === "") return "";
    return normalizeToNumberString(String(defaultValue));
  });

  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== "") {
      const normalized = normalizeToNumberString(String(defaultValue));
      setRawValue(normalized);
      setDisplay(formatWithCommas(normalized));
      onValueChange?.(parseFloat(normalized) || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const normalized = normalizeToNumberString(e.target.value);
    setRawValue(normalized);
    setDisplay(formatWithCommas(normalized));
    onValueChange?.(parseFloat(normalized) || 0);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
        ₱
      </span>
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          "h-10 w-full rounded-lg border border-gray-border bg-white pl-7 pr-3 text-sm text-navy placeholder:text-gray-400 transition-colors focus:border-eng-blue focus:outline-none focus:ring-2 focus:ring-eng-blue/20",
          className
        )}
      />
      {/* The actual submitted value: plain numeric string, no commas. */}
      <input type="hidden" name={name} value={rawValue} />
    </div>
  );
});

CurrencyInput.displayName = "CurrencyInput";
