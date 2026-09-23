import { Product } from '@/types';

export const INITIAL_SAMPLE_PRODUCTS: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Coca Cola 500ml',
    category: 'Beverages',
    price: 150, // $1.50 or KSh 150
    cost_price: 90,
    stock_quantity: 24,
    low_stock_threshold: 10,
    unit_type: 'piece',
    image_url: '🥤',
  },
  {
    name: 'Mineral Water 1L',
    category: 'Beverages',
    price: 100, // $1.00
    cost_price: 50,
    stock_quantity: 4, // Low stock!
    low_stock_threshold: 8,
    unit_type: 'L',
    image_url: '💧',
  },
  {
    name: 'Orange Juice 350ml',
    category: 'Beverages',
    price: 220, // $2.20
    cost_price: 140,
    stock_quantity: 12,
    low_stock_threshold: 5,
    unit_type: 'piece',
    image_url: '🧃',
  },
  {
    name: 'Potato Chips 150g',
    category: 'Snacks',
    price: 180,
    cost_price: 100,
    stock_quantity: 18,
    low_stock_threshold: 6,
    unit_type: 'piece',
    image_url: '🥔',
  },
  {
    name: 'Chocolate Bar 50g',
    category: 'Snacks',
    price: 120,
    cost_price: 70,
    stock_quantity: 2, // Low stock!
    low_stock_threshold: 5,
    unit_type: 'piece',
    image_url: '🍫',
  },
  {
    name: 'White Bread Loaf 500g',
    category: 'Groceries',
    price: 250,
    cost_price: 180,
    stock_quantity: 15,
    low_stock_threshold: 5,
    unit_type: 'piece',
    image_url: '🍞',
  },
  {
    name: 'Basmati Rice (Per Kg)',
    category: 'Groceries',
    price: 300,
    cost_price: 200,
    stock_quantity: 35,
    low_stock_threshold: 10,
    unit_type: 'kg',
    image_url: '🌾',
  },
  {
    name: 'Toilet Soap 100g',
    category: 'Toiletries',
    price: 110,
    cost_price: 60,
    stock_quantity: 30,
    low_stock_threshold: 10,
    unit_type: 'piece',
    image_url: '🧼',
  },
  {
    name: 'Toothpaste 100ml',
    category: 'Toiletries',
    price: 320,
    cost_price: 200,
    stock_quantity: 8,
    low_stock_threshold: 5,
    unit_type: 'piece',
    image_url: '🪥',
  },
  {
    name: 'Paracetamol 500mg (Pack of 10)',
    category: 'Pharmacy',
    price: 150,
    cost_price: 80,
    stock_quantity: 25,
    low_stock_threshold: 10,
    unit_type: 'piece',
    attributes: {
      expiry_date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0], // Expiring in 18 days!
      batch_no: 'BCH-9021',
      prescription_required: false,
    },
    image_url: '💊',
  },
  {
    name: 'Amoxicillin 250mg Antibiotic',
    category: 'Pharmacy',
    price: 650,
    cost_price: 400,
    stock_quantity: 6, // Low stock & expiring soon!
    low_stock_threshold: 8,
    unit_type: 'piece',
    attributes: {
      expiry_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0], // Expiring in 12 days!
      batch_no: 'AMX-4410',
      prescription_required: true,
    },
    image_url: '💊',
  },
  {
    name: 'Hand Sanitizer 100ml',
    category: 'Pharmacy',
    price: 280,
    cost_price: 150,
    stock_quantity: 1, // Low stock!
    low_stock_threshold: 4,
    unit_type: 'ml',
    image_url: '🧴',
  },
  {
    name: 'Ballpoint Pen (Blue)',
    category: 'Stationery',
    price: 50,
    cost_price: 20,
    stock_quantity: 50,
    low_stock_threshold: 15,
    unit_type: 'piece',
    image_url: '🖊️',
  },
  {
    name: 'A4 Exercise Notebook 100 Pages',
    category: 'Stationery',
    price: 190,
    cost_price: 110,
    stock_quantity: 16,
    low_stock_threshold: 8,
    unit_type: 'piece',
    image_url: '📓',
  }
];
