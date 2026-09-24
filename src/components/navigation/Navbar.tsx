import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  History, 
  FileText, 
  BarChart3, 
  Store, 
  Sparkles,
  Wifi,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { api } from '@/services/api';
import { StoreSettings } from '@/types';
import { useAuth } from '@/context/AuthContext';
import SettingsModal from '@/components/settings/SettingsModal';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const BUSINESS_TYPE_BADGES: Record<string, { label: string; icon: string }> = {
  MINI_SHOP: { label: 'Mini-Shop', icon: '🛒' },
  PHARMACY: { label: 'Pharmacy', icon: '💊' },
  RESTAURANT: { label: 'Restaurant', icon: '🍔' },
  SALON: { label: 'Salon', icon: '✂️' },
  GENERAL_RETAIL: { label: 'Retail POS', icon: '🏬' },
};

export default function Navbar({ activeTab, onNavigate }: NavbarProps) {
  const { user, store, signOut, refreshStore } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: store?.store_name || 'Shemsu Kiosk POS',
    currency_symbol: store?.currency_symbol || '$',
    currency_code: store?.currency_code || 'USD',
    low_stock_alerts_enabled: true,
    business_type: store?.business_type || 'GENERAL_RETAIL',
    expiry_alert_days: store?.expiry_alert_days || 30,
    custom_attributes: [],
  });
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const loadSettings = () => {
    api.getSettings().then(setSettings).catch(() => {});
  };

  useEffect(() => {
    if (store) {
      setSettings({
        store_name: store.store_name,
        currency_symbol: store.currency_symbol,
        currency_code: store.currency_code,
        low_stock_alerts_enabled: true,
        business_type: store.business_type,
        expiry_alert_days: store.expiry_alert_days,
        custom_attributes: store.custom_attributes || [],
      });
    } else {
      loadSettings();
    }
  }, [store]);

  const handleSeed = async () => {
    if (confirm('Load pre-populated demo kiosk catalog (drinks, snacks, groceries, medicines)? This will refresh catalog.')) {
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

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    await api.updateSettings(newSettings);
    await refreshStore();
    loadSettings();
    window.location.reload();
  };

  const badge = BUSINESS_TYPE_BADGES[settings.business_type || 'GENERAL_RETAIL'] || BUSINESS_TYPE_BADGES.GENERAL_RETAIL;

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
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span>{badge.icon}</span> {badge.label}
                </span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>Cloud Active</span>
                </span>
                {user?.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[140px] sm:max-w-none">{user.email}</span>
                    </span>
                  </>
                )}
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
              <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Load Demo Catalog'}</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Store settings & Business Vertical"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
              title="Sign Out of Shemsu"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </>
  );
}
