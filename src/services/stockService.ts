
'use server';

import { subYears, format } from 'date-fns';
import axios from 'axios';

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
  
  const period1 = Math.floor(oneYearAgo.getTime() / 1000);
  const period2 = Math.floor(today.getTime() / 1000);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;

  try {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    
    const chartData = response.data.chart;

    if (!chartData || chartData.error) {
      throw new Error(chartData.error?.description || `'${ticker}'에 대한 데이터를 찾을 수 없습니다.`);
    }

    const { timestamp, indicators } = chartData.result[0];
    const { open, high, low, close, volume } = indicators.quote[0];

    if (!timestamp || !open || !high || !low || !close || !volume) {
        throw new Error(`'${ticker}'에 대한 주가 데이터를 찾을 수 없습니다. 티커를 확인해주세요.`);
    }
    
    const formattedData: HistoricalDataPoint[] = timestamp.map((ts: number, i: number) => ({
      date: format(new Date(ts * 1000), 'yyyy-MM-dd'),
      open: parseFloat(open[i]?.toFixed(2)),
      high: parseFloat(high[i]?.toFixed(2)),
      low: parseFloat(low[i]?.toFixed(2)),
      close: parseFloat(close[i]?.toFixed(2)),
      volume: volume[i],
    })).filter((item: any) => item.open && item.high && item.low && item.close && item.volume);
    
    if (formattedData.length === 0) {
      throw new Error(`'${ticker}'에 대한 주가 데이터를 찾을 수 없습니다. 티커를 확인해주세요.`);
    }
    
    return formattedData.slice(-252);

  } catch (error: any) {
    console.error(`Failed to fetch historical data for ${ticker}:`, error);
    
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`'${ticker}'는 존재하지 않는 티커입니다. 다시 확인해주세요.`);
    }
    
    throw new Error(`'${ticker}'의 주가 데이터 조회 중 오류가 발생했습니다: ${error.message}`);
  }
}
