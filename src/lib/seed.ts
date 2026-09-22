import { Product } from '@/types';

export const INITIAL_SAMPLE_PRODUCTS: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Coca Cola 500ml',
    category: 'Beverages',
    price: 150, // $1.50 or KSh 150
    cost_price: 90,
    stock_quantity: 24,
    low_stock_threshold: 10,
    image_url: '🥤',
  },
  {
    name: 'Mineral Water 1L',
    category: 'Beverages',
    price: 100, // $1.00
    cost_price: 50,
    stock_quantity: 4, // Low stock!
    low_stock_threshold: 8,
    image_url: '💧',
  },
  {
    name: 'Orange Juice 350ml',
    category: 'Beverages',
    price: 220, // $2.20
    cost_price: 140,
    stock_quantity: 12,
    low_stock_threshold: 5,
    image_url: '🧃',
  },
  {
    name: 'Potato Chips 150g',
    category: 'Snacks',
    price: 180,
    cost_price: 100,
    stock_quantity: 18,
    low_stock_threshold: 6,
    image_url: '🥔',
  },
  {
    name: 'Chocolate Bar 50g',
    category: 'Snacks',
    price: 120,
    cost_price: 70,
    stock_quantity: 2, // Low stock!
    low_stock_threshold: 5,
    image_url: '🍫',
  },
  {
    name: 'White Bread Loaf 500g',
    category: 'Groceries',
    price: 250,
    cost_price: 180,
    stock_quantity: 15,
    low_stock_threshold: 5,
    image_url: '🍞',
  },
  {
    name: 'Fresh Milk 1L',
    category: 'Groceries',
    price: 200,
    cost_price: 140,
    stock_quantity: 3, // Low stock!
    low_stock_threshold: 6,
    image_url: '🥛',
  },
  {
    name: 'Toilet Soap 100g',
    category: 'Toiletries',
    price: 110,
    cost_price: 60,
    stock_quantity: 30,
    low_stock_threshold: 10,
    image_url: '🧼',
  },
  {
    name: 'Toothpaste 100ml',
    category: 'Toiletries',
    price: 320,
    cost_price: 200,
    stock_quantity: 8,
    low_stock_threshold: 5,
    image_url: '🪥',
  },
  {
    name: 'Paracetamol 500mg (Pack of 10)',
    category: 'Pharmacy',
    price: 150,
    cost_price: 80,
    stock_quantity: 25,
    low_stock_threshold: 10,
    image_url: '💊',
  },
  {
    name: 'Hand Sanitizer 100ml',
    category: 'Pharmacy',
    price: 280,
    cost_price: 150,
    stock_quantity: 1, // Low stock!
    low_stock_threshold: 4,
    image_url: '🧴',
  },
  {
    name: 'Ballpoint Pen (Blue)',
    category: 'Stationery',
    price: 50,
    cost_price: 20,
    stock_quantity: 50,
    low_stock_threshold: 15,
    image_url: '🖊️',
  },
  {
    name: 'A4 Exercise Notebook 100 Pages',
    category: 'Stationery',
    price: 190,
    cost_price: 110,
    stock_quantity: 16,
    low_stock_threshold: 8,
    image_url: '📓',
  }
];
