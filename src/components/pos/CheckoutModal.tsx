'use client';

import React, { useState, useEffect } from 'react';
import { CartItem, Sale } from '@/types';
import { formatCurrency, parseInputToCents } from '@/utils/currency';
import { X, DollarSign, Smartphone, CreditCard, HelpCircle, Receipt, Award } from 'lucide-react';

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
    } catch (err: any) {
      alert('Failed to complete sale: ' + (err.message || err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-agora-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-agora-card border border-agora-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-agora-ink">
        {completedSale ? (
          /* Sale Success View */
          <div className="p-6 text-center space-y-5">
            {/* Signature Stamp Seal Mark */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center my-2">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-agora-terracotta/40 animate-spin-slow" />
              <div className="w-20 h-20 rounded-full border-2 border-agora-terracotta bg-agora-terracotta/10 flex flex-col items-center justify-center p-2 transform -rotate-12 shadow-sm">
                <Award className="w-6 h-6 text-agora-terracotta" />
                <span className="font-serif font-black text-[9px] uppercase tracking-widest text-agora-terracotta leading-none mt-0.5">
                  AGORA
                </span>
                <span className="text-[7px] font-bold tracking-tighter text-agora-terracotta uppercase">
                  RECORDED
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-agora-sage bg-agora-sage-light px-3 py-1 rounded-full border border-agora-sage-border">
                Sale Complete
              </span>
              <h2 className="text-3xl font-serif font-black text-agora-terracotta mt-3">
                {formatCurrency(completedSale.total_amount, currencySymbol)}
              </h2>
              <p className="text-xs text-agora-ink-muted mt-1 font-medium">
                Receipt {completedSale.sale_number} • Stock updated
              </p>
            </div>

            {/* Change Display */}
            {paymentMethod === 'CASH' && cashTenderedInCents > totalAmountInCents && (
              <div className="bg-agora-sage-light border border-agora-sage-border rounded-2xl p-4 text-center">
                <span className="text-xs text-agora-sage uppercase tracking-wider font-bold block">
                  Change due to customer
                </span>
                <div className="text-3xl font-serif font-black text-agora-sage mt-1">
                  {formatCurrency(changeInCents, currencySymbol)}
                </div>
              </div>
            )}

            {/* Sold Items Summary */}
            <div className="bg-agora-bg border border-agora-border rounded-2xl p-4 text-left max-h-40 overflow-y-auto space-y-2">
              <div className="flex justify-between text-xs font-bold text-agora-ink-muted border-b border-agora-border pb-1">
                <span>Item</span>
                <span>Qty × Price</span>
              </div>
              {completedSale.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-agora-ink border-b border-agora-border/40 pb-1">
                  <span className="truncate max-w-[200px] font-medium">{item.product_name}</span>
                  <span className="font-serif font-bold">
                    {item.quantity} × {formatCurrency(item.unit_price, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold text-lg rounded-xl shadow-md transition-all active:scale-[0.99]"
            >
              Next Sale
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-agora-border flex items-center justify-between bg-agora-bg/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-agora-terracotta" />
                <h3 className="font-serif font-bold text-agora-ink text-lg">Complete Sale</h3>
              </div>
              <button
                onClick={onClose}
                className="text-agora-ink-muted hover:text-agora-ink p-1 rounded-lg hover:bg-agora-bg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Total Banner */}
              <div className="bg-agora-bg p-4 rounded-2xl border border-agora-border flex justify-between items-center">
                <div>
                  <span className="text-xs text-agora-ink-muted uppercase tracking-wider font-bold">
                    Total Due
                  </span>
                  <div className="text-3xl font-serif font-black text-agora-terracotta">
                    {formatCurrency(totalAmountInCents, currencySymbol)}
                  </div>
                </div>
                <span className="text-xs bg-agora-card text-agora-ink font-bold px-3 py-1.5 rounded-xl border border-agora-border">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Items
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-agora-ink-muted mb-2">
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
                            ? 'bg-agora-terracotta/15 border-agora-terracotta text-agora-terracotta shadow-sm'
                            : 'bg-agora-bg/60 border-agora-border text-agora-ink-muted hover:text-agora-ink'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Calculator */}
              {paymentMethod === 'CASH' && (
                <div className="space-y-3 bg-agora-bg/70 p-4 rounded-2xl border border-agora-border">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-agora-ink">
                      Cash Received
                    </label>
                    <button
                      type="button"
                      onClick={handleExactCash}
                      className="text-xs font-bold text-agora-terracotta hover:underline"
                    >
                      Exact Amount
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-agora-ink-muted font-serif font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashTenderedInput}
                      onChange={(e) => setCashTenderedInput(e.target.value)}
                      className="w-full bg-agora-card border border-agora-border rounded-xl py-2.5 pl-8 pr-4 text-agora-ink font-serif font-bold text-lg focus:outline-none focus:border-agora-terracotta"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Quick Cash Presets */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[5, 10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePresetCash(amt)}
                        className="px-3 py-1 rounded-xl bg-agora-card hover:bg-agora-border text-agora-ink text-xs font-serif font-bold border border-agora-border shrink-0"
                      >
                        {currencySymbol}{amt}
                      </button>
                    ))}
                  </div>

                  {/* Change Output */}
                  {cashTenderedInCents >= totalAmountInCents && (
                    <div className="flex justify-between items-center pt-2 border-t border-agora-border text-xs">
                      <span className="text-agora-ink-muted font-medium">Change due:</span>
                      <span className="font-serif font-bold text-agora-sage text-base">
                        {formatCurrency(changeInCents, currencySymbol)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-agora-ink-muted mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Discount applied"
                  className="w-full bg-agora-bg border border-agora-border rounded-xl py-2 px-3 text-xs text-agora-ink placeholder:text-agora-ink-muted/80 focus:outline-none focus:border-agora-terracotta"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-agora-bg hover:bg-agora-border text-agora-ink font-bold rounded-xl text-sm transition-all border border-agora-border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Complete Sale'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
