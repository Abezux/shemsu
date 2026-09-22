import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  History, 
  FileText, 
  BarChart3, 
  Store, 
  Sparkles,
  Wifi
} from 'lucide-react';
import { api } from '@/services/api';
import { StoreSettings } from '@/types';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export default function Navbar({ activeTab, onNavigate }: NavbarProps) {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Shemsu Kiosk POS',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
  });
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  const handleSeed = async () => {
    if (confirm('Load pre-populated demo kiosk catalog (drinks, snacks, groceries)? This will refresh catalog.')) {
      setIsSeeding(true);
      try {
        await api.seedDemo();
        window.location.reload();
      } catch (err) {
        alert('Error seeding catalog: ' + err);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const navLinks = [
    { id: 'sell', label: 'Sell Register', icon: ShoppingCart },
    { id: 'inventory', label: 'Products & Stock', icon: Package },
    { id: 'sales', label: 'Sales History', icon: History },
    { id: 'audit', label: 'Stock Audit', icon: FileText },
    { id: 'analytics', label: 'Daily Summary', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Bar (Desktop & Mobile Header) */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 border border-emerald-500/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-tight flex items-center gap-2">
                {settings.store_name}
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20">
                  MVP POS
                </span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Ready</span>
                </span>
                <span>•</span>
                <span>Currency: <strong className="text-white">{settings.currency_symbol} ({settings.currency_code})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
              title="Load demo kiosk products"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Load Kiosk Demo Catalog'}</span>
              <span className="sm:hidden">Demo Catalog</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 flex gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl">
        <div className="grid grid-cols-5 gap-1 p-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/15 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 active:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight truncate w-full">{link.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
