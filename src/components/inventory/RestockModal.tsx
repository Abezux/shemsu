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
    } catch (err: any) {
      alert('Failed to restock product: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const newTotalStock = product.stock_quantity + (addQuantity || 0);

  return (
    <div className="fixed inset-0 z-50 bg-agora-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-agora-card border border-agora-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-agora-ink">
        <div className="px-6 py-4 border-b border-agora-border flex items-center justify-between bg-agora-bg/50">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-agora-terracotta" />
            <h3 className="font-serif font-bold text-agora-ink text-lg">Restock Inventory</h3>
          </div>
          <button
            onClick={onClose}
            className="text-agora-ink-muted hover:text-agora-ink p-1 rounded-lg hover:bg-agora-bg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Product Summary */}
          <div className="bg-agora-bg p-4 rounded-2xl border border-agora-border flex items-center gap-3">
            <div className="w-12 h-12 bg-agora-card border border-agora-border rounded-xl flex items-center justify-center text-2xl shadow-inner">
              {product.image_url || '📦'}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-agora-brass">
                {product.category}
              </span>
              <h4 className="font-bold text-agora-ink text-base leading-tight">{product.name}</h4>
              <p className="text-xs text-agora-ink-muted mt-0.5">
                Current stock: <strong className="font-serif text-agora-ink">{product.stock_quantity} units</strong>
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-agora-ink mb-2">
              Quick Add Quantity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 24, 50].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setAddQuantity(qty)}
                  className={`py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-all ${
                    addQuantity === qty
                      ? 'bg-agora-terracotta/15 border-agora-terracotta text-agora-terracotta shadow-sm'
                      : 'bg-agora-card border-agora-border text-agora-ink-muted hover:text-agora-ink'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-agora-ink">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              required
              value={addQuantity}
              onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
              className="w-full bg-agora-bg border border-agora-border rounded-xl px-4 py-3 text-lg text-agora-ink font-serif font-bold focus:outline-none focus:border-agora-terracotta"
            />
          </div>

          {/* Projected Stock Balance */}
          <div className="bg-agora-sage-light border border-agora-sage-border rounded-2xl p-3.5 flex items-center justify-between">
            <span className="text-xs text-agora-sage font-bold">New Total Stock Balance:</span>
            <span className="text-lg font-serif font-black text-agora-sage flex items-center gap-1">
              {newTotalStock} units <ArrowUpRight className="w-4 h-4 text-agora-sage" />
            </span>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-agora-ink-muted">
              Restock Reason / Note <span className="text-[10px] text-agora-ink-muted/70">(Optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received new shipment from supplier"
              className="w-full bg-agora-bg border border-agora-border rounded-xl py-2 px-3 text-xs text-agora-ink placeholder-agora-ink-muted/60 focus:outline-none focus:border-agora-terracotta"
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
              {isSubmitting ? 'Updating...' : `Confirm +${addQuantity} Units`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
