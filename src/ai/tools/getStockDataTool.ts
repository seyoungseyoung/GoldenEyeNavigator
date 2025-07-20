'use server';

import { getHistoricalData as fetchHistoricalData } from '@/services/stockService';

type GetStockDataInput = {
    ticker: string;
};

/**
 * Fetches historical stock data. This is a simple server action now,
 * not a Genkit tool, as Genkit is no longer the primary AI orchestrator.
 * @param input The input object containing the ticker.
 * @returns An array of historical data points.
 */
export async function getStockData(input: GetStockDataInput): Promise<Array<{ date: string; close: number }>> {
  return fetchHistoricalData(input.ticker);
}
