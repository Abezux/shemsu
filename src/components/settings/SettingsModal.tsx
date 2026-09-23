import React, { useState, useEffect } from 'react';
import { StoreSettings, BusinessType, AttributeDefinition } from '@/types';
import { CURRENCY_PRESETS } from '@/utils/currency';
import { X, Settings, Store, ShieldAlert, Layers, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onSave: (settings: StoreSettings) => Promise<void>;
}

const BUSINESS_TYPES: { id: BusinessType; name: string; icon: string; desc: string }[] = [
  { id: 'GENERAL_RETAIL', name: 'General Retail', icon: '🏬', desc: 'Standard retail shop catalog' },
  { id: 'MINI_SHOP', name: 'Mini-Shop / Kiosk', icon: '🛒', desc: 'Fast counter sales for snacks & drinks' },
  { id: 'PHARMACY', name: 'Pharmacy / Drugstore', icon: '💊', desc: 'Tracks expiry dates, batch numbers & prescriptions' },
  { id: 'RESTAURANT', name: 'Restaurant / Food Stall', icon: '🍔', desc: 'Tracks prep times, ingredients & unit measures' },
  { id: 'SALON', name: 'Salon & Services', icon: '✂️', desc: 'Tracks service duration & beauty products' },
];

export default function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [storeName, setStoreName] = useState(settings.store_name);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol);
  const [currencyCode, setCurrencyCode] = useState(settings.currency_code);
  const [businessType, setBusinessType] = useState<BusinessType>(settings.business_type || 'GENERAL_RETAIL');
  const [expiryAlertDays, setExpiryAlertDays] = useState<number>(settings.expiry_alert_days || 30);
  const [customAttributes, setCustomAttributes] = useState<AttributeDefinition[]>(settings.custom_attributes || []);

  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<'text' | 'number' | 'date' | 'boolean'>('text');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStoreName(settings.store_name);
      setCurrencySymbol(settings.currency_symbol);
      setCurrencyCode(settings.currency_code);
      setBusinessType(settings.business_type || 'GENERAL_RETAIL');
      setExpiryAlertDays(settings.expiry_alert_days || 30);
      setCustomAttributes(settings.custom_attributes || []);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleCurrencySelect = (preset: typeof CURRENCY_PRESETS[0]) => {
    setCurrencySymbol(preset.symbol);
    setCurrencyCode(preset.code);
  };

  const handleAddCustomAttribute = () => {
    if (!newLabel.trim()) return;
    const key = newKey.trim() || newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (customAttributes.some((a) => a.key === key)) {
      alert('An attribute with this key already exists.');
      return;
    }
    setCustomAttributes([...customAttributes, { key, label: newLabel.trim(), type: newType }]);
    setNewKey('');
    setNewLabel('');
    setNewType('text');
  };

  const handleRemoveCustomAttribute = (key: string) => {
    setCustomAttributes(customAttributes.filter((a) => a.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...settings,
        store_name: storeName.trim(),
        currency_symbol: currencySymbol,
        currency_code: currencyCode,
        business_type: businessType,
        expiry_alert_days: expiryAlertDays,
        custom_attributes: customAttributes,
      });
      onClose();
    } catch (err) {
      alert('Failed to save settings: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-lg">Store Settings & Business Vertical</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Store Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Shop / Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Business Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Business Vertical Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((bt) => {
                const isSelected = businessType === bt.id;
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBusinessType(bt.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xl shrink-0">{bt.icon}</span>
                    <div>
                      <span className="font-bold text-xs block text-slate-100">{bt.name}</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{bt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Currency Symbol
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CURRENCY_PRESETS.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => handleCurrencySelect(curr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                    currencySymbol === curr.symbol && currencyCode === curr.code
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {curr.name}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Alerts Threshold */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Expiry Alert Threshold (Days)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="365"
                value={expiryAlertDays}
                onChange={(e) => setExpiryAlertDays(parseInt(e.target.value) || 30)}
                className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400">
                Warn when products expire within <strong className="text-amber-300">{expiryAlertDays} days</strong>
              </span>
            </div>
          </div>

          {/* Custom Attribute Definition Builder */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" /> Custom Product Attribute Definitions
              </label>
            </div>

            {/* List of custom fields */}
            <div className="space-y-2">
              {customAttributes.map((attr) => (
                <div
                  key={attr.key}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200">{attr.label}</span>
                    <span className="text-[10px] text-slate-500 ml-2 uppercase font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {attr.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomAttribute(attr.key)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Attribute Input Row */}
            <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-medium block">Add New Field Definition</span>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Field Label (e.g. Supplier)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Yes/No</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCustomAttribute}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Attribute Definition
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
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
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
