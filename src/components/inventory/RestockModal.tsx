'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, PlusCircle, ArrowUpRight } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onRestock: (productId: string, addQuantity: number, note?: string) => Promise<void>;
}

export default function RestockModal({
  isOpen,
  product,
  onClose,
  onRestock,
}: RestockModalProps) {
  const [addQuantity, setAddQuantity] = useState<number>(10);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setAddQuantity(10);
      setNote('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addQuantity <= 0) {
      alert('Please enter a quantity greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRestock(product.id, addQuantity, note);
      onClose();
    } catch (err) {
      alert('Failed to restock product: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const newTotalStock = product.stock_quantity + (addQuantity || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-lg">Restock Inventory</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Product Summary */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
              {product.image_url || '📦'}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {product.category}
              </span>
              <h4 className="font-bold text-slate-100 text-base leading-tight">{product.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Current stock: <strong className="text-white">{product.stock_quantity} units</strong>
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Quick Add Quantity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 24, 50].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setAddQuantity(qty)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    addQuantity === qty
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              required
              value={addQuantity}
              onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg text-white font-extrabold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Projected Stock Balance */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-3.5 flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-medium">New Total Stock Balance:</span>
            <span className="text-lg font-black text-emerald-400 flex items-center gap-1">
              {newTotalStock} units <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </span>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">
              Restock Reason / Note <span className="text-[10px] text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received new shipment from supplier"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
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
              {isSubmitting ? 'Updating...' : `Confirm +${addQuantity} Units`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
