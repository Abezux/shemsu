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

-- =============================================================
-- 9. ATOMIC TRANSACTION PL/PGSQL PROCEDURES
-- =============================================================

-- Atomic Create Sale Transaction
CREATE OR REPLACE FUNCTION public.create_sale_transaction(
  p_store_id UUID,
  p_items JSONB,
  p_payment_method TEXT DEFAULT 'CASH',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_sale_id UUID;
  v_sale_number TEXT;
  v_total_amount INT := 0;
  v_items_count NUMERIC := 0;
  v_item RECORD;
  v_product RECORD;
  v_line_total INT;
  v_now TIMESTAMPTZ := NOW();
  v_result JSONB;
BEGIN
  -- 1. Security Check: verify caller owns the store
  v_user_id := auth.uid();
  IF v_user_id IS NULL OR NOT public.is_store_owner(p_store_id) THEN
    RAISE EXCEPTION 'Unauthorized: You do not own store %', p_store_id;
  END IF;

  -- 2. Generate Sale ID & Receipt Number
  v_sale_id := gen_random_uuid();
  v_sale_number := '#INV-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- 3. Loop through items in p_items JSONB array
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity NUMERIC)
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid item quantity % for product %', v_item.quantity, v_item.product_id;
    END IF;

    -- Lock product row for UPDATE
    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_item.product_id AND store_id = p_store_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found in store %', v_item.product_id, p_store_id;
    END IF;

    -- Strict Stock Enforcement: Throws error if stock is insufficient
    IF v_product.stock_quantity < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product "%" (Available: %, Requested: %)',
        v_product.name, v_product.stock_quantity, v_item.quantity;
    END IF;

    v_line_total := ROUND(v_product.price * v_item.quantity);
    v_total_amount := v_total_amount + v_line_total;
    v_items_count := v_items_count + v_item.quantity;

    -- Deduct product stock
    UPDATE public.products
    SET stock_quantity = stock_quantity - v_item.quantity,
        updated_at = v_now
    WHERE id = v_product.id;

    -- Insert sale item
    INSERT INTO public.sale_items (
      id, store_id, sale_id, product_id, product_name, quantity, unit_price, line_total, unit_type
    ) VALUES (
      gen_random_uuid(), p_store_id, v_sale_id, v_product.id, v_product.name,
      v_item.quantity, v_product.price, v_line_total, COALESCE(v_product.unit_type, 'piece')
    );

    -- Insert stock movement record
    INSERT INTO public.stock_movements (
      id, store_id, product_id, product_name, change_amount, quantity_after, reason, reference_id, note, timestamp
    ) VALUES (
      gen_random_uuid(), p_store_id, v_product.id, v_product.name,
      -v_item.quantity, v_product.stock_quantity - v_item.quantity,
      'SALE', v_sale_id, 'Sold via sale ' || v_sale_number, v_now
    );
  END LOOP;

  -- 4. Insert Master Sale Record
  INSERT INTO public.sales (
    id, store_id, sale_number, timestamp, total_amount, items_count, status, payment_method, notes
  ) VALUES (
    v_sale_id, p_store_id, v_sale_number, v_now, v_total_amount, v_items_count, 'COMPLETED', p_payment_method, p_notes
  );

  -- 5. Construct & Return full sale JSON
  SELECT jsonb_build_object(
    'id', s.id,
    'sale_number', s.sale_number,
    'timestamp', s.timestamp,
    'total_amount', s.total_amount,
    'items_count', s.items_count,
    'status', s.status,
    'payment_method', s.payment_method,
    'notes', s.notes,
    'items', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', si.id,
        'sale_id', si.sale_id,
        'product_id', si.product_id,
        'product_name', si.product_name,
        'quantity', si.quantity,
        'unit_price', si.unit_price,
        'line_total', si.line_total,
        'unit_type', si.unit_type
      )), '[]'::jsonb)
      FROM public.sale_items si
      WHERE si.sale_id = s.id
    )
  ) INTO v_result
  FROM public.sales s
  WHERE s.id = v_sale_id;

  RETURN v_result;
END;
$$;

-- Atomic Void Sale Transaction
CREATE OR REPLACE FUNCTION public.void_sale_transaction(
  p_store_id UUID,
  p_sale_id UUID,
  p_void_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_sale RECORD;
  v_item RECORD;
  v_product RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_result JSONB;
BEGIN
  -- 1. Security Check
  v_user_id := auth.uid();
  IF v_user_id IS NULL OR NOT public.is_store_owner(p_store_id) THEN
    RAISE EXCEPTION 'Unauthorized: You do not own store %', p_store_id;
  END IF;

  -- 2. Lock Sale row FOR UPDATE
  SELECT * INTO v_sale
  FROM public.sales
  WHERE id = p_sale_id AND store_id = p_store_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale % not found in store %', p_sale_id, p_store_id;
  END IF;

  IF v_sale.status = 'VOIDED' THEN
    RAISE EXCEPTION 'Sale % is already voided', p_sale_id;
  END IF;

  -- 3. Mark Sale as VOIDED
  UPDATE public.sales
  SET status = 'VOIDED',
      void_reason = p_void_reason,
      voided_at = v_now
  WHERE id = p_sale_id;

  -- 4. Restore product stock and log stock movements for each line item
  FOR v_item IN SELECT * FROM public.sale_items WHERE sale_id = p_sale_id LOOP
    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_item.product_id AND store_id = p_store_id
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.products
      SET stock_quantity = stock_quantity + v_item.quantity,
          updated_at = v_now
      WHERE id = v_product.id;

      INSERT INTO public.stock_movements (
        id, store_id, product_id, product_name, change_amount, quantity_after, reason, reference_id, note, timestamp
      ) VALUES (
        gen_random_uuid(), p_store_id, v_product.id, v_product.name,
        v_item.quantity, v_product.stock_quantity + v_item.quantity,
        'VOID_SALE', p_sale_id, 'Voided sale ' || v_sale.sale_number || ': ' || p_void_reason, v_now
      );
    END IF;
  END LOOP;

  -- 5. Construct & Return updated sale JSON
  SELECT jsonb_build_object(
    'id', s.id,
    'sale_number', s.sale_number,
    'timestamp', s.timestamp,
    'total_amount', s.total_amount,
    'items_count', s.items_count,
    'status', s.status,
    'payment_method', s.payment_method,
    'notes', s.notes,
    'void_reason', s.void_reason,
    'voided_at', s.voided_at,
    'items', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', si.id,
        'sale_id', si.sale_id,
        'product_id', si.product_id,
        'product_name', si.product_name,
        'quantity', si.quantity,
        'unit_price', si.unit_price,
        'line_total', si.line_total,
        'unit_type', si.unit_type
      )), '[]'::jsonb)
      FROM public.sale_items si
      WHERE si.sale_id = s.id
    )
  ) INTO v_result
  FROM public.sales s
  WHERE s.id = p_sale_id;

  RETURN v_result;
END;
$$;

