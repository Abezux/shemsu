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
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_number TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subtotal_amount INT,                      -- Gross line-item total in cents
  discount_amount INT NOT NULL DEFAULT 0,   -- Total discount in cents
  discount_reason TEXT,
  total_amount INT NOT NULL,                -- Net charged total in cents (subtotal - discount)
  items_count NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  payment_method TEXT DEFAULT 'CASH',       -- 'CASH', 'MOBILE_MONEY', 'CARD', 'OTHER', or 'SPLIT'
  notes TEXT,
  void_reason TEXT,
  voided_at TIMESTAMPTZ
);

-- 6. SALE PAYMENTS TABLE (Split Payment Allocation)
CREATE TABLE IF NOT EXISTS sale_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  amount INT NOT NULL,                     -- Payment allocation in integer cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  refunded_quantity NUMERIC NOT NULL DEFAULT 0,
  unit_price INT NOT NULL,
  line_total INT NOT NULL,
  unit_type TEXT DEFAULT 'piece'
);

-- 8. REFUNDS TABLE (Partial Line-Item Refunds Audit)
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  sale_item_id UUID NOT NULL REFERENCES sale_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  amount INT NOT NULL,                      -- Refunded amount in cents
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. REGISTER CLOSURES TABLE (End-of-Day Cash Reconciliation)
CREATE TABLE IF NOT EXISTS register_closures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_cash INT NOT NULL,               -- Sum of cash sales minus cash refunds in cents
  counted_cash INT NOT NULL,                -- Physically counted cash in cents
  variance INT NOT NULL,                    -- counted_cash - expected_cash in cents
  notes TEXT,
  closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. STOCK MOVEMENTS AUDIT TRAIL TABLE
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
-- 11. ROW LEVEL SECURITY (RLS) POLICIES & SECURITY DEFINER
-- =============================================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE register_closures ENABLE ROW LEVEL SECURITY;
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

DROP POLICY IF EXISTS sale_payments_store_policy ON sale_payments;
CREATE POLICY sale_payments_store_policy ON sale_payments
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS sale_items_store_policy ON sale_items;
CREATE POLICY sale_items_store_policy ON sale_items
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS refunds_store_policy ON refunds;
CREATE POLICY refunds_store_policy ON refunds
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS register_closures_store_policy ON register_closures;
CREATE POLICY register_closures_store_policy ON register_closures
  FOR ALL USING (is_store_owner(store_id));

DROP POLICY IF EXISTS stock_movements_store_policy ON stock_movements;
CREATE POLICY stock_movements_store_policy ON stock_movements
  FOR ALL USING (is_store_owner(store_id));

-- =============================================================
-- 12. ATOMIC TRANSACTION PL/PGSQL PROCEDURES
-- =============================================================

-- Atomic Create Sale Transaction (Supports Discounts & Split Payments)
CREATE OR REPLACE FUNCTION public.create_sale_transaction(
  p_store_id UUID,
  p_items JSONB,
  p_payments JSONB DEFAULT NULL,
  p_discount_amount INT DEFAULT 0,
  p_discount_reason TEXT DEFAULT NULL,
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
  v_subtotal INT := 0;
  v_total_amount INT := 0;
  v_items_count NUMERIC := 0;
  v_item RECORD;
  v_product RECORD;
  v_payment RECORD;
  v_line_total INT;
  v_now TIMESTAMPTZ := NOW();
  v_payments_sum INT := 0;
  v_primary_method TEXT := 'CASH';
  v_payment_count INT := 0;
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
    v_subtotal := v_subtotal + v_line_total;
    v_items_count := v_items_count + v_item.quantity;

    -- Deduct product stock
    UPDATE public.products
    SET stock_quantity = stock_quantity - v_item.quantity,
        updated_at = v_now
    WHERE id = v_product.id;

    -- Insert sale item
    INSERT INTO public.sale_items (
      id, store_id, sale_id, product_id, product_name, quantity, refunded_quantity, unit_price, line_total, unit_type
    ) VALUES (
      gen_random_uuid(), p_store_id, v_sale_id, v_product.id, v_product.name,
      v_item.quantity, 0, v_product.price, v_line_total, COALESCE(v_product.unit_type, 'piece')
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

  -- 4. Calculate Discount & Final Total
  IF p_discount_amount > v_subtotal THEN
    RAISE EXCEPTION 'Discount amount (%) cannot exceed subtotal (%)', p_discount_amount, v_subtotal;
  END IF;

  v_total_amount := v_subtotal - COALESCE(p_discount_amount, 0);

  -- 5. Process Payment Allocations
  IF p_payments IS NOT NULL AND jsonb_array_length(p_payments) > 0 THEN
    FOR v_payment IN SELECT * FROM jsonb_to_recordset(p_payments) AS x(method TEXT, amount INT)
    LOOP
      v_payments_sum := v_payments_sum + v_payment.amount;
      v_payment_count := v_payment_count + 1;
      v_primary_method := v_payment.method;

      INSERT INTO public.sale_payments (id, store_id, sale_id, method, amount, created_at)
      VALUES (gen_random_uuid(), p_store_id, v_sale_id, v_payment.method, v_payment.amount, v_now);
    END LOOP;

    IF v_payments_sum <> v_total_amount THEN
      RAISE EXCEPTION 'Payment allocation total (%) does not match final total due (%)', v_payments_sum, v_total_amount;
    END IF;

    IF v_payment_count > 1 THEN
      v_primary_method := 'SPLIT';
    END IF;
  ELSE
    -- Default single cash payment if no payments array provided
    INSERT INTO public.sale_payments (id, store_id, sale_id, method, amount, created_at)
    VALUES (gen_random_uuid(), p_store_id, v_sale_id, 'CASH', v_total_amount, v_now);
    v_primary_method := 'CASH';
  END IF;

  -- 6. Insert Master Sale Record
  INSERT INTO public.sales (
    id, store_id, sale_number, timestamp, subtotal_amount, discount_amount, discount_reason, total_amount, items_count, status, payment_method, notes
  ) VALUES (
    v_sale_id, p_store_id, v_sale_number, v_now, v_subtotal, COALESCE(p_discount_amount, 0), p_discount_reason, v_total_amount, v_items_count, 'COMPLETED', v_primary_method, p_notes
  );

  -- 7. Construct & Return full sale JSON
  SELECT jsonb_build_object(
    'id', s.id,
    'sale_number', s.sale_number,
    'timestamp', s.timestamp,
    'subtotal_amount', s.subtotal_amount,
    'discount_amount', s.discount_amount,
    'discount_reason', s.discount_reason,
    'total_amount', s.total_amount,
    'items_count', s.items_count,
    'status', s.status,
    'payment_method', s.payment_method,
    'notes', s.notes,
    'payments', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', sp.id,
        'method', sp.method,
        'amount', sp.amount
      )), '[]'::jsonb)
      FROM public.sale_payments sp
      WHERE sp.sale_id = s.id
    ),
    'items', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', si.id,
        'sale_id', si.sale_id,
        'product_id', si.product_id,
        'product_name', si.product_name,
        'quantity', si.quantity,
        'refunded_quantity', si.refunded_quantity,
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

-- Atomic Partial Refund Transaction
CREATE OR REPLACE FUNCTION public.process_refund_transaction(
  p_store_id UUID,
  p_sale_id UUID,
  p_refund_items JSONB,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_sale RECORD;
  v_ref_item RECORD;
  v_sale_item RECORD;
  v_product RECORD;
  v_refund_amount INT;
  v_total_qty NUMERIC := 0;
  v_total_refunded_qty NUMERIC := 0;
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
    RAISE EXCEPTION 'Cannot refund a voided sale %', p_sale_id;
  END IF;

  -- 3. Loop through items to refund
  FOR v_ref_item IN SELECT * FROM jsonb_to_recordset(p_refund_items) AS x(sale_item_id UUID, quantity NUMERIC)
  LOOP
    IF v_ref_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid refund quantity %', v_ref_item.quantity;
    END IF;

    -- Lock sale item row FOR UPDATE
    SELECT * INTO v_sale_item
    FROM public.sale_items
    WHERE id = v_ref_item.sale_item_id AND sale_id = p_sale_id AND store_id = p_store_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Sale item % not found', v_ref_item.sale_item_id;
    END IF;

    -- Validate remaining unrefunded quantity
    IF v_ref_item.quantity > (v_sale_item.quantity - v_sale_item.refunded_quantity) THEN
      RAISE EXCEPTION 'Requested refund quantity (%) exceeds available unrefunded quantity (%) for item %',
        v_ref_item.quantity, (v_sale_item.quantity - v_sale_item.refunded_quantity), v_sale_item.product_name;
    END IF;

    v_refund_amount := ROUND(v_sale_item.unit_price * v_ref_item.quantity);

    -- Increment refunded quantity
    UPDATE public.sale_items
    SET refunded_quantity = refunded_quantity + v_ref_item.quantity
    WHERE id = v_sale_item.id;

    -- Restore product stock if product exists
    IF v_sale_item.product_id IS NOT NULL THEN
      SELECT * INTO v_product
      FROM public.products
      WHERE id = v_sale_item.product_id AND store_id = p_store_id
      FOR UPDATE;

      IF FOUND THEN
        UPDATE public.products
        SET stock_quantity = stock_quantity + v_ref_item.quantity,
            updated_at = v_now
        WHERE id = v_product.id;

        INSERT INTO public.stock_movements (
          id, store_id, product_id, product_name, change_amount, quantity_after, reason, reference_id, note, timestamp
        ) VALUES (
          gen_random_uuid(), p_store_id, v_product.id, v_product.name,
          v_ref_item.quantity, v_product.stock_quantity + v_ref_item.quantity,
          'REFUND', p_sale_id, 'Refunded item (' || v_ref_item.quantity || ' units): ' || COALESCE(p_reason, 'No reason specified'), v_now
        );
      END IF;
    END IF;

    -- Insert Refund Audit Record
    INSERT INTO public.refunds (
      id, store_id, sale_id, sale_item_id, quantity, amount, reason, timestamp
    ) VALUES (
      gen_random_uuid(), p_store_id, p_sale_id, v_sale_item.id, v_ref_item.quantity, v_refund_amount, p_reason, v_now
    );
  END LOOP;

  -- 4. Evaluate overall refund status for sale
  SELECT 
    COALESCE(SUM(quantity), 0),
    COALESCE(SUM(refunded_quantity), 0)
  INTO v_total_qty, v_total_refunded_qty
  FROM public.sale_items
  WHERE sale_id = p_sale_id;

  IF v_total_refunded_qty >= v_total_qty THEN
    UPDATE public.sales SET status = 'REFUNDED' WHERE id = p_sale_id;
  ELSIF v_total_refunded_qty > 0 THEN
    UPDATE public.sales SET status = 'PARTIALLY_REFUNDED' WHERE id = p_sale_id;
  END IF;

  -- 4. Return updated sale JSON
  SELECT jsonb_build_object(
    'id', s.id,
    'sale_number', s.sale_number,
    'timestamp', s.timestamp,
    'subtotal_amount', s.subtotal_amount,
    'discount_amount', s.discount_amount,
    'discount_reason', s.discount_reason,
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
        'refunded_quantity', si.refunded_quantity,
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

  -- 4. Restore remaining product stock for each line item (accounting for already refunded units)
  FOR v_item IN SELECT * FROM public.sale_items WHERE sale_id = p_sale_id LOOP
    IF (v_item.quantity - v_item.refunded_quantity) > 0 THEN
      SELECT * INTO v_product
      FROM public.products
      WHERE id = v_item.product_id AND store_id = p_store_id
      FOR UPDATE;

      IF FOUND THEN
        UPDATE public.products
        SET stock_quantity = stock_quantity + (v_item.quantity - v_item.refunded_quantity),
            updated_at = v_now
        WHERE id = v_product.id;

        INSERT INTO public.stock_movements (
          id, store_id, product_id, product_name, change_amount, quantity_after, reason, reference_id, note, timestamp
        ) VALUES (
          gen_random_uuid(), p_store_id, v_product.id, v_product.name,
          (v_item.quantity - v_item.refunded_quantity), v_product.stock_quantity + (v_item.quantity - v_item.refunded_quantity),
          'VOID_SALE', p_sale_id, 'Voided sale ' || v_sale.sale_number || ': ' || p_void_reason, v_now
        );
      END IF;
    END IF;
  END LOOP;

  -- 5. Construct & Return updated sale JSON
  SELECT jsonb_build_object(
    'id', s.id,
    'sale_number', s.sale_number,
    'timestamp', s.timestamp,
    'subtotal_amount', s.subtotal_amount,
    'discount_amount', s.discount_amount,
    'discount_reason', s.discount_reason,
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
        'refunded_quantity', si.refunded_quantity,
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

-- Atomic Register Closure Transaction (Computes expected cash & variance server-side)
CREATE OR REPLACE FUNCTION public.close_register_transaction(
  p_store_id UUID,
  p_period_start TIMESTAMPTZ,
  p_counted_cash INT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_total_cash_sales INT := 0;
  v_total_cash_refunds INT := 0;
  v_expected_cash INT := 0;
  v_variance INT := 0;
  v_now TIMESTAMPTZ := NOW();
  v_closure_id UUID := gen_random_uuid();
  v_result JSONB;
BEGIN
  -- 1. Security Check
  v_user_id := auth.uid();
  IF v_user_id IS NULL OR NOT public.is_store_owner(p_store_id) THEN
    RAISE EXCEPTION 'Unauthorized: You do not own store %', p_store_id;
  END IF;

  -- 2. Compute total cash sales collected since p_period_start
  SELECT COALESCE(SUM(sp.amount), 0)
  INTO v_total_cash_sales
  FROM public.sale_payments sp
  JOIN public.sales s ON s.id = sp.sale_id
  WHERE sp.store_id = p_store_id
    AND sp.method = 'CASH'
    AND s.status != 'VOIDED'
    AND sp.created_at >= p_period_start;

  -- 3. Compute total cash refunds paid out since p_period_start
  SELECT COALESCE(SUM(r.amount), 0)
  INTO v_total_cash_refunds
  FROM public.refunds r
  JOIN public.sale_payments sp ON sp.sale_id = r.sale_id
  WHERE r.store_id = p_store_id
    AND sp.method = 'CASH'
    AND r.timestamp >= p_period_start;

  -- 4. Calculate expected cash and variance
  v_expected_cash := GREATEST(0, v_total_cash_sales - v_total_cash_refunds);
  v_variance := p_counted_cash - v_expected_cash;

  -- 5. Insert closure record
  INSERT INTO public.register_closures (
    id, store_id, period_start, period_end, expected_cash, counted_cash, variance, notes, closed_at
  ) VALUES (
    v_closure_id, p_store_id, p_period_start, v_now, v_expected_cash, p_counted_cash, v_variance, p_notes, v_now
  );

  -- 6. Construct & Return closure JSON
  SELECT jsonb_build_object(
    'id', rc.id,
    'store_id', rc.store_id,
    'period_start', rc.period_start,
    'period_end', rc.period_end,
    'expected_cash', rc.expected_cash,
    'counted_cash', rc.counted_cash,
    'variance', rc.variance,
    'notes', rc.notes,
    'closed_at', rc.closed_at
  ) INTO v_result
  FROM public.register_closures rc
  WHERE rc.id = v_closure_id;

  RETURN v_result;
END;
$$;


