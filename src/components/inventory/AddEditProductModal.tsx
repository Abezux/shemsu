import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, UnitType, BusinessType, StoreSettings } from '@/types';
import { parseInputToCents, centsToDecimalString } from '@/utils/currency';
import { api } from '@/services/api';
import { X, Package, Layers, Calendar, FileText, Clock, AlertCircle } from 'lucide-react';

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

const UNIT_TYPES: { id: UnitType; label: string }[] = [
  { id: 'piece', label: 'Pieces (pcs)' },
  { id: 'kg', label: 'Kilograms (kg)' },
  { id: 'g', label: 'Grams (g)' },
  { id: 'L', label: 'Liters (L)' },
  { id: 'ml', label: 'Milliliters (ml)' },
];

const EMOJI_ICONS = ['🥤', '💧', '🧃', '🥔', '🍫', '🍞', '🌾', '🥛', '🧼', '🪥', '💊', '🧴', '🖊️', '📓', '📦', '🍎', '🍌', '🍔', '✂️'];

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
  const [unitType, setUnitType] = useState<UnitType>('piece');
  const [imageUrl, setImageUrl] = useState<string>('📦');
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getSettings().then(setSettings).catch(() => {});

      if (productToEdit) {
        setName(productToEdit.name);
        setCategory(productToEdit.category);
        setPriceInput(centsToDecimalString(productToEdit.price));
        setCostPriceInput(productToEdit.cost_price ? centsToDecimalString(productToEdit.cost_price) : '');
        setStockQuantity(productToEdit.stock_quantity);
        setLowStockThreshold(productToEdit.low_stock_threshold);
        setUnitType(productToEdit.unit_type || 'piece');
        setImageUrl(productToEdit.image_url || '📦');
        setAttributes(productToEdit.attributes || {});
      } else {
        setName('');
        setCategory('Beverages');
        setPriceInput('');
        setCostPriceInput('');
        setStockQuantity(10);
        setLowStockThreshold(5);
        setUnitType('piece');
        setImageUrl('📦');
        setAttributes({});
      }
      setIsSubmitting(false);
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleAttrChange = (key: string, value: any) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

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
        unit_type: unitType,
        attributes,
        image_url: imageUrl,
      });
      onClose();
    } catch (err) {
      alert('Failed to save product: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessType = settings?.business_type || 'GENERAL_RETAIL';

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
                placeholder="e.g. Paracetamol 500mg or Coca Cola"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category & Unit Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Unit of Sale</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as UnitType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                {UNIT_TYPES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
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
                Current Stock ({unitType})
              </label>
              <input
                type="number"
                min="0"
                step={unitType === 'piece' ? '1' : '0.01'}
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Alert Level
              </label>
              <input
                type="number"
                min="1"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Business Vertical Specific Dynamic Attributes */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Vertical Attributes ({businessType.replace('_', ' ')})
            </span>

            {/* Pharmacy Specific Fields */}
            {businessType === 'PHARMACY' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Expiry Date</label>
                    <input
                      type="date"
                      value={attributes.expiry_date || ''}
                      onChange={(e) => handleAttrChange('expiry_date', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Batch Number</label>
                    <input
                      type="text"
                      placeholder="e.g. BCH-901"
                      value={attributes.batch_no || ''}
                      onChange={(e) => handleAttrChange('batch_no', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={!!attributes.prescription_required}
                    onChange={(e) => handleAttrChange('prescription_required', e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Requires Prescription (Rx)</span>
                </label>
              </div>
            )}

            {/* Restaurant Specific Fields */}
            {businessType === 'RESTAURANT' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Prep Time (mins)</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={attributes.prep_time_mins || ''}
                    onChange={(e) => handleAttrChange('prep_time_mins', parseInt(e.target.value) || '')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Allergens</label>
                  <input
                    type="text"
                    placeholder="e.g. Nuts, Dairy"
                    value={attributes.allergens || ''}
                    onChange={(e) => handleAttrChange('allergens', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Custom Attributes Defined by User */}
            {settings?.custom_attributes && settings.custom_attributes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block">Custom Defined Fields</span>
                <div className="grid grid-cols-2 gap-2">
                  {settings.custom_attributes.map((attr) => (
                    <div key={attr.key}>
                      <label className="text-[11px] font-semibold text-slate-300">{attr.label}</label>
                      <input
                        type={attr.type === 'number' ? 'number' : attr.type === 'date' ? 'date' : 'text'}
                        value={attributes[attr.key] || ''}
                        onChange={(e) => handleAttrChange(attr.key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
