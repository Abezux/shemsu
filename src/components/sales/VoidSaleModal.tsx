'use client';

import React, { useState } from 'react';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { X, AlertTriangle, RotateCcw } from 'lucide-react';

interface VoidSaleModalProps {
  isOpen: boolean;
  sale: Sale | null;
  currencySymbol: string;
  onClose: () => void;
  onConfirmVoid: (saleId: string, reason: string) => Promise<void>;
}

export default function VoidSaleModal({
  isOpen,
  sale,
  currencySymbol,
  onClose,
  onConfirmVoid,
}: VoidSaleModalProps) {
  const [reason, setReason] = useState<string>('Customer returned items / mistake at register');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !sale) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please specify a reason for voiding this sale.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmVoid(sale.id, reason.trim());
      onClose();
    } catch (err) {
      alert('Failed to void sale: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-rose-950/30">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-lg">Void Sale {sale.sale_number}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 space-y-1">
            <p className="font-bold text-sm text-rose-200">Are you sure you want to void this sale?</p>
            <p className="text-slate-400">
              This action will mark the receipt as voided ({formatCurrency(sale.total_amount, currencySymbol)}) and <strong className="text-emerald-400">automatically restore inventory stock</strong> for all {sale.items_count} item(s).
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Reason for Voiding
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this sale is being voided..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              {isSubmitting ? 'Voiding...' : 'Confirm Void'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
