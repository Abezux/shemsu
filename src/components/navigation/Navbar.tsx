import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  History, 
  FileText, 
  BarChart3, 
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
import AgoraLogo from './AgoraLogo';

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
    store_name: store?.store_name || 'Agora Kiosk POS',
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
      <header className="sticky top-0 z-30 bg-agora-card border-b border-agora-border text-agora-ink shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AgoraLogo size="md" />
            
            <div className="hidden sm:block h-8 w-[1px] bg-agora-border mx-1" />

            <div>
              <h1 className="font-serif font-bold text-base tracking-tight leading-tight flex items-center gap-2 text-agora-ink">
                {settings.store_name}
                <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-agora-brass/10 text-agora-brass border border-agora-brass/30 flex items-center gap-1">
                  <span>{badge.icon}</span> {badge.label}
                </span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-agora-ink-muted mt-0.5">
                <span className="flex items-center gap-1 text-agora-sage font-medium">
                  <Wifi className="w-3 h-3 text-agora-sage" />
                  <span>Cloud Active</span>
                </span>
                {user?.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-agora-ink-muted">
                      <User className="w-3 h-3 text-agora-brass" />
                      <span className="truncate max-w-[140px] sm:max-w-none">{user.email}</span>
                    </span>
                  </>
                )}
                <span>•</span>
                <span>Currency: <strong className="font-serif text-agora-ink">{settings.currency_symbol} ({settings.currency_code})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-agora-terracotta/10 hover:bg-agora-terracotta/20 border border-agora-terracotta/30 text-agora-terracotta text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              title="Load demo kiosk products"
            >
              <Sparkles className="w-3.5 h-3.5 text-agora-terracotta" />
              <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Load Demo Catalog'}</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-agora-brass/10 hover:bg-agora-brass/20 text-agora-brass border border-agora-brass/30 transition-all"
              title="Store settings & Business Vertical"
            >
              <Settings className="w-4 h-4 text-agora-brass" />
            </button>

            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl bg-agora-brick/10 hover:bg-agora-brick/20 text-agora-brick border border-agora-brick/30 transition-all"
              title="Sign Out of Agora"
            >
              <LogOut className="w-4 h-4 text-agora-brick" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block bg-agora-bg/60 border-t border-agora-border">
          <div className="max-w-7xl mx-auto px-4 flex gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                    isActive
                      ? 'border-agora-terracotta text-agora-terracotta bg-agora-terracotta/10'
                      : 'border-transparent text-agora-ink-muted hover:text-agora-ink hover:bg-agora-card/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-agora-terracotta' : 'text-agora-ink-muted'}`} />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-agora-card/95 backdrop-blur-md border-t border-agora-border text-agora-ink shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
                  isActive
                    ? 'text-agora-terracotta bg-agora-terracotta/15 font-bold'
                    : 'text-agora-ink-muted hover:text-agora-ink active:bg-agora-bg'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-agora-terracotta' : 'text-agora-ink-muted'}`} />
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
