'use client';

import React, { useState } from 'react';
import { Sale, SaleItem } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatters';
import { X, Receipt, RotateCcw, AlertTriangle, CheckCircle, Ban, RefreshCw, Tag } from 'lucide-react';

interface SaleDetailModalProps {
  isOpen: boolean;
  sale: Sale | null;
  currencySymbol: string;
  onClose: () => void;
  onRequestVoid: (sale: Sale) => void;
  onProcessRefund?: (
    saleId: string,
    refundItems: { sale_item_id: string; quantity: number }[],
    reason?: string
  ) => Promise<void>;
}

export default function SaleDetailModal({
  isOpen,
  sale,
  currencySymbol,
  onClose,
  onRequestVoid,
  onProcessRefund,
}: SaleDetailModalProps) {
  const [refundingItemId, setRefundingItemId] = useState<string | null>(null);
  const [refundQtyInput, setRefundQtyInput] = useState<string>('1');
  const [refundReasonInput, setRefundReasonInput] = useState<string>('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState<boolean>(false);

  if (!isOpen || !sale) return null;

  const isVoided = sale.status === 'VOIDED';

  const handleStartRefund = (item: SaleItem) => {
    const unrefunded = item.quantity - (item.refunded_quantity || 0);
    setRefundingItemId(item.id);
    setRefundQtyInput(unrefunded.toString());
    setRefundReasonInput('');
  };

  const handleConfirmRefund = async (item: SaleItem) => {
    if (!onProcessRefund) return;
    const qtyToRefund = parseFloat(refundQtyInput);
    const unrefunded = item.quantity - (item.refunded_quantity || 0);

    if (isNaN(qtyToRefund) || qtyToRefund <= 0 || qtyToRefund > unrefunded) {
      alert(`Invalid refund quantity. Must be between 0 and ${unrefunded}`);
      return;
    }

    setIsSubmittingRefund(true);
    try {
      await onProcessRefund(
        sale.id,
        [{ sale_item_id: item.id, quantity: qtyToRefund }],
        refundReasonInput || 'Customer return'
      );
      setRefundingItemId(null);
    } catch (err: any) {
      alert('Failed to process refund: ' + (err.message || err));
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-agora-card border border-agora-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-agora-border flex items-center justify-between bg-agora-bg/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-agora-terracotta" />
            <div>
              <h3 className="font-serif font-bold text-agora-ink text-lg leading-tight">
                Sale Details {sale.sale_number}
              </h3>
              <span className="text-xs text-agora-ink/60">{formatDate(sale.timestamp)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-agora-ink/60 hover:text-agora-ink p-1.5 rounded-xl hover:bg-agora-bg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Badge Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isVoided
                ? 'bg-agora-brick/10 border-agora-brick/30 text-agora-brick'
                : 'bg-agora-sage/10 border-agora-sage/30 text-agora-sage'
            }`}
          >
            <div className="flex items-center gap-2">
              {isVoided ? (
                <Ban className="w-5 h-5 text-agora-brick" />
              ) : (
                <CheckCircle className="w-5 h-5 text-agora-sage" />
              )}
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  Status: {sale.status}
                </span>
                {isVoided && (
                  <span className="text-xs text-agora-brick">
                    Reason: {sale.void_reason || 'No reason specified'}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-agora-card border border-agora-border text-agora-ink">
              {sale.payment_method || 'CASH'}
            </span>
          </div>

          {/* Line Items Table with Partial Refunds */}
          <div className="bg-agora-bg rounded-2xl border border-agora-border overflow-hidden">
            <div className="px-4 py-2.5 bg-agora-bg/80 border-b border-agora-border text-xs font-bold text-agora-ink/60 flex justify-between">
              <span>Item</span>
              <span>Price & Qty</span>
            </div>
            <div className="divide-y divide-agora-border/60">
              {sale.items?.map((item) => {
                const refunded = item.refunded_quantity || 0;
                const unrefunded = item.quantity - refunded;
                const isRefunding = refundingItemId === item.id;

                return (
                  <div key={item.id} className="p-3.5 space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div className="flex-1 pr-2">
                        <span className="font-bold text-agora-ink block text-sm">{item.product_name}</span>
                        <span className="text-agora-ink-muted">
                          {formatCurrency(item.unit_price, currencySymbol)} each
                        </span>
                        {refunded > 0 && (
                          <span className="text-[11px] font-bold text-agora-brick block mt-0.5">
                            • {refunded} unit(s) refunded
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-agora-ink text-sm block">
                          {formatCurrency(item.line_total, currencySymbol)}
                        </span>
                        <span className="text-agora-ink-muted">{item.quantity} unit(s) total</span>

                        {!isVoided && unrefunded > 0 && onProcessRefund && !isRefunding && (
                          <button
                            type="button"
                            onClick={() => handleStartRefund(item)}
                            className="mt-1 px-2 py-0.5 bg-agora-brick/10 hover:bg-agora-brick/20 text-agora-brick border border-agora-brick/30 font-bold rounded-lg text-[11px] transition-all"
                          >
                            Refund Item
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Refund Form */}
                    {isRefunding && (
                      <div className="bg-agora-card p-3 rounded-xl border border-agora-brick/40 space-y-2 text-xs animate-in fade-in duration-150">
                        <div className="flex items-center justify-between font-bold text-agora-brick">
                          <span>Refund {item.product_name}</span>
                          <span className="text-[10px] text-agora-ink-muted">Max: {unrefunded}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="any"
                            value={refundQtyInput}
                            onChange={(e) => setRefundQtyInput(e.target.value)}
                            placeholder="Qty to refund"
                            className="bg-agora-bg border border-agora-border rounded-lg py-1.5 px-2.5 text-xs font-bold text-agora-ink focus:outline-none focus:border-agora-brick"
                          />
                          <input
                            type="text"
                            value={refundReasonInput}
                            onChange={(e) => setRefundReasonInput(e.target.value)}
                            placeholder="Reason (optional)"
                            className="bg-agora-bg border border-agora-border rounded-lg py-1.5 px-2.5 text-xs text-agora-ink focus:outline-none focus:border-agora-brick"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setRefundingItemId(null)}
                            className="px-2.5 py-1 bg-agora-bg border border-agora-border text-agora-ink font-bold rounded-lg text-[11px]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isSubmittingRefund}
                            onClick={() => handleConfirmRefund(item)}
                            className="px-3 py-1 bg-agora-brick text-agora-card font-bold rounded-lg text-[11px] shadow-sm disabled:opacity-50"
                          >
                            {isSubmittingRefund ? 'Processing...' : 'Confirm Refund'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtotal & Discount Breakdown */}
          <div className="bg-agora-bg p-3.5 rounded-2xl border border-agora-border space-y-1.5 text-xs">
            {sale.subtotal_amount ? (
              <div className="flex justify-between text-agora-ink-muted">
                <span>Gross Subtotal:</span>
                <span className="font-serif font-bold text-agora-ink">{formatCurrency(sale.subtotal_amount, currencySymbol)}</span>
              </div>
            ) : null}

            {sale.discount_amount && sale.discount_amount > 0 ? (
              <div className="flex justify-between text-agora-sage font-bold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-agora-sage" /> Discount ({sale.discount_reason || 'Applied'}):
                </span>
                <span>- {formatCurrency(sale.discount_amount, currencySymbol)}</span>
              </div>
            ) : null}

            <div className="flex justify-between items-baseline pt-1.5 border-t border-agora-border">
              <span className="font-bold text-agora-ink">Charged Total:</span>
              <span className="text-xl font-serif font-black text-agora-terracotta">
                {formatCurrency(sale.total_amount, currencySymbol)}
              </span>
            </div>
          </div>

          {sale.notes && (
            <div className="bg-agora-bg/60 p-3 rounded-xl border border-agora-border text-xs text-agora-ink/80">
              <span className="font-bold text-agora-ink/60 block">Note:</span>
              {sale.notes}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            {!isVoided && (
              <button
                onClick={() => onRequestVoid(sale)}
                className="w-full py-3 bg-agora-brick/15 hover:bg-agora-brick/25 text-agora-brick font-bold rounded-xl text-sm border border-agora-brick/30 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-agora-brick" />
                Void Full Sale & Restore Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

