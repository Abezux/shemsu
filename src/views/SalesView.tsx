import React, { useState, useEffect, useMemo } from 'react';
import { Sale, StoreSettings } from '@/types';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/currency';
import { formatDate, isToday } from '@/utils/formatters';
import SaleDetailModal from '@/components/sales/SaleDetailModal';
import VoidSaleModal from '@/components/sales/VoidSaleModal';
import { History, Receipt, CheckCircle, Ban, Search, DollarSign } from 'lucide-react';

export default function SalesView() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Corner Kiosk',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
    business_type: 'GENERAL_RETAIL',
    expiry_alert_days: 30,
    custom_attributes: [],
  });
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'ALL'>('TODAY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [saleToVoid, setSaleToVoid] = useState<Sale | null>(null);
  const [isVoidOpen, setIsVoidOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, stgs] = await Promise.all([api.getSales(), api.getSettings()]);
      setSales(salesData);
      setSettings(stgs);
    } catch (err) {
      console.error('Error loading sales history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 6 * 86400000;

    return sales.filter((s) => {
      const time = new Date(s.timestamp).getTime();

      if (dateFilter === 'TODAY' && !isToday(s.timestamp)) return false;
      if (dateFilter === 'YESTERDAY' && (time < yesterdayStart || time >= todayStart)) return false;
      if (dateFilter === 'THIS_WEEK' && time < weekStart) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesReceipt = s.sale_number.toLowerCase().includes(query);
        const matchesMethod = (s.payment_method || '').toLowerCase().includes(query);
        const matchesItems = s.items?.some((i) => i.product_name.toLowerCase().includes(query));
        if (!matchesReceipt && !matchesMethod && !matchesItems) return false;
      }

      return true;
    });
  }, [sales, dateFilter, searchQuery]);

  const totalCompletedRevenueCents = useMemo(() => {
    return filteredSales
      .filter((s) => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + s.total_amount, 0);
  }, [filteredSales]);

  const completedSalesCount = useMemo(() => {
    return filteredSales.filter((s) => s.status === 'COMPLETED').length;
  }, [filteredSales]);

  const voidedSalesCount = useMemo(() => {
    return filteredSales.filter((s) => s.status === 'VOIDED').length;
  }, [filteredSales]);

  const handleOpenDetail = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  const handleRequestVoidFromDetail = (sale: Sale) => {
    setIsDetailOpen(false);
    setSaleToVoid(sale);
    setIsVoidOpen(true);
  };

  const handleConfirmVoid = async (saleId: string, reason: string) => {
    await api.voidSale(saleId, reason);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-emerald-400" />
            Sales History & Receipt Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review completed transactions, inspect items sold, and easily void sales to restore inventory stock
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Period Revenue ({dateFilter})</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {formatCurrency(totalCompletedRevenueCents, settings.currency_symbol)}
          </div>
          <span className="text-[10px] text-slate-500">Total cleared sales value</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed Transactions</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 mt-2">{completedSalesCount}</div>
          <span className="text-[10px] text-slate-500">Successful checkouts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Voided Sales</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-2">{voidedSalesCount}</div>
          <span className="text-[10px] text-slate-500">Stock restored for voided items</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by receipt #, payment method, or item name..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: 'THIS_WEEK', label: 'This Week' },
              { id: 'ALL', label: 'All History' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  dateFilter === f.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Receipt #</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Items Sold</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No sales recorded for this date filter.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isVoided = sale.status === 'VOIDED';

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-800/40 transition-all ${
                        isVoided ? 'bg-rose-950/10 opacity-70' : ''
                      }`}
                    >
                      <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-400" />
                        {sale.sale_number}
                      </td>

                      <td className="p-4 text-slate-300">
                        {formatDate(sale.timestamp)}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-[11px]">
                          {sale.payment_method || 'CASH'}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-slate-300">
                        {sale.items_count} item(s)
                      </td>

                      <td className="p-4 font-black text-emerald-400 text-sm">
                        {formatCurrency(sale.total_amount, settings.currency_symbol)}
                      </td>

                      <td className="p-4">
                        {isVoided ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold inline-flex items-center gap-1">
                            <Ban className="w-3 h-3 text-rose-400" /> Voided
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Completed
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenDetail(sale)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition-all text-xs"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaleDetailModal
        isOpen={isDetailOpen}
        sale={selectedSale}
        currencySymbol={settings.currency_symbol}
        onClose={() => setIsDetailOpen(false)}
        onRequestVoid={handleRequestVoidFromDetail}
      />

      <VoidSaleModal
        isOpen={isVoidOpen}
        sale={saleToVoid}
        currencySymbol={settings.currency_symbol}
        onClose={() => setIsVoidOpen(false)}
        onConfirmVoid={handleConfirmVoid}
      />
    </div>
  );
}
