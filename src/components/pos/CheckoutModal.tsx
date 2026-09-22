'use client';

import React, { useState, useEffect } from 'react';
import { CartItem, Sale } from '@/types';
import { formatCurrency, parseInputToCents } from '@/utils/currency';
import { X, CheckCircle2, DollarSign, Smartphone, CreditCard, HelpCircle, Receipt } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  currencySymbol: string;
  onClose: () => void;
  onConfirmSale: (
    paymentMethod: Sale['payment_method'],
    notes?: string
  ) => Promise<Sale | undefined>;
}

export default function CheckoutModal({
  isOpen,
  cart,
  currencySymbol,
  onClose,
  onConfirmSale,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<Sale['payment_method']>('CASH');
  const [cashTenderedInput, setCashTenderedInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const totalAmountInCents = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cashTenderedInCents = parseInputToCents(cashTenderedInput);
  const changeInCents = Math.max(0, cashTenderedInCents - totalAmountInCents);

  useEffect(() => {
    if (isOpen) {
      setCashTenderedInput((totalAmountInCents / 100).toString());
      setCompletedSale(null);
      setIsSubmitting(false);
    }
  }, [isOpen, totalAmountInCents]);

  if (!isOpen) return null;

  const handlePresetCash = (multiplier: number) => {
    setCashTenderedInput(multiplier.toString());
  };

  const handleExactCash = () => {
    setCashTenderedInput((totalAmountInCents / 100).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sale = await onConfirmSale(paymentMethod, notes);
      if (sale) {
        setCompletedSale(sale);
      }
    } catch (err) {
      alert('Failed to complete sale: ' + err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {completedSale ? (
          /* Sale Success View */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Sale Completed Successfully
              </span>
              <h2 className="text-2xl font-black text-slate-100 mt-2">
                {formatCurrency(completedSale.total_amount, currencySymbol)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Receipt {completedSale.sale_number} • Stock updated automatically
              </p>
            </div>

            {/* Change Display */}
            {paymentMethod === 'CASH' && cashTenderedInCents > totalAmountInCents && (
              <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-2xl p-4 text-center">
                <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">
                  Change to return to customer
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">
                  {formatCurrency(changeInCents, currencySymbol)}
                </div>
              </div>
            )}

            {/* Sold Items Summary */}
            <div className="bg-slate-950/60 rounded-2xl p-4 text-left max-h-40 overflow-y-auto space-y-2 border border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-1">
                <span>Item</span>
                <span>Qty × Price</span>
              </div>
              {completedSale.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-slate-200">
                  <span className="truncate max-w-[200px]">{item.product_name}</span>
                  <span className="font-semibold">
                    {item.quantity} × {formatCurrency(item.unit_price, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-lg rounded-2xl shadow-lg transition-all active:scale-[0.99]"
            >
              Done & Start Next Sale
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-lg">Checkout & Complete Sale</h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Total Banner */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                    Total Amount Due
                  </span>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatCurrency(totalAmountInCents, currencySymbol)}
                  </div>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1.5 rounded-xl border border-slate-700">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Items
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash', icon: DollarSign },
                    { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
                    { id: 'CARD', label: 'Card', icon: CreditCard },
                    { id: 'OTHER', label: 'Other', icon: HelpCircle },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Calculator (if CASH chosen) */}
              {paymentMethod === 'CASH' && (
                <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">
                      Cash Tendered
                    </label>
                    <button
                      type="button"
                      onClick={handleExactCash}
                      className="text-xs font-bold text-emerald-400 hover:underline"
                    >
                      Exact Cash
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashTenderedInput}
                      onChange={(e) => setCashTenderedInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white font-bold text-lg focus:outline-none focus:border-emerald-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Quick Cash Presets */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[5, 10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePresetCash(amt)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shrink-0"
                      >
                        {currencySymbol}{amt}
                      </button>
                    ))}
                  </div>

                  {/* Change Output */}
                  {cashTenderedInCents >= totalAmountInCents && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">Change to return:</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {formatCurrency(changeInCents, currencySymbol)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Note / Memo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Optional Sale Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Customer requested discount or split bill"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
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
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Complete & Print'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
