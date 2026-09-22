import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Product, StoreSettings } from '@/types';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/currency';
import { isToday } from '@/utils/formatters';
import { 
  BarChart3, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Award,
  Layers
} from 'lucide-react';

export default function AnalyticsView() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Corner Kiosk',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
  });
  const [timePeriod, setTimePeriod] = useState<'TODAY' | 'ALL'>('TODAY');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, prods, stgs] = await Promise.all([
        api.getSales(),
        api.getProducts(),
        api.getSettings(),
      ]);
      setSales(salesData);
      setProducts(prods);
      setSettings(stgs);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const relevantSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status !== 'COMPLETED') return false;
      if (timePeriod === 'TODAY' && !isToday(s.timestamp)) return false;
      return true;
    });
  }, [sales, timePeriod]);

  const totalRevenueCents = useMemo(() => {
    return relevantSales.reduce((sum, s) => sum + s.total_amount, 0);
  }, [relevantSales]);

  const totalSalesCount = relevantSales.length;

  const totalUnitsSold = useMemo(() => {
    return relevantSales.reduce((sum, s) => sum + s.items_count, 0);
  }, [relevantSales]);

  const activeLowStockCount = useMemo(() => {
    return products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length;
  }, [products]);

  const topProductsMap = useMemo(() => {
    const map: Record<string, { name: string; units: number; revenue: number }> = {};

    relevantSales.forEach((sale) => {
      sale.items?.forEach((item) => {
        if (!map[item.product_id]) {
          map[item.product_id] = {
            name: item.product_name,
            units: 0,
            revenue: 0,
          };
        }
        map[item.product_id].units += item.quantity;
        map[item.product_id].revenue += item.line_total;
      });
    });

    return Object.values(map).sort((a, b) => b.units - a.units).slice(0, 5);
  }, [relevantSales]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    relevantSales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        const cat = prod?.category || 'General';
        map[cat] = (map[cat] || 0) + item.line_total;
      });
    });

    return Object.entries(map).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenueCents > 0 ? Math.round((revenue / totalRevenueCents) * 100) : 0,
    }));
  }, [relevantSales, products, totalRevenueCents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Daily Summary & Store Performance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics for revenue, sales count, top items sold, and stock health
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl w-max">
          <button
            onClick={() => setTimePeriod('TODAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timePeriod === 'TODAY'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Summary
          </button>
          <button
            onClick={() => setTimePeriod('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timePeriod === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {formatCurrency(totalRevenueCents, settings.currency_symbol)}
          </div>
          <span className="text-[10px] text-slate-500">Gross sales cleared</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed Sales</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 mt-2">{totalSalesCount}</div>
          <span className="text-[10px] text-slate-500">Customer checkout receipts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Physical Units Sold</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 mt-2">{totalUnitsSold}</div>
          <span className="text-[10px] text-slate-500">Items deducted from stock</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{activeLowStockCount}</div>
          <span className="text-[10px] text-amber-500">Need restocking</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">Top-Selling Products</h3>
            </div>
            <span className="text-xs text-slate-400">By units sold</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-slate-500 text-center py-4">Loading stats...</p>
            ) : topProductsMap.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No sales recorded for this period yet.
              </div>
            ) : (
              topProductsMap.map((tp, idx) => (
                <div
                  key={tp.name}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-200 text-xs truncate">
                      {tp.name}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-400 text-xs block">
                      {formatCurrency(tp.revenue, settings.currency_symbol)}
                    </span>
                    <span className="text-[10px] text-slate-400">{tp.units} units sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">Sales by Category</h3>
            </div>
            <span className="text-xs text-slate-400">Revenue share</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-slate-500 text-center py-4">Loading stats...</p>
            ) : categoryDistribution.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No category sales recorded yet.
              </div>
            ) : (
              categoryDistribution.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{cat.category}</span>
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(cat.revenue, settings.currency_symbol)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
