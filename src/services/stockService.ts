import { subDays, format, subYears } from 'date-fns';
import yahooFinance from 'yahoo-finance2';

type HistoricalDataPoint = {
  date: string;
  close: number;
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

    // Filter out any entries without a close price and map to the required format
    const formattedData = results
      .filter(item => item.close)
      .map(item => ({
        date: format(new Date(item.date), 'yyyy-MM-dd'),
        close: parseFloat(item.close.toFixed(2)),
      }));

    // Return the most recent 252 data points
    return formattedData.slice(-252);
  } catch (error) {
    console.error(`Failed to fetch historical data for ${ticker}:`, error);
    // As a fallback, return an empty array or throw the error
    // For this app, we'll return an empty array to prevent a hard crash on the UI
    return [];
  }
}
