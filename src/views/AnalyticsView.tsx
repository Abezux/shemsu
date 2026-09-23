import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Product, StoreSettings } from '@/types';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/currency';
import { isToday } from '@/utils/formatters';
import DrilldownModal from '@/components/analytics/DrilldownModal';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  BarChart3, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Clock,
  Maximize2
} from 'lucide-react';

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export default function AnalyticsView() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Corner Kiosk',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
    business_type: 'GENERAL_RETAIL',
    expiry_alert_days: 30,
    custom_attributes: [],
  });
  
  const [trendDays, setTrendDays] = useState<number>(7); // 7d, 30d, 90d
  const [isLoading, setIsLoading] = useState(true);

  // Drilldown Modal State
  const [drilldownState, setDrilldownState] = useState<{
    isOpen: boolean;
    title: string;
    metricType: 'REVENUE' | 'SALES' | 'UNITS' | 'STOCK_HEALTH' | 'HOURLY';
  }>({
    isOpen: false,
    title: '',
    metricType: 'REVENUE',
  });

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

  // 1. Period-over-Period KPI Metric Trends
  const metricTrends = useMemo(() => {
    return api.getMetricTrends(sales, trendDays === 7 ? 1 : trendDays === 30 ? 7 : 30);
  }, [sales, trendDays]);

  // 2. Revenue Line Chart Data (Current Period vs Overlaid Faint Previous Period Line)
  const revenueTrendData = useMemo(() => {
    return api.getRevenueTrendData(sales, trendDays);
  }, [sales, trendDays]);

  // 3. Hourly Sales Volume Data (Peak Hours for Staffing / Restocking)
  const hourlySalesData = useMemo(() => {
    return api.getHourlySalesData(sales, trendDays);
  }, [sales, trendDays]);

  // 4. Category Revenue Distribution
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      if (s.status !== 'COMPLETED') return;
      s.items?.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        const cat = prod?.category || 'General';
        map[cat] = (map[cat] || 0) + item.line_total;
      });
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value: value / 100, // in dollars for chart display
      valueCents: value,
    }));
  }, [sales, products]);

  // 5. Visual Stock & Expiry Health Data
  const stockHealthItems = useMemo(() => {
    return api.getStockHealthData(products, settings.expiry_alert_days || 30);
  }, [products, settings]);

  const handleOpenDrilldown = (title: string, metricType: any) => {
    setDrilldownState({
      isOpen: true,
      title,
      metricType,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Executive Insights & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Period-over-period growth trends, peak sales heatmaps, category share, and stock health visualization
          </p>
        </div>

        {/* Range Selector Controls */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl w-max">
          {[
            { days: 7, label: '7 Days' },
            { days: 30, label: '30 Days' },
            { days: 90, label: '90 Days' },
          ].map((r) => (
            <button
              key={r.days}
              onClick={() => setTrendDays(r.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                trendDays === r.days
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. KPI Cards with Period-over-Period % Change Trend Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Revenue KPI */}
        <div
          onClick={() => handleOpenDrilldown('Revenue Growth & Receipt Drill-down', 'REVENUE')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition-all group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Period Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {formatCurrency(metricTrends.revenueTrend.currentValue, settings.currency_symbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                metricTrends.revenueTrend.isIncrease
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {metricTrends.revenueTrend.isIncrease ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {metricTrends.revenueTrend.percentageChange}%
            </span>
            <span className="text-[10px] text-slate-500">vs prev period</span>
          </div>
        </div>

        {/* Completed Sales Count KPI */}
        <div
          onClick={() => handleOpenDrilldown('Transactions Breakdown', 'SALES')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition-all group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed Sales</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-100 mt-2">
            {metricTrends.salesCountTrend.currentValue} checkouts
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                metricTrends.salesCountTrend.isIncrease
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {metricTrends.salesCountTrend.isIncrease ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {metricTrends.salesCountTrend.percentageChange}%
            </span>
            <span className="text-[10px] text-slate-500">vs prev period</span>
          </div>
        </div>

        {/* Physical Units Sold KPI */}
        <div
          onClick={() => handleOpenDrilldown('Units Sold Itemization', 'UNITS')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 cursor-pointer transition-all group shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Units Sold</span>
            <Package className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-100 mt-2">
            {metricTrends.unitsSoldTrend.currentValue} items
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                metricTrends.unitsSoldTrend.isIncrease
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {metricTrends.unitsSoldTrend.isIncrease ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {metricTrends.unitsSoldTrend.percentageChange}%
            </span>
            <span className="text-[10px] text-slate-500">vs prev period</span>
          </div>
        </div>

        {/* Active Stock & Expiry Alerts KPI */}
        <div
          onClick={() => handleOpenDrilldown('Stock & Expiry Alerts Detail', 'STOCK_HEALTH')}
          className="bg-slate-900 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-4 cursor-pointer transition-all group shadow-md"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>Active Inventory Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">
            {stockHealthItems.length} alerts
          </div>
          <span className="text-[10px] text-amber-500 mt-2 block font-medium">
            Tap to view scannable health bars
          </span>
        </div>
      </div>

      {/* 2. Primary Revenue Line Chart with Faint Comparison Line */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">Revenue Growth Comparison</h3>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Current Period
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-slate-600 border border-slate-500 inline-block" /> Previous Equivalent Period
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrendData}>
              <XAxis dataKey="dateLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${settings.currency_symbol}${v / 100}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(value: any) => [
                  formatCurrency(Number(value), settings.currency_symbol),
                  'Revenue',
                ]}
              />
              {/* Previous Period Faint Dashed Line */}
              <Line
                type="monotone"
                dataKey="previousPeriodRevenue"
                name="Previous Period"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              {/* Current Period Solid Emerald Line */}
              <Line
                type="monotone"
                dataKey="currentPeriodRevenue"
                name="Current Period"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Secondary Visualizations Grid (Peak Hours Bar Chart & Category Share Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hourly Peak Sales Volume Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">Peak Sales Hours Heatmap</h3>
            </div>
            <span className="text-[11px] text-slate-400">Aggregated ({trendDays}d)</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySalesData}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatCurrency(Number(value), settings.currency_symbol) : value,
                    name === 'revenue' ? 'Revenue' : 'Sales Count',
                  ]}
                />
                <Bar dataKey="salesCount" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">Category Revenue Share</h3>
            </div>
            <span className="text-[11px] text-slate-400">Revenue %</span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <p className="text-xs text-slate-500">No category sales recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. Visual Stock & Expiry Health Bar List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">Visual Stock & Expiry Health List</h3>
          </div>
          <span className="text-xs text-slate-400">Reorder & expiry decision list</span>
        </div>

        {stockHealthItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            ✅ All products have healthy stock levels and no upcoming expiries!
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {stockHealthItems.map((item) => {
              const p = item.product;
              const percent = Math.min(100, Math.round((p.stock_quantity / p.low_stock_threshold) * 100));

              return (
                <div
                  key={p.id}
                  className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{p.image_url || '📦'}</span>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm leading-snug">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>Stock: <strong className="text-white">{p.stock_quantity} {p.unit_type || 'pcs'}</strong></span>
                        <span>•</span>
                        <span>Alert Threshold: <strong>{p.low_stock_threshold}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-60 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      {item.isExpiringSoon ? (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Expiring in {item.daysUntilExpiry} days
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low Stock ({percent}%)
                        </span>
                      )}
                      <span className="text-slate-300">{p.stock_quantity} / {p.low_stock_threshold}</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.isExpiringSoon
                            ? 'bg-rose-500'
                            : p.stock_quantity <= 0
                            ? 'bg-rose-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(5, percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drilldown Modal */}
      <DrilldownModal
        isOpen={drilldownState.isOpen}
        title={drilldownState.title}
        metricType={drilldownState.metricType}
        sales={sales}
        currencySymbol={settings.currency_symbol}
        onClose={() => setDrilldownState({ ...drilldownState, isOpen: false })}
      />
    </div>
  );
}
