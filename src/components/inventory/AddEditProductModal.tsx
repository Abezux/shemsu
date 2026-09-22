'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '@/types';
import { parseInputToCents, centsToDecimalString } from '@/utils/currency';
import { X, Package, Tag, DollarSign, Layers, AlertCircle } from 'lucide-react';

interface AddEditProductModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  currencySymbol: string;
  onClose: () => void;
  onSave: (product: Partial<Product> & { name: string; price: number; stock_quantity: number }) => Promise<void>;
}

const CATEGORIES: ProductCategory[] = [
  'Beverages',
  'Snacks',
  'Groceries',
  'Toiletries',
  'Pharmacy',
  'Stationery',
  'General',
];

const EMOJI_ICONS = ['🥤', '💧', '🧃', '🥔', '🍫', '🍞', '🥛', '🧼', '🪥', '💊', '🧴', '🖊️', '📓', '📦', '🍎', '🍌'];

export default function AddEditProductModal({
  isOpen,
  productToEdit,
  currencySymbol,
  onClose,
  onSave,
}: AddEditProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Beverages');
  const [priceInput, setPriceInput] = useState('');
  const [costPriceInput, setCostPriceInput] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState<string>('📦');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setCategory(productToEdit.category);
        setPriceInput(centsToDecimalString(productToEdit.price));
        setCostPriceInput(productToEdit.cost_price ? centsToDecimalString(productToEdit.cost_price) : '');
        setStockQuantity(productToEdit.stock_quantity);
        setLowStockThreshold(productToEdit.low_stock_threshold);
        setImageUrl(productToEdit.image_url || '📦');
      } else {
        setName('');
        setCategory('Beverages');
        setPriceInput('');
        setCostPriceInput('');
        setStockQuantity(10);
        setLowStockThreshold(5);
        setImageUrl('📦');
      }
      setIsSubmitting(false);
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product name is required');
      return;
    }
    const priceCents = parseInputToCents(priceInput);
    if (priceCents <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: productToEdit?.id,
        name: name.trim(),
        category,
        price: priceCents,
        cost_price: costPriceInput ? parseInputToCents(costPriceInput) : undefined,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold,
        image_url: imageUrl,
      });
      onClose();
    } catch (err) {
      alert('Failed to save product: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-lg">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name & Icon */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Product Name</label>
            <div className="flex gap-2">
              {/* Emoji selector dropdown */}
              <select
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2 text-xl focus:outline-none"
              >
                {EMOJI_ICONS.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coca Cola 500ml or Panadol Extra"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Selling Price ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="1.50"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">
                Cost Price ({currencySymbol}) <span className="text-[10px] text-slate-500">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={costPriceInput}
                onChange={(e) => setCostPriceInput(e.target.value)}
                placeholder="0.90"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Inventory Controls */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Initial / Current Stock
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Low Stock Alert
              </label>
              <input
                type="number"
                min="1"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 block">Alert when stock ≤ threshold</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
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
              {isSubmitting ? 'Saving...' : productToEdit ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
