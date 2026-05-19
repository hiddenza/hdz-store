/**
 * CJdropshipping API Service
 * 
 * To use the real API:
 * 1. Get your API Key from CJdropshipping Dashboard
 * 2. Set CJ_API_KEY in your .env file
 */

const CJ_API_BASE_URL = 'https://api.cjdropshipping.com/api2.0';

export class CJDropshippingService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CJ_API_KEY || '';
  }

  async getProducts(params: { page?: number; size?: number; categoryId?: string } = {}) {
    if (!this.apiKey) {
      console.warn('CJ_API_KEY not found. Using mock product data.');
      return null;
    }

    try {
      const response = await fetch(`${CJ_API_BASE_URL}/product/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': this.apiKey,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error('CJ API request failed');
      return await response.json();
    } catch (error) {
      console.error('Error fetching CJ products:', error);
      return null;
    }
  }

  async createOrder(orderData: any) {
    if (!this.apiKey) {
      console.warn('CJ_API_KEY not found. Order creation skipped.');
      return { success: true, message: 'Mock order created (No API key)' };
    }

    try {
      const response = await fetch(`${CJ_API_BASE_URL}/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': this.apiKey,
        },
        body: JSON.stringify(orderData),
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating CJ order:', error);
      throw error;
    }
  }
}

export const cjService = new CJDropshippingService();

export const getCJProducts = async (params?: any) => {
  return await cjService.getProducts(params);
};
