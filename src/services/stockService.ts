
import { subDays, format, subYears } from 'date-fns';
import yahooFinance from 'yahoo-finance2';

// HistoricalDataPoint now includes more fields for accurate indicator calculation.
export type HistoricalDataPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/**
 * Fetches real historical stock data from Yahoo Finance for the last year,
 * and returns approximately the last 252 trading days.
 * @param ticker The stock ticker symbol.
 * @returns An array of historical data points.
 */
export async function getHistoricalData(ticker: string): Promise<HistoricalDataPoint[]> {
  const today = new Date();
  const oneYearAgo = subYears(today, 1);

  try {
    const results = await yahooFinance.historical(ticker, {
      period1: format(oneYearAgo, 'yyyy-MM-dd'),
      period2: format(today, 'yyyy-MM-dd'),
      interval: '1d',
    });

    // Filter out any entries with missing data and map to the required format
    const formattedData = results
      .filter(item => item.date && item.open && item.high && item.low && item.close && item.volume)
      .map(item => ({
        date: format(new Date(item.date), 'yyyy-MM-dd'),
        open: parseFloat(item.open!.toFixed(2)),
        high: parseFloat(item.high!.toFixed(2)),
        low: parseFloat(item.low!.toFixed(2)),
        close: parseFloat(item.close!.toFixed(2)),
        volume: item.volume!,
      }));

    // Return the most recent 252 data points
    return formattedData.slice(-252);
  } catch (error) {
    console.error(`Failed to fetch historical data for ${ticker}:`, error);
    // For this app, we'll return an empty array to prevent a hard crash on the UI
    return [];
  }
}
