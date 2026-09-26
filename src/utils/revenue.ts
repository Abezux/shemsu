import { Sale, Refund, SaleItem } from '@/types';

/**
 * Calculates total refund amount in cents for a specific sale.
 */
export function calculateSaleRefunds(sale: Sale, refunds: Refund[] = []): number {
  if (refunds.length > 0) {
    const matchingRefunds = refunds.filter((r) => r.sale_id === sale.id);
    if (matchingRefunds.length > 0) {
      return matchingRefunds.reduce((sum, r) => sum + r.amount, 0);
    }
  }

  if (sale.items && sale.items.length > 0) {
    return sale.items.reduce((sum, item) => {
      const qty = item.refunded_quantity || 0;
      return sum + Math.round(item.unit_price * qty);
    }, 0);
  }

  return 0;
}

/**
 * Calculates net revenue (in cents) for a single sale.
 * Net Revenue = sale.total_amount - refunds
 */
export function getSaleNetRevenue(sale: Sale, refunds: Refund[] = []): number {
  if (sale.status === 'VOIDED') return 0;
  const gross = sale.total_amount || 0;
  const refundTotal = calculateSaleRefunds(sale, refunds);
  return Math.max(0, gross - refundTotal);
}

/**
 * Calculates total net revenue (in cents) for an array of sales.
 */
export function calculateNetRevenue(sales: Sale[], refunds: Refund[] = []): number {
  return sales.reduce((sum, s) => {
    if (s.status === 'VOIDED') return sum;
    return sum + getSaleNetRevenue(s, refunds);
  }, 0);
}

/**
 * Calculates net line total in cents for a sale item accounting for refunded units.
 */
export function getSaleItemNetTotal(item: SaleItem): number {
  const netQty = Math.max(0, item.quantity - (item.refunded_quantity || 0));
  return Math.round(item.unit_price * netQty);
}
