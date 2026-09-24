import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BusinessType } from '@/types';
import { CURRENCY_PRESETS } from '@/utils/currency';
import { api } from '@/services/api';
import { Store, Sparkles, ArrowRight, CheckCircle2, Package, Layers } from 'lucide-react';

const BUSINESS_TYPES: { id: BusinessType; name: string; icon: string; desc: string }[] = [
  { id: 'GENERAL_RETAIL', name: 'General Retail', icon: '🏬', desc: 'Standard retail shop catalog' },
  { id: 'MINI_SHOP', name: 'Mini-Shop / Kiosk', icon: '🛒', desc: 'Fast counter sales for snacks & drinks' },
  { id: 'PHARMACY', name: 'Pharmacy / Drugstore', icon: '💊', desc: 'Tracks expiry dates, batch numbers & prescriptions' },
  { id: 'RESTAURANT', name: 'Restaurant / Food Stall', icon: '🍔', desc: 'Tracks prep times, ingredients & unit measures' },
  { id: 'SALON', name: 'Salon & Services', icon: '✂️', desc: 'Tracks service duration & beauty products' },
];

export default function OnboardingView() {
  const { createStore } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 State
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('MINI_SHOP');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');

  // Step 2 State
  const [seedOption, setSeedOption] = useState<'DEMO' | 'EMPTY'>('DEMO');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setErrorMsg('Please enter a name for your store.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleStep2Submit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // 1. Create Store
      const res = await createStore(storeName, businessType, currencySymbol, currencyCode);
      if (res.error) {
        setErrorMsg(res.error);
        setIsSubmitting(false);
        return;
      }

      // 2. Seed catalog if selected
      if (seedOption === 'DEMO') {
        await api.seedDemo();
      }

      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete onboarding setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center font-bold">
              {step}
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">
                {step === 1 ? 'Step 1: Store Setup' : 'Step 2: Catalog Initialization'}
              </h2>
              <span className="text-xs text-slate-400">
                {step === 1 ? 'Configure your store name, business vertical & currency' : 'Choose how to start your product catalog'}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {step} of 2
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: STORE & VERTICAL CONFIGURATION */}
        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Store / Shop Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Corner Mini-Market or City Pharmacy"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Business Vertical Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Your Business Vertical
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

            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Currency
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CURRENCY_PRESETS.map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      setCurrencySymbol(curr.symbol);
                      setCurrencyCode(curr.code);
                    }}
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

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Continue to Step 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: CATALOG INITIALIZATION */
          <div className="space-y-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              How would you like to initialize your catalog?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSeedOption('DEMO')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  seedOption === 'DEMO'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Load Demo Catalog</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Pre-populates sample items (drinks, snacks, medicines) tailored to your business vertical for instant testing.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeedOption('EMPTY')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  seedOption === 'EMPTY'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-6 h-6 text-slate-400" />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Start Fresh</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Start with a clean empty catalog and add your own products manually.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
              >
                Back to Step 1
              </button>
              <button
                type="button"
                onClick={handleStep2Submit}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Initializing...' : 'Complete & Open POS'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
