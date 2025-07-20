
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
    
    // If formattedData is empty after a successful API call, it might be a delisted or invalid ticker.
    if(formattedData.length === 0){
        throw new Error(`'${ticker}'에 대한 주가 데이터를 찾을 수 없습니다. 티커를 확인해주세요.`);
    }

    // Return the most recent 252 data points
    return formattedData.slice(-252);
  } catch (error: any) {
    console.error(`Failed to fetch historical data for ${ticker}:`, error);
    
    // Check if the error is a 404 Not Found, which usually indicates an invalid ticker
    if (error.code === '404 Not Found' || (error.message && error.message.includes('404'))) {
      throw new Error(`'${ticker}'는 존재하지 않는 티커입니다. 다시 확인해주세요.`);
    }
    
    throw new Error(`'${ticker}'의 주가 데이터 조회 중 오류가 발생했습니다: ${error.message}`);
  }
}

