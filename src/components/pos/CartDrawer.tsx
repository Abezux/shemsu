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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-base leading-tight">Current Sale</h2>
            <span className="text-xs text-slate-400">{totalItemsCount} item(s) in cart</span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[220px] max-h-[460px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 my-8">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">Cart is empty</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[180px]">
              Tap products on the left grid to start building a customer order
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const lineTotal = item.product.price * item.quantity;
            return (
              <div
                key={item.product.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.product.image_url || '📦'}</span>
                    <h4 className="font-semibold text-slate-200 text-xs truncate">
                      {item.product.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">
                      {formatCurrency(item.product.price, currencySymbol)} ea
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      = {formatCurrency(lineTotal, currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-300 font-bold transition-all text-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    disabled={item.quantity >= item.product.stock_quantity}
                    className="w-7 h-7 rounded-md bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 flex items-center justify-center text-slate-950 font-bold transition-all text-xs"
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
      <div className="pt-3 border-t border-slate-800 mt-auto">
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Items Count:</span>
            <span className="font-medium text-slate-200">{totalItemsCount} units</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-slate-100 pt-1 border-t border-slate-800/60">
            <span>Total Amount:</span>
            <span className="text-xl font-extrabold text-emerald-400">
              {formatCurrency(totalAmountInCents, currencySymbol)}
            </span>
          </div>
        </div>

        <button
          onClick={onProceedToCheckout}
          disabled={cart.length === 0}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Complete Sale</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
