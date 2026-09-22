export type ProductCategory = 
  | 'Beverages' 
  | 'Snacks' 
  | 'Groceries' 
  | 'Toiletries' 
  | 'Pharmacy' 
  | 'Stationery' 
  | 'General';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory | string;
  price: number; // integer in cents (e.g., 1500 = $15.00 or 1500 KSh)
  cost_price?: number; // integer in cents
  stock_quantity: number;
  low_stock_threshold: number;
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
  quantity: number;
  unit_price: number; // cents snapshot
  line_total: number; // cents snapshot
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
}

export interface DailyAnalytics {
  date: string;
  total_revenue: number;
  total_sales_count: number;
  total_items_sold: number;
  low_stock_items_count: number;
  top_products: {
    product_id: string;
    product_name: string;
    units_sold: number;
    total_revenue: number;
  }[];
}
