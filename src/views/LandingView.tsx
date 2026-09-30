import React, { useState } from 'react';
import AgoraLogo from '@/components/navigation/AgoraLogo';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Receipt,
  ArrowRight,
  Check,
  ChevronDown,
  Star,
  Plus,
  Minus,
  RotateCcw,
  BookOpen,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  DollarSign,
  Shield,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface LandingViewProps {
  onOpenAuth: (initialMode?: 'LOGIN' | 'SIGNUP') => void;
}

export default function LandingView({ onOpenAuth }: LandingViewProps) {
  // Hero POS Demo State (Accurate to real app logic)
  const [cartItems, setCartItems] = useState<
    { id: string; name: string; price: number; qty: number; isFav?: boolean }[]
  >([
    { id: '1', name: 'Highland Coffee Beans (250g)', price: 450, qty: 1, isFav: true },
    { id: '2', name: 'Raw Organic Honey (500ml)', price: 680, qty: 1, isFav: true },
  ]);
  const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'MOBILE_MONEY' | 'CARD' | 'SPLIT'>('CASH');
  const [checkoutReceipt, setCheckoutReceipt] = useState<{
    id: string;
    total: number;
    payment: string;
    itemsCount: number;
  } | null>(null);

  // Feature Sandbox Active Tab
  const [activeFeatureTab, setActiveFeatureTab] = useState<'register' | 'stock' | 'history' | 'reports'>('register');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Cart Totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = subtotal;

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
    if (cartItems.length === 0) return;
    const saleId = `AG-${Math.floor(1000 + Math.random() * 9000)}`;
    setCheckoutReceipt({
      id: saleId,
      total,
      payment: selectedPayment.replace('_', ' '),
      itemsCount: cartItems.reduce((acc, i) => acc + i.qty, 0),
    });
  };

  const handleResetDemoCart = () => {
    setCheckoutReceipt(null);
    setCartItems([
      { id: '1', name: 'Highland Coffee Beans (250g)', price: 450, qty: 1, isFav: true },
      { id: '2', name: 'Raw Organic Honey (500ml)', price: 680, qty: 1, isFav: true },
    ]);
  };

  const sampleProducts = [
    { id: '1', name: 'Highland Coffee Beans (250g)', price: 450, isFav: true, stock: 38 },
    { id: '2', name: 'Raw Organic Honey (500ml)', price: 680, isFav: true, stock: 4 }, // low stock
    { id: '3', name: 'Ceramic Espresso Cup', price: 320, isFav: false, stock: 15 },
    { id: '4', name: 'Spiced Black Tea Blend', price: 210, isFav: false, stock: 2 }, // low stock
  ];

  const faqs = [
    {
      q: 'How does Agora prevent sales and inventory drift?',
      a: 'In a paper notebook, sales are logged in one column while stock levels are guessed on the shelf. In Agora, every tap at checkout automatically subtracts the exact quantity from your inventory count and updates your daily revenue total in real time.',
    },
    {
      q: 'What happens if the internet goes down during business hours?',
      a: 'Agora is built offline-first. Transactions, cart additions, and inventory updates save instantly to your browser local storage. When your internet returns, your local register syncs smoothly back to your database without interrupting sales.',
    },
    {
      q: 'How are payment methods tracked at checkout?',
      a: 'Agora lets your register operator record whether a customer paid via Cash, Mobile Money (such as Telebirr or CBE Birr), Card, or a Split payment across multiple tender types. You can reconcile cash drawer totals against mobile transfers at register closure.',
    },
    {
      q: 'Can I export transaction data for bookkeeping or tax returns?',
      a: 'Yes. Every completed sale, refunded receipt, and stock restock event is recorded in an immutable ledger. You can export complete transaction logs to a standard CSV file anytime.',
    },
    {
      q: 'Is Agora free to use during the early access beta?',
      a: 'Yes. During our open beta phase, Agora is completely free for shop owners with no payment card required to create your store register.',
    },
  ];

  return (
    <div className="min-h-screen bg-agora-bg text-agora-ink selection:bg-agora-terracotta selection:text-agora-card flex flex-col font-sans">
      {/* 1. Header (Dark Hero Navigation) */}
      <header className="sticky top-0 z-40 bg-agora-ink border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between text-agora-card">
        <AgoraLogo size="md" />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-agora-card/70">
          <a href="#problem" className="hover:text-agora-card transition-colors">
            Why Agora
          </a>
          <a href="#sandbox" className="hover:text-agora-card transition-colors">
            Feature Preview
          </a>
          <a href="#faq" className="hover:text-agora-card transition-colors">
            Questions
          </a>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('LOGIN')}
            className="px-3.5 py-2 text-xs font-semibold text-agora-card/80 hover:text-agora-card transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('SIGNUP')}
            className="px-4 py-2 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card text-xs font-serif font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <span>Open Store Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Bold Dark Hero Section (Distinctive visual opening) */}
      <section className="bg-agora-ink text-agora-card pt-12 pb-20 px-4 sm:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Column: Honest Headline & Problem Statement */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-medium text-agora-card/80">
              <BookOpen className="w-3.5 h-3.5 text-agora-terracotta" />
              <span>Digital Trade Ledger for Retail Shops</span>
            </div>

            {/* Direct, Honest Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-agora-card leading-[1.12]">
              Stop sales and stock from drifting apart in a paper notebook.
            </h1>

            {/* Grounded Subtitle */}
            <p className="text-sm sm:text-base text-agora-card/75 leading-relaxed font-normal max-w-xl">
              Most shop owners record sales in a paper log while inventory sits on shelves. When busy shifts hit, paper numbers drift out of sync with real stock. Agora links your counter register directly to inventory counts, stock alerts, and net revenue reports.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="px-6 py-3.5 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card text-sm font-serif font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <span>Create Free Store Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#sandbox"
                className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl text-sm font-semibold text-agora-card transition-all flex items-center gap-2"
              >
                <span>Explore Register Preview</span>
                <ArrowUpRight className="w-4 h-4 text-agora-card/60" />
              </a>
            </div>

            {/* Grounded Feature Checklist */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10 text-xs font-medium text-agora-card/70">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-agora-sage shrink-0" />
                <span>Offline local storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-agora-sage shrink-0" />
                <span>Gold stock warning limit</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-agora-sage shrink-0" />
                <span>CSV receipt export</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Real Interactive POS Register Preview */}
          <div className="lg:col-span-6">
            <div className="bg-agora-card text-agora-ink border border-agora-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-agora-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-agora-terracotta/40" />
                  <div className="w-3 h-3 rounded-full bg-agora-gold/40" />
                  <div className="w-3 h-3 rounded-full bg-agora-sage/40" />
                  <span className="text-xs font-bold text-agora-ink-muted ml-2">Counter Register Terminal</span>
                </div>
                <span className="text-[11px] font-semibold text-agora-sage bg-agora-sage-light px-2.5 py-0.5 rounded-full border border-agora-sage-border">
                  Active Shift
                </span>
              </div>

              {/* Terminal Body */}
              {checkoutReceipt ? (
                <div className="py-8 text-center space-y-3 bg-agora-bg p-6 rounded-2xl border border-agora-border">
                  <div className="w-12 h-12 bg-agora-sage-light text-agora-sage rounded-2xl flex items-center justify-center mx-auto border border-agora-sage-border">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-agora-ink">Sale Recorded</h3>
                  <p className="text-xs text-agora-ink-muted">
                    Receipt #{checkoutReceipt.id} logged ({checkoutReceipt.itemsCount} items) • {checkoutReceipt.payment}
                  </p>
                  <div className="text-xl font-serif font-bold text-agora-ink">
                    {checkoutReceipt.total.toLocaleString()} ETB
                  </div>
                  <button
                    onClick={handleResetDemoCart}
                    className="mt-2 px-4 py-2 bg-agora-terracotta text-agora-card text-xs font-serif font-bold rounded-xl hover:bg-agora-terracotta-hover transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Sale</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tap Catalog */}
                  <div>
                    <span className="text-xs font-semibold text-agora-ink-muted block mb-2">
                      Tap product to add to cart:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleProducts.map((p) => {
                        const inCart = cartItems.find((c) => c.id === p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (inCart) {
                                updateQuantity(p.id, 1);
                              } else {
                                setCartItems((prev) => [
                                  ...prev,
                                  { id: p.id, name: p.name, price: p.price, qty: 1, isFav: p.isFav },
                                ]);
                              }
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                              inCart
                                ? 'bg-agora-terracotta/5 border-agora-terracotta/40 shadow-sm'
                                : 'bg-agora-bg hover:bg-agora-card border-agora-border'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-agora-ink line-clamp-1">{p.name}</span>
                              {p.isFav && <Star className="w-3 h-3 text-agora-gold fill-agora-gold shrink-0" />}
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-agora-border/50 text-[11px]">
                              <span className="font-serif font-bold text-agora-ink">{p.price} ETB</span>
                              {p.stock <= 5 ? (
                                <span className="text-[10px] font-bold text-agora-gold bg-agora-gold-light px-1.5 rounded border border-agora-gold-border">
                                  {p.stock} left
                                </span>
                              ) : (
                                <span className="text-[10px] text-agora-ink-muted">{p.stock} in stock</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cart Itemization */}
                  <div className="bg-agora-bg p-3 rounded-2xl border border-agora-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-agora-ink border-b border-agora-border/60 pb-1.5">
                      <span>Cart Summary</span>
                      <span className="text-agora-brass">{cartItems.length} items</span>
                    </div>

                    {cartItems.length === 0 ? (
                      <p className="text-xs text-agora-ink-muted py-4 text-center">Cart is empty. Tap products above.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1">
                            <span className="font-medium text-agora-ink truncate max-w-[150px]">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-agora-card border border-agora-border rounded-lg px-1 py-0.5">
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

                    {/* Payment Tender Selection */}
                    <div className="pt-2 border-t border-agora-border/80 space-y-2">
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'CASH', label: 'Cash' },
                          { id: 'MOBILE_MONEY', label: 'Mobile Money' },
                          { id: 'CARD', label: 'Card' },
                          { id: 'SPLIT', label: 'Split' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedPayment(m.id as any)}
                            className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              selectedPayment === m.id
                                ? 'bg-agora-terracotta text-agora-card border-agora-terracotta'
                                : 'bg-agora-card text-agora-ink-muted border-agora-border hover:border-agora-brass'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleSimulateCheckout}
                        disabled={cartItems.length === 0}
                        className="w-full py-2.5 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card font-serif font-bold rounded-xl shadow active:scale-[0.99] transition-all flex items-center justify-between px-4 text-xs disabled:opacity-40"
                      >
                        <span>Record {selectedPayment.replace('_', ' ')} Sale</span>
                        <span className="text-sm">{total.toLocaleString()} ETB</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Problem Section (Paper Log vs Agora Digital Ledger) */}
      <section id="problem" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-agora-ink">
            Why traditional notebook tracking causes sync drift
          </h2>
          <p className="text-sm text-agora-ink-muted leading-relaxed">
            When you write transactions by hand in a notebook or keep cash in a drawer without linking it to inventory counts, three common problems occur every week:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-agora-card border border-agora-border rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-agora-gold-light text-agora-gold rounded-xl flex items-center justify-center border border-agora-gold-border font-bold">
              1
            </div>
            <h3 className="font-serif font-bold text-base text-agora-ink">Untracked Stockouts</h3>
            <p className="text-xs text-agora-ink-muted leading-relaxed">
              Items sell out during busy hours, but because stock is checked manually at end of day, customers are turned away before anyone notices the empty shelf.
            </p>
          </div>

          <div className="bg-agora-card border border-agora-border rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-agora-brick-light text-agora-brick rounded-xl flex items-center justify-center border border-agora-brick-border font-bold">
              2
            </div>
            <h3 className="font-serif font-bold text-base text-agora-ink">Register Discrepancies</h3>
            <p className="text-xs text-agora-ink-muted leading-relaxed">
              Cash receipts and mobile transfer text messages get mixed together. Without itemized records, shift reconciliation takes over an hour at closing.
            </p>
          </div>

          <div className="bg-agora-card border border-agora-border rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-agora-sage-light text-agora-sage rounded-xl flex items-center justify-center border border-agora-sage-border font-bold">
              3
            </div>
            <h3 className="font-serif font-bold text-base text-agora-ink">Zero Net Revenue Insights</h3>
            <p className="text-xs text-agora-ink-muted leading-relaxed">
              A paper notebook shows total cash collected, but hides which products generated the profit, which items expired, or whether weekly revenue is trending up or down.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Rebuilt Feature Tour Sandbox (1:1 mapped to genuine Agora features) */}
      <section id="sandbox" className="py-16 px-4 sm:px-8 bg-agora-card border-y border-agora-border">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-agora-ink">
              Built around actual shop operations
            </h2>
            <p className="text-sm text-agora-ink-muted">
              Explore how Agora handles point of sale, stock warnings, refunds, and daily reports.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              { id: 'register', label: 'Counter Register', icon: ShoppingBag },
              { id: 'stock', label: 'Stock Health & Alerts', icon: Package },
              { id: 'history', label: 'Sales History & Refunds', icon: Receipt },
              { id: 'reports', label: 'Net Revenue Reports', icon: TrendingUp },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeFeatureTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveFeatureTab(t.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-agora-terracotta text-agora-card border-agora-terracotta font-serif'
                      : 'bg-agora-bg text-agora-ink-muted border-agora-border hover:text-agora-ink hover:border-agora-brass'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feature Showcase Box */}
          <div className="bg-agora-bg border border-agora-border rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto">
            {activeFeatureTab === 'register' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Tap-to-Sell Product Grid & Star Favorites
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    Pin your highest-velocity items to the top of your screen with a single star toggle. Search products by title or filter by category. Apply custom percentage discounts during checkout.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Star-to-pin product shortcuts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Split tender recording across cash & mobile money</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Instant inventory quantity deduction on completion</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold border-b pb-2 border-agora-border">
                    <span>★ Favorites Row</span>
                    <span className="text-agora-brass text-[11px]">Quick Access</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-agora-bg border border-agora-border rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold block text-agora-ink">Espresso Roast</span>
                        <span className="text-[11px] font-serif font-bold text-agora-ink mt-0.5 block">450 ETB</span>
                      </div>
                      <Star className="w-4 h-4 text-agora-gold fill-agora-gold" />
                    </div>
                    <div className="p-3 bg-agora-bg border border-agora-border rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold block text-agora-ink">Highland Honey</span>
                        <span className="text-[11px] font-serif font-bold text-agora-ink mt-0.5 block">680 ETB</span>
                      </div>
                      <Star className="w-4 h-4 text-agora-gold fill-agora-gold" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'stock' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Color-Coded Gold Stock Warnings
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    Agora reserves warm gold (<code className="text-agora-gold font-bold">#C99A2E</code>) strictly for items that reach your defined minimum threshold or expiry warning date, keeping your eyes focused on stock health.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Custom alert thresholds per item</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Quick stock replenishment drawer modal</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Expiry date tracking for perishable goods</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-3">
                  <div className="p-3 bg-agora-gold-light border border-agora-gold-border rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-agora-gold" />
                      <span className="font-bold text-agora-ink">Organic Honey (500ml)</span>
                    </div>
                    <span className="font-bold text-agora-gold">4 left (Low Stock)</span>
                  </div>
                  <div className="p-3 bg-agora-gold-light border border-agora-gold-border rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-agora-gold" />
                      <span className="font-bold text-agora-ink">Black Tea Blend</span>
                    </div>
                    <span className="font-bold text-agora-gold">2 left (Low Stock)</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'history' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Sales History, Voids & Audit Logging
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    Review completed checkouts chronologically. Process refunds or void mistaken register taps with automatic inventory restocking and activity logs.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Detailed itemized receipt inspection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Refund & void flow with automatic stock restoration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Audit log of register events</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-2.5 text-xs">
                  <div className="flex justify-between items-center font-bold border-b pb-2 border-agora-border">
                    <span>Receipt #AG-7719</span>
                    <span className="text-agora-sage bg-agora-sage-light px-2 py-0.5 rounded border border-agora-sage-border">
                      COMPLETED
                    </span>
                  </div>
                  <div className="space-y-1 text-agora-ink-muted">
                    <div className="flex justify-between">
                      <span>Coffee Beans x1</span>
                      <span className="font-serif font-bold text-agora-ink">450 ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ceramic Cup x2</span>
                      <span className="font-serif font-bold text-agora-ink">640 ETB</span>
                    </div>
                  </div>
                  <div className="border-t border-agora-border pt-2 flex justify-between font-bold text-agora-ink">
                    <span>Total Paid (Cash)</span>
                    <span className="font-serif">1,090 ETB</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'reports' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-agora-ink">
                    Net Revenue Trends & Shift Reconciliation
                  </h3>
                  <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
                    View daily net revenue metrics. Revenue trendlines dynamically use Sage Green (<code className="text-agora-sage font-bold">#3B7A57</code>) for net increases and Brick Red (<code className="text-agora-brick font-bold">#C85A32</code>) for dips.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-agora-ink">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Interactive revenue trend chart scrubbing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>Units sold & transaction count breakdown</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-agora-sage" />
                      <span>One-click CSV download for accounting</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-agora-card p-5 rounded-2xl border border-agora-border space-y-3">
                  <span className="text-xs font-bold text-agora-ink-muted uppercase">Shift Summary</span>
                  <div className="text-2xl font-serif font-bold text-agora-ink">14,280 ETB</div>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-agora-sage bg-agora-sage-light px-2.5 py-0.5 rounded-full border border-agora-sage-border">
                    ↑ Revenue Increase
                  </div>
                  <div className="h-16 w-full bg-agora-bg border border-agora-border rounded-xl p-2 flex items-end gap-1.5">
                    {[35, 50, 40, 65, 80, 90, 85].map((h, i) => (
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
          </div>
        </div>
      </section>

      {/* 5. Clean FAQ Accordion (Honest Q&A, no un-backed claims) */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-agora-ink">Frequently Asked Questions</h2>
          <p className="text-xs text-agora-ink-muted">Plain answers about how Agora operates in your store.</p>
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
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-agora-ink hover:bg-agora-bg/60 transition-colors"
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

      {/* 6. Honest Final Call to Action Section (Neutral warm cream background, terracotta CTA button) */}
      <section className="py-16 px-4 sm:px-8 bg-agora-bg border-t border-agora-border text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-agora-ink">
            Join the early access beta
          </h2>
          <p className="text-xs sm:text-sm text-agora-ink-muted leading-relaxed">
            Agora is currently in open beta for shop owners. Set up your store register, add your products, and test offline-first sales tracking today.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('SIGNUP')}
              className="px-6 py-3 bg-agora-terracotta hover:bg-agora-terracotta-hover text-agora-card text-sm font-serif font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <span>Open Free Store Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-agora-card border-t border-agora-border px-4 sm:px-8 py-6 text-xs text-agora-ink-muted flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AgoraLogo size="sm" />
          <span>© {new Date().getFullYear()} Agora Digital Trade Ledger</span>
        </div>

        <div className="text-[11px] text-agora-ink-muted">
          <span>Early Access Beta</span>
        </div>
      </footer>
    </div>
  );
}
