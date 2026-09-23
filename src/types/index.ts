export type ProductCategory = 
  | 'Beverages' 
  | 'Snacks' 
  | 'Groceries' 
  | 'Toiletries' 
  | 'Pharmacy' 
  | 'Stationery' 
  | 'General'
  | string;

export type BusinessType = 
  | 'MINI_SHOP' 
  | 'PHARMACY' 
  | 'RESTAURANT' 
  | 'SALON' 
  | 'GENERAL_RETAIL';

export type UnitType = 'piece' | 'kg' | 'g' | 'L' | 'ml';

export interface AttributeDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // integer in cents (e.g., 1500 = $15.00 or 1500 KSh)
  cost_price?: number; // integer in cents
  stock_quantity: number;
  low_stock_threshold: number;
  unit_type?: UnitType; // default 'piece'
  business_type?: BusinessType;
  attributes?: Record<string, string | number | boolean>; // e.g. { expiry_date: "2026-10-15", batch_no: "B-902", prescription_required: false }
  barcode?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number; // integer or decimal for fractional units (e.g., 0.5 kg)
  unit_price: number; // cents snapshot
  line_total: number; // cents snapshot
  unit_type?: UnitType;
}

export interface Sale {
  id: string;
  sale_number: string;
  timestamp: string;
  total_amount: number; // cents snapshot
  items_count: number;
  status: 'COMPLETED' | 'VOIDED';
  payment_method?: 'CASH' | 'MOBILE_MONEY' | 'CARD' | 'OTHER';
  notes?: string;
  void_reason?: string;
  voided_at?: string;
  items?: SaleItem[];
}

export type MovementReason = 'SALE' | 'RESTOCK' | 'MANUAL_ADJUSTMENT' | 'VOID_SALE';

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  change_amount: number; // + for restock/void, - for sale
  quantity_after: number;
  reason: MovementReason;
  reference_id?: string; // e.g. sale_id
  note?: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  store_name: string;
  currency_symbol: string;
  currency_code: string;
  low_stock_alerts_enabled: boolean;
  business_type: BusinessType;
  expiry_alert_days: number; // default: 30 days
  custom_attributes?: AttributeDefinition[];
}

export interface MetricTrend {
  currentValue: number;
  previousValue: number;
  percentageChange: number; // e.g. +14.2 or -5.0
  isIncrease: boolean;
}

export interface HourlySalesPoint {
  hour: string; // e.g. "8 AM", "9 AM"
  hourNum: number;
  salesCount: number;
  revenue: number; // in cents
}

export interface RevenueTrendPoint {
  dateLabel: string;
  timestamp: string;
  currentPeriodRevenue: number; // in cents
  previousPeriodRevenue: number; // in cents
}

export interface StockHealthItem {
  product: Product;
  currentStock: number;
  threshold: number;
  ratio: number; // 0 to 1
  isLowStock: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry?: number;
}
