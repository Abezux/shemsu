import React, { useState } from 'react';
import { Sale, StoreSettings } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatters';
import { X, Maximize2, Calendar, Receipt, DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

interface DrilldownModalProps {
  isOpen: boolean;
  title: string;
  metricType: 'REVENUE' | 'SALES' | 'UNITS' | 'STOCK_HEALTH' | 'HOURLY';
  sales: Sale[];
  currencySymbol: string;
  onClose: () => void;
}

export default function DrilldownModal({
  isOpen,
  title,
  metricType,
  sales,
  currencySymbol,
  onClose,
}: DrilldownModalProps) {
  const [filterRange, setFilterRange] = useState<'TODAY' | '7D' | '30D' | 'ALL'>('TODAY');

  if (!isOpen) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const d7Start = todayStart - 6 * 86400000;
  const d30Start = todayStart - 29 * 86400000;

  const filteredSales = sales.filter((s) => {
    if (s.status !== 'COMPLETED') return false;
    const time = new Date(s.timestamp).getTime();
    if (filterRange === 'TODAY' && time < todayStart) return false;
    if (filterRange === '7D' && time < d7Start) return false;
    if (filterRange === '30D' && time < d30Start) return false;
    return true;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalUnits = filteredSales.reduce((sum, s) => sum + s.items_count, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-lg leading-tight">{title}</h3>
              <span className="text-xs text-slate-400">Detailed metric drill-down inspection</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              {[
                { id: 'TODAY', label: 'Today' },
                { id: '7D', label: '7 Days' },
                { id: '30D', label: '30 Days' },
                { id: 'ALL', label: 'All' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setFilterRange(r.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterRange === r.id
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Summary Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Period Revenue</span>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {formatCurrency(totalRevenue, currencySymbol)}
              </div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Sales Count</span>
              <div className="text-xl font-black text-slate-100 mt-1">{filteredSales.length} checkouts</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Units Sold</span>
              <div className="text-xl font-black text-slate-100 mt-1">{totalUnits} items</div>
            </div>
          </div>

          {/* Detailed Itemization Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 flex justify-between">
              <span>Receipt # & Date</span>
              <span>Items Sold Breakdown</span>
              <span>Total Amount</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {filteredSales.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No transaction records found for this drilldown range.
                </div>
              ) : (
                filteredSales.map((s) => (
                  <div key={s.id} className="p-4 flex justify-between items-center text-xs hover:bg-slate-900/40">
                    <div>
                      <span className="font-bold text-slate-100 block text-sm flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" /> {s.sale_number}
                      </span>
                      <span className="text-slate-400">{formatDate(s.timestamp)}</span>
                    </div>

                    <div className="text-slate-300 max-w-xs text-center">
                      <span className="font-semibold">{s.items_count} item(s): </span>
                      <span className="text-slate-400 text-[11px]">
                        {s.items?.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-emerald-400 text-sm block">
                        {formatCurrency(s.total_amount, currencySymbol)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {s.payment_method || 'CASH'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
