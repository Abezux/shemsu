-- =============================================================
-- SHEMSU POS - PHASE 3 SUPABASE POSTGRES SCHEMA & RLS POLICIES
-- =============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORES TABLE (1 Store per User Account)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'GENERAL_RETAIL',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  currency_code TEXT NOT NULL DEFAULT 'USD',
  expiry_alert_days INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CUSTOM ATTRIBUTE DEFINITIONS
CREATE TABLE IF NOT EXISTS custom_attribute_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INT NOT NULL,                       -- In integer cents
  cost_price INT,                           -- In integer cents
  stock_quantity NUMERIC NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC NOT NULL DEFAULT 5,
  unit_type TEXT NOT NULL DEFAULT 'piece',
  business_type TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  barcode TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_number TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_amount INT NOT NULL,                -- In integer cents
  items_count NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  payment_method TEXT DEFAULT 'CASH',
  notes TEXT,
  void_reason TEXT,
  voided_at TIMESTAMPTZ
);

-- 6. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price INT NOT NULL,
  line_total INT NOT NULL,
  unit_type TEXT DEFAULT 'piece'
);

-- 7. STOCK MOVEMENTS AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  change_amount NUMERIC NOT NULL,
  quantity_after NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  note TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES & SECURITY DEFINER
-- =============================================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Helper function to verify store ownership for RLS
CREATE OR REPLACE FUNCTION is_store_owner(check_store_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM stores
    WHERE id = check_store_id
    AND owner_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
DROP POLICY IF EXISTS stores_owner_policy ON stores;
CREATE POLICY stores_owner_policy ON stores
  FOR ALL USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS products_store_policy ON products;
CREATE POLICY products_store_policy ON products
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS custom_attr_store_policy ON custom_attribute_definitions;
CREATE POLICY custom_attr_store_policy ON custom_attribute_definitions
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS sales_store_policy ON sales;
CREATE POLICY sales_store_policy ON sales
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS sale_items_store_policy ON sale_items;
CREATE POLICY sale_items_store_policy ON sale_items
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS stock_movements_store_policy ON stock_movements;
CREATE POLICY stock_movements_store_policy ON stock_movements
  FOR ALL USING (is_store_owner(store_id));
