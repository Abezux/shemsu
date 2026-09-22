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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-lg leading-tight">
                Sale Details {sale.sale_number}
              </h3>
              <span className="text-xs text-slate-400">{formatDate(sale.timestamp)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Badge Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isVoided
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isVoided ? (
                <Ban className="w-5 h-5 text-rose-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  Status: {sale.status}
                </span>
                {isVoided && (
                  <span className="text-xs text-rose-400">
                    Reason: {sale.void_reason || 'No reason specified'}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              {sale.payment_method || 'CASH'}
            </span>
          </div>

          {/* Line Items Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 flex justify-between">
              <span>Item</span>
              <span>Qty × Price = Total</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {sale.items?.map((item) => (
                <div key={item.id} className="px-4 py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block text-sm">{item.product_name}</span>
                    <span className="text-slate-400">
                      {formatCurrency(item.unit_price, currencySymbol)} each
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-100 text-sm block">
                      {formatCurrency(item.line_total, currencySymbol)}
                    </span>
                    <span className="text-slate-400">{item.quantity} unit(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-400">Total Sale Amount:</span>
            <span className="text-2xl font-black text-emerald-400">
              {formatCurrency(sale.total_amount, currencySymbol)}
            </span>
          </div>

          {sale.notes && (
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-slate-400 block">Note:</span>
              {sale.notes}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            {!isVoided && (
              <button
                onClick={() => onRequestVoid(sale)}
                className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl text-sm border border-rose-500/40 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Void Sale & Restore Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
