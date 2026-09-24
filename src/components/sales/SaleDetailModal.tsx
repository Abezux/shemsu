'use client';

import React from 'react';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatters';
import { X, Receipt, RotateCcw, AlertTriangle, CheckCircle, Ban } from 'lucide-react';

interface SaleDetailModalProps {
  isOpen: boolean;
  sale: Sale | null;
  currencySymbol: string;
  onClose: () => void;
  onRequestVoid: (sale: Sale) => void;
}

export default function SaleDetailModal({
  isOpen,
  sale,
  currencySymbol,
  onClose,
  onRequestVoid,
}: SaleDetailModalProps) {
  if (!isOpen || !sale) return null;

  const isVoided = sale.status === 'VOIDED';

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

          {/* Line Items Table */}
          <div className="bg-agora-bg rounded-2xl border border-agora-border overflow-hidden">
            <div className="px-4 py-2.5 bg-agora-bg/80 border-b border-agora-border text-xs font-bold text-agora-ink/60 flex justify-between">
              <span>Item</span>
              <span>Qty × Price = Total</span>
            </div>
            <div className="divide-y divide-agora-border/60">
              {sale.items?.map((item) => (
                <div key={item.id} className="px-4 py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-agora-ink block text-sm">{item.product_name}</span>
                    <span className="text-agora-ink/60">
                      {formatCurrency(item.unit_price, currencySymbol)} each
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-agora-ink text-sm block">
                      {formatCurrency(item.line_total, currencySymbol)}
                    </span>
                    <span className="text-agora-ink/60">{item.quantity} unit(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-agora-bg p-4 rounded-2xl border border-agora-border flex justify-between items-center">
            <span className="text-sm font-semibold text-agora-ink/70">Total Sale Amount:</span>
            <span className="text-2xl font-serif font-bold text-agora-terracotta">
              {formatCurrency(sale.total_amount, currencySymbol)}
            </span>
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
                Void Sale & Restore Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
