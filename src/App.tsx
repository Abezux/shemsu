import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthView from '@/views/AuthView';
import OnboardingView from '@/views/OnboardingView';
import Navbar from '@/components/navigation/Navbar';
import SellPage from '@/views/SellView';
import InventoryPage from '@/views/InventoryView';
import SalesHistoryPage from '@/views/SalesView';
import AuditPage from '@/views/AuditView';
import AnalyticsPage from '@/views/AnalyticsView';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, store, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('sell');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['sell', 'inventory', 'sales', 'audit', 'analytics'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading Shemsu POS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  if (!store) {
    return <OnboardingView />;
  }

  return (
    <div className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col pb-16 md:pb-0">
      <Navbar activeTab={activeTab} onNavigate={navigateTo} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {activeTab === 'sell' && <SellPage />}
        {activeTab === 'inventory' && <InventoryPage />}
        {activeTab === 'sales' && <SalesHistoryPage />}
        {activeTab === 'audit' && <AuditPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

