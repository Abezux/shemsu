'use client';

import React from 'react';
import { CartItem } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  currencySymbol: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({
  cart,
  currencySymbol,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}: CartDrawerProps) {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmountInCents = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="ledger-card p-4 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-agora-border mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-agora-terracotta/10 p-2 rounded-xl text-agora-terracotta border border-agora-terracotta/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-agora-ink text-base leading-tight">Current Register</h2>
            <span className="text-xs text-agora-ink-muted">{totalItemsCount} item(s) in cart</span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs font-semibold text-agora-brick hover:text-agora-brick/80 flex items-center gap-1 hover:bg-agora-brick-light px-2.5 py-1 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Cart Items List — Ledger Line Style */}
      <div className="flex-1 overflow-y-auto pr-1 divide-y divide-agora-border/60 min-h-[220px] max-h-[460px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-agora-ink-muted my-8">
            <div className="w-12 h-12 rounded-full bg-agora-bg border border-agora-border flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-agora-brass" />
            </div>
            <p className="text-sm font-bold text-agora-ink">Ledger is empty</p>
            <p className="text-xs text-agora-ink-muted mt-1 max-w-[180px]">
              Select items from the catalog grid to add them to this sale entry
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const lineTotal = item.product.price * item.quantity;
            return (
              <div
                key={item.product.id}
                className="py-2.5 flex items-center justify-between gap-3 group hover:bg-agora-bg/50 px-1 rounded-lg transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.product.image_url || '📦'}</span>
                    <h4 className="font-bold text-agora-ink text-xs truncate">
                      {item.product.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-agora-ink-muted">
                      {formatCurrency(item.product.price, currencySymbol)} ea
                    </span>
                    <span className="text-xs font-serif font-bold text-agora-terracotta">
                      = {formatCurrency(lineTotal, currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-agora-card border border-agora-border p-1 rounded-xl shadow-inner">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-agora-bg hover:bg-agora-border active:scale-95 flex items-center justify-center text-agora-ink font-bold transition-all text-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-agora-ink">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    disabled={item.quantity >= item.product.stock_quantity}
                    className="w-7 h-7 rounded-lg bg-agora-terracotta hover:bg-agora-terracotta-hover active:scale-95 disabled:opacity-40 flex items-center justify-center text-agora-card font-bold transition-all text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout Button */}
      <div className="pt-3 border-t border-agora-border mt-auto">
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs text-agora-ink-muted">
            <span>Items Count:</span>
            <span className="font-bold text-agora-ink">{totalItemsCount} units</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-agora-ink pt-1.5 border-t border-agora-border/70">
            <span>Total Amount:</span>
            <span className="text-2xl font-serif font-black text-agora-terracotta">
              {formatCurrency(totalAmountInCents, currencySymbol)}
            </span>
          </div>
        </div>

        <button
          onClick={onProceedToCheckout}
          disabled={cart.length === 0}
          className="w-full py-3.5 px-4 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Record Sale Entry</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
