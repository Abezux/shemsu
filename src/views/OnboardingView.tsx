import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BusinessType } from '@/types';
import { CURRENCY_PRESETS } from '@/utils/currency';
import { api } from '@/services/api';
import { Sparkles, ArrowRight, CheckCircle2, Package } from 'lucide-react';

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
    <div className="min-h-screen bg-agora-bg text-agora-ink flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl ledger-card p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-agora-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-agora-terracotta/10 text-agora-terracotta border border-agora-terracotta/30 rounded-xl flex items-center justify-center font-serif font-black">
              {step}
            </div>
            <div>
              <h2 className="font-serif font-bold text-agora-ink text-lg">
                {step === 1 ? 'Step 1: Store & Ledger Setup' : 'Step 2: Catalog Initialization'}
              </h2>
              <span className="text-xs text-agora-ink-muted font-medium">
                {step === 1 ? 'Configure your store name, business vertical & currency' : 'Choose how to start your product catalog'}
              </span>
            </div>
          </div>
          <span className="text-xs font-serif font-bold text-agora-terracotta bg-agora-terracotta-light px-3 py-1 rounded-full border border-agora-terracotta-border">
            {step} of 2
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-agora-brick-light border border-agora-brick-border rounded-2xl text-xs text-agora-brick font-medium">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: STORE & VERTICAL CONFIGURATION */}
        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-agora-ink">Store / Shop Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Corner Mini-Market or City Pharmacy"
                className="w-full bg-agora-bg border border-agora-border rounded-xl py-2.5 px-3 text-sm text-agora-ink placeholder-agora-ink-muted/60 focus:outline-none focus:border-agora-terracotta"
              />
            </div>

            {/* Business Vertical Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-agora-ink-muted mb-2">
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
                          ? 'bg-agora-terracotta/15 border-agora-terracotta text-agora-terracotta shadow-sm'
                          : 'bg-agora-bg/60 border-agora-border text-agora-ink-muted hover:text-agora-ink'
                      }`}
                    >
                      <span className="text-xl shrink-0">{bt.icon}</span>
                      <div>
                        <span className="font-bold text-xs block text-agora-ink">{bt.name}</span>
                        <span className="text-[10px] text-agora-ink-muted leading-tight block mt-0.5">{bt.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-agora-ink-muted">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold border shrink-0 transition-all ${
                      currencySymbol === curr.symbol && currencyCode === curr.code
                        ? 'bg-agora-terracotta text-agora-card border-agora-terracotta'
                        : 'bg-agora-card border-agora-border text-agora-ink-muted hover:text-agora-ink'
                    }`}
                  >
                    {curr.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Continue to Step 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: CATALOG INITIALIZATION */
          <div className="space-y-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-agora-ink-muted">
              How would you like to initialize your catalog?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSeedOption('DEMO')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  seedOption === 'DEMO'
                    ? 'bg-agora-terracotta/15 border-agora-terracotta text-agora-terracotta shadow-sm'
                    : 'bg-agora-bg/60 border-agora-border text-agora-ink-muted hover:text-agora-ink'
                }`}
              >
                <Sparkles className="w-6 h-6 text-agora-terracotta" />
                <div>
                  <h4 className="font-serif font-bold text-agora-ink text-sm">Load Demo Catalog</h4>
                  <p className="text-xs text-agora-ink-muted mt-1">
                    Pre-populates sample items (drinks, snacks, medicines) tailored to your business vertical for instant testing.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeedOption('EMPTY')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  seedOption === 'EMPTY'
                    ? 'bg-agora-terracotta/15 border-agora-terracotta text-agora-terracotta shadow-sm'
                    : 'bg-agora-bg/60 border-agora-border text-agora-ink-muted hover:text-agora-ink'
                }`}
              >
                <Package className="w-6 h-6 text-agora-brass" />
                <div>
                  <h4 className="font-serif font-bold text-agora-ink text-sm">Start Fresh</h4>
                  <p className="text-xs text-agora-ink-muted mt-1">
                    Start with a clean empty catalog and add your own products manually.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-agora-bg hover:bg-agora-border text-agora-ink font-bold rounded-xl text-sm transition-all border border-agora-border"
              >
                Back to Step 1
              </button>
              <button
                type="button"
                onClick={handleStep2Submit}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Initializing...' : 'Complete & Open Ledger'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
