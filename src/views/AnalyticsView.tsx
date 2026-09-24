import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Product, StoreSettings } from '@/types';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/currency';
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
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import ProductAvatar from '@/components/common/ProductAvatar';

const CATEGORY_COLORS = ['#C1502E', '#8B7355', '#5C7A52', '#9B4038', '#A0958C', '#D9CFBF'];

export default function AnalyticsView() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Agora Kiosk',
    currency_symbol: '$',
    currency_code: 'USD',
    low_stock_alerts_enabled: true,
    business_type: 'GENERAL_RETAIL',
    expiry_alert_days: 30,
    custom_attributes: [],
  });
  
  const [trendDays, setTrendDays] = useState<number>(7);
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
      console.error('Error loading reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metricTrends = useMemo(() => {
    return api.getMetricTrends(sales, trendDays === 7 ? 1 : trendDays === 30 ? 7 : 30);
  }, [sales, trendDays]);

  const revenueTrendData = useMemo(() => {
    return api.getRevenueTrendData(sales, trendDays);
  }, [sales, trendDays]);

  const hourlySalesData = useMemo(() => {
    return api.getHourlySalesData(sales, trendDays);
  }, [sales, trendDays]);

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
      value: value / 100,
      valueCents: value,
    }));
  }, [sales, products]);

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
    <div className="space-y-4 sm:space-y-6 text-agora-ink">
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-agora-ink tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-agora-terracotta" />
            Reports & Insights
          </h1>
          <p className="text-xs text-agora-ink-muted mt-0.5 font-medium">
            Sales trends, peak hours, category breakdown, and stock alerts
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-agora-card border border-agora-border p-1 rounded-xl w-max">
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
                  ? 'bg-agora-terracotta text-agora-card shadow-sm'
                  : 'text-agora-ink-muted hover:text-agora-ink'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Revenue KPI */}
        <div
          onClick={() => handleOpenDrilldown('Revenue Growth', 'REVENUE')}
          className="ledger-card p-3.5 sm:p-4 cursor-pointer hover:border-agora-terracotta transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between text-agora-ink-muted text-xs font-bold">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-agora-terracotta group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-agora-terracotta mt-1.5">
            {formatCurrency(metricTrends.revenueTrend.currentValue, settings.currency_symbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                metricTrends.revenueTrend.isIncrease
                  ? 'bg-agora-sage-light text-agora-sage border border-agora-sage-border'
                  : 'bg-agora-brick-light text-agora-brick border border-agora-brick-border'
              }`}
            >
              {metricTrends.revenueTrend.isIncrease ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {metricTrends.revenueTrend.percentageChange}%
            </span>
            <span className="text-[10px] text-agora-ink-muted font-medium">vs prev</span>
          </div>
        </div>

        {/* Completed Sales KPI */}
        <div
          onClick={() => handleOpenDrilldown('Transactions', 'SALES')}
          className="ledger-card p-3.5 sm:p-4 cursor-pointer hover:border-agora-terracotta transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between text-agora-ink-muted text-xs font-bold">
            <span>Sales Count</span>
            <ShoppingBag className="w-4 h-4 text-agora-terracotta group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-agora-ink mt-1.5">
            {metricTrends.salesCountTrend.currentValue} sales
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                metricTrends.salesCountTrend.isIncrease
                  ? 'bg-agora-sage-light text-agora-sage border border-agora-sage-border'
                  : 'bg-agora-brick-light text-agora-brick border border-agora-brick-border'
              }`}
            >
              {metricTrends.salesCountTrend.isIncrease ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {metricTrends.salesCountTrend.percentageChange}%
            </span>
            <span className="text-[10px] text-agora-ink-muted font-medium">vs prev</span>
          </div>
        </div>

        {/* Units Sold KPI */}
        <div
          onClick={() => handleOpenDrilldown('Units Sold', 'UNITS')}
          className="ledger-card p-3.5 sm:p-4 cursor-pointer hover:border-agora-terracotta transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between text-agora-ink-muted text-xs font-bold">
            <span>Units Sold</span>
            <Package className="w-4 h-4 text-agora-terracotta group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-agora-ink mt-1.5">
            {metricTrends.unitsSoldTrend.currentValue} items
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                metricTrends.unitsSoldTrend.isIncrease
                  ? 'bg-agora-sage-light text-agora-sage border border-agora-sage-border'
                  : 'bg-agora-brick-light text-agora-brick border border-agora-brick-border'
              }`}
            >
              {metricTrends.unitsSoldTrend.isIncrease ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {metricTrends.unitsSoldTrend.percentageChange}%
            </span>
            <span className="text-[10px] text-agora-ink-muted font-medium">vs prev</span>
          </div>
        </div>

        {/* Inventory Alerts KPI */}
        <div
          onClick={() => handleOpenDrilldown('Stock Alerts', 'STOCK_HEALTH')}
          className="ledger-card p-3.5 sm:p-4 cursor-pointer border-agora-terracotta/40 hover:border-agora-terracotta bg-agora-terracotta-light/30 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between text-agora-terracotta text-xs font-bold">
            <span>Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-agora-terracotta group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-agora-terracotta mt-1.5">
            {stockHealthItems.length} alerts
          </div>
          <span className="text-[10px] text-agora-terracotta mt-1.5 block font-bold">
            Tap to view health bars
          </span>
        </div>
      </div>

      {/* Revenue Line Chart */}
      <div className="ledger-card p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-agora-terracotta" />
            <h3 className="font-serif font-bold text-agora-ink text-sm sm:text-base">Revenue Comparison</h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1 text-agora-ink font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-agora-terracotta inline-block" /> Current
            </span>
            <span className="flex items-center gap-1 text-agora-ink-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-agora-brass inline-block" /> Previous
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrendData}>
              <XAxis dataKey="dateLabel" stroke="#6E655F" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6E655F"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${settings.currency_symbol}${v / 100}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#E5DCC8', borderRadius: '12px', color: '#211D1A' }}
                formatter={(value: any) => [
                  formatCurrency(Number(value), settings.currency_symbol),
                  'Revenue',
                ]}
              />
              <Line
                type="monotone"
                dataKey="previousPeriodRevenue"
                name="Previous Period"
                stroke="#8B7355"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="currentPeriodRevenue"
                name="Current Period"
                stroke="#C1502E"
                strokeWidth={3}
                dot={{ fill: '#C1502E', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Peak Hours Chart */}
        <div className="ledger-card p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-agora-border">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-agora-terracotta" />
              <h3 className="font-serif font-bold text-agora-ink text-sm sm:text-base">Peak Sales Hours</h3>
            </div>
            <span className="text-[11px] text-agora-ink-muted">({trendDays}d)</span>
          </div>

          <div className="h-56 sm:h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySalesData}>
                <XAxis dataKey="hour" stroke="#6E655F" fontSize={10} tickLine={false} />
                <YAxis stroke="#6E655F" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#E5DCC8', borderRadius: '12px', color: '#211D1A' }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatCurrency(Number(value), settings.currency_symbol) : value,
                    name === 'revenue' ? 'Revenue' : 'Sales',
                  ]}
                />
                <Bar dataKey="salesCount" fill="#C1502E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="ledger-card p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-agora-border">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-agora-terracotta" />
              <h3 className="font-serif font-bold text-agora-ink text-sm sm:text-base">Category Breakdown</h3>
            </div>
            <span className="text-[11px] text-agora-ink-muted">Revenue %</span>
          </div>

          <div className="h-56 sm:h-60 w-full flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <p className="text-xs text-agora-ink-muted">No sales recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#E5DCC8', borderRadius: '12px', color: '#211D1A' }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Visual Stock Health List */}
      <div className="ledger-card p-4 sm:p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-agora-border">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-agora-terracotta" />
            <h3 className="font-serif font-bold text-agora-ink text-sm sm:text-base">Stock Alerts & Health</h3>
          </div>
          <span className="text-xs text-agora-ink-muted">Reorder list</span>
        </div>

        {stockHealthItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-agora-ink-muted">
            All products have healthy stock levels!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {stockHealthItems.map((item) => {
              const p = item.product;
              const percent = Math.min(100, Math.round((p.stock_quantity / p.low_stock_threshold) * 100));

              return (
                <div
                  key={p.id}
                  className="bg-agora-bg p-3 rounded-2xl border border-agora-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProductAvatar name={p.name} imageUrl={p.image_url} size="md" />
                    <div>
                      <h4 className="font-bold text-agora-ink text-xs sm:text-sm leading-snug">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-agora-ink-muted">
                        <span>Stock: <strong className="font-serif text-agora-ink">{p.stock_quantity} {p.unit_type || 'pcs'}</strong></span>
                        <span>•</span>
                        <span>Alert: <strong>{p.low_stock_threshold}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-56 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      {item.isExpiringSoon ? (
                        <span className="text-agora-brick flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Expiring in {item.daysUntilExpiry} days
                        </span>
                      ) : (
                        <span className="text-agora-terracotta flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low Stock ({percent}%)
                        </span>
                      )}
                      <span className="text-agora-ink">{p.stock_quantity} / {p.low_stock_threshold}</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-agora-card overflow-hidden border border-agora-border">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.isExpiringSoon
                            ? 'bg-agora-brick'
                            : p.stock_quantity <= 0
                            ? 'bg-agora-brick'
                            : 'bg-agora-terracotta'
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
