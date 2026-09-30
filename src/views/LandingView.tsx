import React, { useState } from 'react';
import AgoraLogo from '@/components/navigation/AgoraLogo';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Star,
  Receipt,
  Sparkles,
  BarChart3,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  HelpCircle,
  Clock,
  Layers,
  Check,
  Lock,
} from 'lucide-react';

interface LandingViewProps {
  onOpenAuth: (initialMode?: 'LOGIN' | 'SIGNUP') => void;
  onLaunchDemo?: () => void;
}

export default function LandingView({ onOpenAuth, onLaunchDemo }: LandingViewProps) {
  // Interactive Hero POS Simulator State
  const [cartItems, setCartItems] = useState<
    { id: string; name: string; price: number; qty: number; isFav?: boolean }[]
  >([
    { id: '1', name: 'Artisanal Dark Roast (250g)', price: 450, qty: 1, isFav: true },
    { id: '2', name: 'Raw Highland Honey (500ml)', price: 680, qty: 2, isFav: true },
  ]);
  const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'TELEBIRR' | 'CBE_BIRR' | 'CARD'>('TELEBIRR');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Interactive ROI Calculator State
  const [dailyTx, setDailyTx] = useState<number>(85);
  const [avgBasket, setAvgBasket] = useState<number>(350);

  // Feature Sandbox Active Tab
  const [activeFeatureTab, setActiveFeatureTab] = useState<'pos' | 'inventory' | 'analytics' | 'payments'>('pos');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Calculations for Hero Simulator
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + vat;

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof prev
    );
  };

  const handleSimulateCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCartItems([
        { id: '1', name: 'Artisanal Dark Roast (250g)', price: 450, qty: 1, isFav: true },
        { id: '2', name: 'Raw Highland Honey (500ml)', price: 680, qty: 2, isFav: true },
      ]);
    }, 2500);
  };

  // ROI Calculator Calculations
  const monthlyRevenue = dailyTx * avgBasket * 30;
  const hoursSavedPerMonth = Math.round((dailyTx * 45 * 30) / 3600);
  const preventedLeaks = Math.round(monthlyRevenue * 0.045);

  const sampleCatalog = [
    { id: '1', name: 'Artisanal Dark Roast (250g)', price: 450, isFav: true, stock: 42 },
    { id: '2', name: 'Raw Highland Honey (500ml)', price: 680, isFav: true, stock: 4 }, // low stock!
    { id: '3', name: 'Bespoke Ceramic Mug', price: 320, isFav: false, stock: 19 },
    { id: '4', name: 'Spiced Black Tea Blend', price: 210, isFav: false, stock: 2 }, // low stock!
  ];

  const faqs = [
    {
      q: 'Does Agora work when the internet cuts out?',
      a: 'Yes! Agora is engineered offline-first. Transactions, cart additions, and inventory updates save instantly to local storage and sync seamlessly with the cloud as soon as connection is restored.',
    },
    {
      q: 'Which local and international payment methods are supported?',
      a: 'Agora natively supports Cash, Telebirr QR, CBE Birr, and Card swipe/chip methods. You can also define custom local mobile wallet tenders in your store settings.',
    },
    {
      q: 'Can I export my daily sales and inventory logs for tax/accounting?',
      a: 'Absolutely. Every receipt, register closure summary, and stock movement is stored in an immutable audit ledger exportable to standard CSV format with a single click.',
    },
    {
      q: 'What hardware or devices do I need?',
      a: 'None required! Agora runs in any modern browser on iPads, Android tablets, desktop PCs, touchscreen laptops, or mobile phones. Optional USB/Bluetooth barcode scanners and thermal receipt printers connect directly.',
    },
  ];

  return (
    <div className="min-h-screen bg-agora-bg text-agora-ink selection:bg-agora-terracotta selection:text-agora-card flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-agora-bg/90 backdrop-blur-md border-b border-agora-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <AgoraLogo size="md" />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-agora-ink-muted">
          <a href="#features" className="hover:text-agora-ink transition-colors">
            Features
          </a>
          <a href="#sandbox" className="hover:text-agora-ink transition-colors">
            Interactive POS
          </a>
          <a href="#calculator" className="hover:text-agora-ink transition-colors">
            ROI Calculator
          </a>
          <a href="#pricing" className="hover:text-agora-ink transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-agora-ink transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAuth('LOGIN')}
            className="px-4 py-2 text-xs font-bold text-agora-ink hover:bg-agora-card border border-transparent hover:border-agora-border rounded-xl transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('SIGNUP')}
            className="px-4 py-2 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card text-xs font-serif font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <span>Open Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Subtle Background Accent Orbs */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-agora-terracotta/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Hero Left Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-agora-card border border-agora-border rounded-full shadow-sm text-xs font-bold text-agora-brass">
              <Sparkles className="w-3.5 h-3.5 text-agora-terracotta" />
              <span>Digital Trade Ledger & POS for Retail</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-agora-ink leading-[1.1]">
              The Point of Sale Built for High-Speed Merchants.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-agora-ink-muted leading-relaxed max-w-xl font-medium">
              Effortless checkout, color-coded stock health alerts, dynamic revenue analytics, and offline-first digital ledger. Warm paper design meets modern fintech performance.
            </p>

            {/* Primary Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="px-6 py-3.5 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card text-sm font-serif font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#sandbox"
                className="px-5 py-3.5 bg-agora-card hover:bg-agora-bg border border-agora-border rounded-2xl text-sm font-bold text-agora-ink transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-agora-gold" />
                <span>Try Live Demo</span>
              </a>
            </div>

            {/* Trust Badges Strip */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-agora-border/70 text-xs font-semibold text-agora-ink-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-agora-sage shrink-0" />
                <span>Offline-First Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-agora-sage shrink-0" />
                <span>Zero Monthly Fee Tier</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-agora-sage shrink-0" />
                <span>CSV Audit Export</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive Mini POS Sandbox Card */}
          <div className="lg:col-span-6">
            <div className="bg-agora-card border border-agora-border rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
              {/* Card Title Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-agora-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-agora-brick/60" />
                  <div className="w-3 h-3 rounded-full bg-agora-gold/60" />
                  <div className="w-3 h-3 rounded-full bg-agora-sage/60" />
                  <span className="text-xs font-bold text-agora-ink-muted ml-2">Live POS Terminal</span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-agora-sage bg-agora-sage-light px-2.5 py-0.5 rounded-full border border-agora-sage-border">
                  ● Register Open
                </span>
              </div>

              {/* Checkout Status Notification */}
              {checkoutSuccess ? (
                <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-agora-sage-light text-agora-sage rounded-2xl flex items-center justify-center mx-auto border border-agora-sage-border shadow-sm">
                    <Receipt className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-agora-ink">Receipt Printed & Saved</h3>
                  <p className="text-xs text-agora-ink-muted">Transaction #AG-9402 logged to digital ledger</p>
                  <span className="inline-block text-[11px] font-bold text-agora-brass bg-agora-bg px-3 py-1 rounded-xl border border-agora-border">
                    {selectedPayment} • {total.toLocaleString()} ETB
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick Tap Catalog Strip */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-agora-ink-muted block mb-2">
                      Tap Item to Add to Cart
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleCatalog.map((item) => {
                        const inCart = cartItems.find((c) => c.id === item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (inCart) {
                                updateQuantity(item.id, 1);
                              } else {
                                setCartItems((prev) => [
                                  ...prev,
                                  { id: item.id, name: item.name, price: item.price, qty: 1, isFav: item.isFav },
                                ]);
                              }
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                              inCart
                                ? 'bg-agora-terracotta/5 border-agora-terracotta/40 shadow-sm'
                                : 'bg-agora-bg hover:bg-agora-card border-agora-border'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-agora-ink line-clamp-1">{item.name}</span>
                              {item.isFav && <Star className="w-3 h-3 text-agora-gold fill-agora-gold shrink-0" />}
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-agora-border/50 text-[11px]">
                              <span className="font-serif font-bold text-agora-ink">{item.price} ETB</span>
                              {item.stock <= 5 ? (
                                <span className="text-[10px] font-bold text-agora-gold bg-agora-gold-light px-1.5 rounded border border-agora-gold-border">
                                  {item.stock} left
                                </span>
                              ) : (
                                <span className="text-[10px] text-agora-ink-muted">{item.stock} in stock</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cart Itemization List */}
                  <div className="bg-agora-bg p-3 rounded-2xl border border-agora-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-agora-ink border-b border-agora-border/60 pb-1.5">
                      <span>Cart Summary</span>
                      <span className="text-agora-brass">{cartItems.length} items</span>
                    </div>

                    {cartItems.length === 0 ? (
                      <p className="text-xs text-agora-ink-muted py-4 text-center">Cart is empty. Tap items above.</p>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1">
                            <span className="font-semibold text-agora-ink truncate max-w-[160px]">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-agora-card border border-agora-border rounded-lg px-1.5 py-0.5">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="text-agora-ink-muted hover:text-agora-ink p-0.5"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-agora-ink w-4 text-center">{item.qty}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="text-agora-ink-muted hover:text-agora-ink p-0.5"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="font-serif font-bold text-agora-ink w-16 text-right">
                                {item.price * item.qty} ETB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total & Payment Method Selector */}
                    <div className="pt-2 border-t border-agora-border/80 space-y-2">
                      <div className="grid grid-cols-4 gap-1">
                        {(['CASH', 'TELEBIRR', 'CBE_BIRR', 'CARD'] as const).map((method) => (
                          <button
                            key={method}
                            onClick={() => setSelectedPayment(method)}
                            className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              selectedPayment === method
                                ? 'bg-agora-terracotta text-agora-card border-agora-terracotta'
                                : 'bg-agora-card text-agora-ink-muted border-agora-border hover:border-agora-brass'
                            }`}
                          >
                            {method.replace('_', ' ')}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleSimulateCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full py-3 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl shadow active:scale-[0.99] transition-all flex items-center justify-center justify-between px-4 text-sm disabled:opacity-40"
                      >
                        <span>Charge {selectedPayment.replace('_', ' ')}</span>
                        <span className="text-base">{total.toLocaleString()} ETB</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Tour Sandbox */}
      <section id="sandbox" className="py-16 px-4 sm:px-8 bg-agora-card border-y border-agora-border">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-agora-ink">
              Crafted for Real-World Retail Workflow
            </h2>
            <p className="text-sm text-agora-ink-muted">
              Every view in Agora is optimized for zero-friction daily operation. Explore the key core capabilities below.
            </p>
          </div>

          {/* Tab Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              { id: 'pos', label: 'Speed Register', icon: ShoppingBag },
              { id: 'inventory', label: 'Stock Health Alerts', icon: Package },
              { id: 'analytics', label: 'Financial Intelligence', icon: TrendingUp },
              { id: 'payments', label: 'Multi-Currency & VAT', icon: Receipt },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-agora-terracotta text-agora-card border-agora-terracotta shadow-sm font-serif'
                      : 'bg-agora-bg text-agora-ink-muted border-agora-border hover:text-agora-ink hover:border-agora-brass'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Panel */}
          <div className="bg-agora-bg border border-agora-border rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-sm">
            {activeFeatureTab === 'pos' && (
              <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-agora-terracotta/10 text-agora-terracotta rounded-2xl flex items-center justify-center border border-agora-terracotta-border">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Lightning Point of Sale with Quick Favorites
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    Pin your top 10 bestselling items for single-tap addition. Search by title, barcode, or category. Split tender between Cash and Telebirr with automatic change calculation.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Star-to-pin fast product layout</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Barcode scanner camera & hardware integration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Custom percentage or fixed discounts</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold border-b pb-2 border-agora-border">
                    <span>Favorite Shortcuts</span>
                    <span className="text-agora-gold font-serif">★ Pinned Items</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-agora-bg border border-agora-border rounded-xl">
                      <span className="text-xs font-bold block text-agora-ink">Espresso Beans</span>
                      <span className="text-[11px] font-serif font-bold text-agora-terracotta mt-1 block">450 ETB</span>
                    </div>
                    <div className="p-3 bg-agora-bg border border-agora-border rounded-xl">
                      <span className="text-xs font-bold block text-agora-ink">Filtered Water 1L</span>
                      <span className="text-[11px] font-serif font-bold text-agora-terracotta mt-1 block">45 ETB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'inventory' && (
              <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-agora-gold-light text-agora-gold rounded-2xl flex items-center justify-center border border-agora-gold-border">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Dedicated Gold Stock Warning System
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    Never run out of stock unexpectedly. Agora uses a strict color token hierarchy — reserving warm gold (<code className="text-agora-gold font-bold">#C99A2E</code>) exclusively for items nearing depletion.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Custom alert threshold limits per product</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>One-tap stock replenishment drawer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Expiry date tracking for perishable inventory</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-3">
                  <div className="p-3 bg-agora-gold-light border border-agora-gold-border rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-agora-gold" />
                      <span className="font-bold text-agora-ink">Raw Highland Honey</span>
                    </div>
                    <span className="font-bold text-agora-gold">4 units left</span>
                  </div>
                  <div className="p-3 bg-agora-gold-light border border-agora-gold-border rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-agora-gold" />
                      <span className="font-bold text-agora-ink">Spiced Black Tea</span>
                    </div>
                    <span className="font-bold text-agora-gold">2 units left</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'analytics' && (
              <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-agora-sage-light text-agora-sage rounded-2xl flex items-center justify-center border border-agora-sage-border">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Financial Intelligence & Revenue Trends
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    Track daily net revenue, sales volume, and item velocity. The revenue line dynamically shifts to Sage Green for profit increases and Brick Red for dips.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Continuous drag scrubbing analytics chart</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Hourly transaction heatmaps for shift planning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Detailed item drilldown modal per receipt</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-3">
                  <span className="text-[11px] font-bold text-agora-ink-muted uppercase">Today Net Revenue</span>
                  <div className="text-2xl font-serif font-bold text-agora-ink">28,450 ETB</div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-agora-sage bg-agora-sage-light px-2.5 py-0.5 rounded-full border border-agora-sage-border">
                    ↑ +14.2% vs yesterday
                  </div>
                  <div className="h-16 w-full bg-agora-bg border border-agora-border rounded-xl p-2 flex items-end gap-1.5">
                    {[40, 55, 35, 70, 85, 95, 80].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-agora-sage rounded-t transition-all hover:bg-agora-sage-border"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'payments' && (
              <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-agora-brass/10 text-agora-brass rounded-2xl flex items-center justify-center border border-agora-brass-border">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Local Gateways & Customizable Tax Receipts
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    Set up your store currency, VAT percentage toggle, receipt header note, and localized payment tenders in under 2 minutes.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Telebirr & CBE Birr ready tender buttons</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Itemized tax toggle & custom currency symbols</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Direct receipt printing & SMS/WhatsApp share links</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-2 text-xs">
                  <div className="font-serif font-bold text-sm text-center border-b pb-2 border-agora-border">
                    AGORA BOUTIQUE LEDGER
                  </div>
                  <div className="flex justify-between text-agora-ink-muted">
                    <span>Receipt #AG-8821</span>
                    <span>14:32 Today</span>
                  </div>
                  <div className="py-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Honey 500ml (x2)</span>
                      <span className="font-serif font-bold">1,360 ETB</span>
                    </div>
                    <div className="flex justify-between text-agora-ink-muted text-[11px]">
                      <span>VAT (15%)</span>
                      <span>204 ETB</span>
                    </div>
                  </div>
                  <div className="border-t border-agora-border pt-2 flex justify-between font-bold text-sm text-agora-ink">
                    <span>TOTAL</span>
                    <span className="font-serif text-agora-terracotta">1,564 ETB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section id="calculator" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-agora-card border border-agora-border rounded-3xl p-6 sm:p-10 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-agora-terracotta bg-agora-terracotta-light px-3 py-1 rounded-full border border-agora-terracotta-border">
              Merchant Impact Estimator
            </span>
            <h2 className="text-3xl font-serif font-extrabold text-agora-ink">
              Calculate Your Monthly Time & Revenue Savings
            </h2>
            <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
              Adjust your average daily sales volume and average basket size to see how much speed and stock-loss prevention Agora delivers.
            </p>

            {/* Controls */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Daily Transactions</span>
                  <span className="text-agora-terracotta">{dailyTx} checkouts/day</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={dailyTx}
                  onChange={(e) => setDailyTx(Number(e.target.value))}
                  className="w-full accent-agora-terracotta bg-agora-border h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Average Basket Size</span>
                  <span className="text-agora-terracotta">{avgBasket.toLocaleString()} ETB</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="50"
                  value={avgBasket}
                  onChange={(e) => setAvgBasket(Number(e.target.value))}
                  className="w-full accent-agora-terracotta bg-agora-border h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
            <div className="bg-agora-bg p-5 rounded-2xl border border-agora-border space-y-2">
              <Clock className="w-5 h-5 text-agora-terracotta" />
              <span className="text-xs text-agora-ink-muted font-bold block">Checkout Time Saved</span>
              <div className="text-2xl font-serif font-bold text-agora-ink">{hoursSavedPerMonth} hrs</div>
              <span className="text-[11px] text-agora-ink-muted">Saved at counter every month</span>
            </div>

            <div className="bg-agora-bg p-5 rounded-2xl border border-agora-border space-y-2">
              <ShieldCheck className="w-5 h-5 text-agora-gold" />
              <span className="text-xs text-agora-ink-muted font-bold block">Stock Leak Reduction</span>
              <div className="text-2xl font-serif font-bold text-agora-gold">{preventedLeaks.toLocaleString()} ETB</div>
              <span className="text-[11px] text-agora-ink-muted">Prevented stock depletion loss</span>
            </div>

            <div className="bg-agora-bg p-5 rounded-2xl border border-agora-border space-y-2">
              <BarChart3 className="w-5 h-5 text-agora-sage" />
              <span className="text-xs text-agora-ink-muted font-bold block">Monthly Processed</span>
              <div className="text-2xl font-serif font-bold text-agora-sage">{monthlyRevenue.toLocaleString()} ETB</div>
              <span className="text-[11px] text-agora-ink-muted">Projected register volume</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-8 bg-agora-card border-t border-agora-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-agora-ink">
              Transparent, Merchant-First Pricing
            </h2>
            <p className="text-sm text-agora-ink-muted">
              Start free with no credit card required. Upgrade as your store catalog and register fleet expands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-agora-bg border border-agora-border rounded-3xl p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-agora-brass uppercase tracking-wider block">Starter Ledger</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-agora-ink">$0</span>
                  <span className="text-xs text-agora-ink-muted">/ forever</span>
                </div>
                <p className="text-xs text-agora-ink-muted">Ideal for new boutique stores and sole trade registers.</p>
                <ul className="space-y-2.5 text-xs text-agora-ink font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Single POS Register</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Up to 250 Active Products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Offline Storage & Cloud Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>CSV Sales Log Export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="w-full py-3 bg-agora-card hover:bg-agora-bg border border-agora-border font-serif font-bold text-xs rounded-xl text-agora-ink transition-all"
              >
                Start Free Now
              </button>
            </div>

            {/* Pro Merchant (Highlighted) */}
            <div className="bg-agora-card border-2 border-agora-terracotta rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-agora-terracotta text-agora-card text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-agora-terracotta uppercase tracking-wider block">Merchant Pro</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-agora-ink">$19</span>
                  <span className="text-xs text-agora-ink-muted">/ month</span>
                </div>
                <p className="text-xs text-agora-ink-muted">For growing retail shops needing multi-register sync & stock health alerts.</p>
                <ul className="space-y-2.5 text-xs text-agora-ink font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Unlimited Products & Categories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Multi-Register & Staff Permissions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Gold Low-Stock Alerts & Restock Modal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Telebirr & CBE Birr Payment Webhooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Priority Merchant Support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="w-full py-3 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold text-xs rounded-xl shadow transition-all"
              >
                Launch Pro Trial
              </button>
            </div>

            {/* Enterprise Fleet */}
            <div className="bg-agora-bg border border-agora-border rounded-3xl p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-agora-brass uppercase tracking-wider block">Fleet & Chain</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-agora-ink">Custom</span>
                </div>
                <p className="text-xs text-agora-ink-muted">For multi-location chains requiring custom ERP sync & branch reporting.</p>
                <ul className="space-y-2.5 text-xs text-agora-ink font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Multi-Branch Inventory Routing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Custom Hardware API & Printers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-agora-sage" />
                    <span>SLA Guarantee & Onsite Setup</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="w-full py-3 bg-agora-card hover:bg-agora-bg border border-agora-border font-serif font-bold text-xs rounded-xl text-agora-ink transition-all"
              >
                Contact Fleet Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-agora-ink">Frequently Asked Questions</h2>
          <p className="text-xs text-agora-ink-muted">Everything you need to know about setting up Agora for your store.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-agora-card border border-agora-border rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-agora-ink hover:bg-agora-bg/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-agora-ink-muted shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-agora-terracotta' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-agora-ink-muted leading-relaxed border-t border-agora-border/40 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Strip */}
      <section className="py-16 px-4 sm:px-8 bg-agora-terracotta text-agora-card text-center space-y-6 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight">
            Ready to Upgrade Your Store Counter?
          </h2>
          <p className="text-xs sm:text-sm text-agora-card/90 max-w-xl mx-auto leading-relaxed font-medium">
            Join thousands of retail merchants using Agora to speed up checkouts, eliminate stockouts, and track net revenue seamlessly.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('SIGNUP')}
              className="px-6 py-3 bg-agora-card hover:bg-agora-bg text-agora-ink text-sm font-serif font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
            >
              Open Your Store Register Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-agora-bg border-t border-agora-border px-4 sm:px-8 py-8 text-xs text-agora-ink-muted flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AgoraLogo size="sm" />
          <span>© {new Date().getFullYear()} Agora Inc. Digital Trade Ledger.</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-agora-sage bg-agora-card px-3 py-1 rounded-full border border-agora-border">
          <span className="w-2 h-2 rounded-full bg-agora-sage animate-pulse" />
          <span>All Systems Operational</span>
        </div>
      </footer>
    </div>
  );
}
