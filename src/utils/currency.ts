/**
 * Utility functions for robust financial & currency calculations.
 * Always works with small currency units (integer cents) to prevent float inaccuracies.
 */

export const CURRENCY_PRESETS = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: 'KSh', code: 'KES', name: 'Kenyan Shilling (KSh)' },
  { symbol: '₦', code: 'NGN', name: 'Nigerian Naira (₦)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: 'R', code: 'ZAR', name: 'South African Rand (R)' },
  { symbol: '₱', code: 'PHP', name: 'Philippine Peso (₱)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
];

export function formatCurrency(
  amountInCents: number,
  symbol: string = '$',
  showDecimals: boolean = true
): string {
  if (isNaN(amountInCents) || amountInCents === null || amountInCents === undefined) {
    return `${symbol}0.00`;
  }

  const dollars = amountInCents / 100;
  
  // Format with thousands separator
  const formatted = dollars.toLocaleString(undefined, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return `${symbol}${formatted}`;
}

export function parseInputToCents(val: string | number): number {
  if (typeof val === 'number') {
    return Math.round(val * 100);
  }
  const clean = val.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function centsToDecimalString(amountInCents: number): string {
  return (amountInCents / 100).toFixed(2);
}
