import * as productsService from './products';
import * as salesService from './sales';
import * as movementsService from './movements';
import * as settingsService from './settings';
import * as registerService from './register';
import * as analyticsService from './analytics';

export const api = {
  // Product management
  getProducts: productsService.getProducts,
  saveProduct: productsService.saveProduct,
  toggleFavoriteProduct: productsService.toggleFavoriteProduct,
  deleteProduct: productsService.deleteProduct,
  restockProduct: productsService.restockProduct,
  seedDemo: productsService.seedDemo,

  // Sales management
  getSales: salesService.getSales,
  createSale: salesService.createSale,
  processRefund: salesService.processRefund,
  voidSale: salesService.voidSale,

  // Stock movements
  getStockMovements: movementsService.getStockMovements,

  // Store settings
  getSettings: settingsService.getSettings,
  updateSettings: settingsService.updateSettings,

  // Register closure & cash reconciliation
  getRegisterClosures: registerService.getRegisterClosures,
  getExpectedCash: registerService.getExpectedCash,
  closeRegister: registerService.closeRegister,

  // Analytics & reporting helpers
  getMetricTrends: analyticsService.getMetricTrends,
  getRevenueTrendData: analyticsService.getRevenueTrendData,
  getHourlySalesData: analyticsService.getHourlySalesData,
  getStockHealthData: analyticsService.getStockHealthData,
  getSmartRestockSuggestions: analyticsService.getSmartRestockSuggestions,
  getTopFavorites: analyticsService.getTopFavorites,
};

export * from './products';
export * from './sales';
export * from './movements';
export * from './settings';
export * from './register';
export * from './analytics';
