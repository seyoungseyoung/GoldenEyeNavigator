
import { RSI, MACD, BollingerBands, Stochastic } from 'technicalindicators';
import type { StockSignalOutput } from '@/ai/flows/stock-signal-generator';
import type { HistoricalSignal } from '@/components/timing/StockChartWithSignals';
import type { HistoricalDataPoint } from './stockService';

type RecommendedIndicator = StockSignalOutput['recommendedIndicators'][0];

export const INDICATORS = ["RSI", "MACD", "BollingerBands", "Stochastic"] as const;

/**
 * Calculates buy/sell signals based on a set of technical indicators.
 * @param data Historical stock data.
 * @param indicators The indicators and their parameters chosen by the AI.
 * @returns An array of historical signals.
 */
export function calculateSignals(data: HistoricalDataPoint[], indicators: RecommendedIndicator[]): Omit<HistoricalSignal, 'close'>[] {
    const signals: Omit<HistoricalSignal, 'close'>[] = [];
    const closePrices = data.map(d => d.close);

    indicators.forEach(indicator => {
        switch (indicator.name) {
            case 'RSI':
                signals.push(...calculateRSISignals(data, closePrices, indicator.params));
                break;
            case 'MACD':
                signals.push(...calculateMACDSignals(data, closePrices, indicator.params));
                break;
            case 'BollingerBands':
                signals.push(...calculateBollingerBandsSignals(data, closePrices, indicator.params));
                break;
            case 'Stochastic':
                signals.push(...calculateStochasticSignals(data, indicator.params));
                break;
        }
    });
    
    return signals;
}

// --- Individual Indicator Calculation Functions ---

function calculateRSISignals(data: HistoricalDataPoint[], closePrices: number[], params: any): Omit<HistoricalSignal, 'close'>[] {
    const { period = 14, overbought = 70, oversold = 30 } = params;
    const rsiValues = RSI.calculate({ values: closePrices, period });
    const signals: Omit<HistoricalSignal, 'close'>[] = [];

    rsiValues.forEach((rsi, index) => {
        const dataIndex = index + period;
        if (dataIndex < data.length) {
            if (rsi < oversold) {
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: `RSI 과매도 (${rsi.toFixed(2)})` });
            } else if (rsi > overbought) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: `RSI 과매수 (${rsi.toFixed(2)})` });
            }
        }
    });
    return signals;
}

function calculateMACDSignals(data: HistoricalDataPoint[], closePrices: number[], params: any): Omit<HistoricalSignal, 'close'>[] {
    const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = params;
    const macdValues = MACD.calculate({
        values: closePrices,
        fastPeriod,
        slowPeriod,
        signalPeriod,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    });
    const signals: Omit<HistoricalSignal, 'close'>[] = [];

    for (let i = 1; i < macdValues.length; i++) {
        const prev = macdValues[i - 1];
        const curr = macdValues[i];
        const dataIndex = i + slowPeriod -1;

        if (dataIndex < data.length && curr.MACD && curr.signal && prev.MACD && prev.signal) {
            if (prev.MACD < prev.signal && curr.MACD > curr.signal) {
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: 'MACD 골든 크로스' });
            }
            else if (prev.MACD > prev.signal && curr.MACD < curr.signal) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: 'MACD 데드 크로스' });
            }
        }
    }
    return signals;
}

function calculateBollingerBandsSignals(data: HistoricalDataPoint[], closePrices: number[], params: any): Omit<HistoricalSignal, 'close'>[] {
    const { period = 20, stdDev = 2 } = params;
    const bbValues = BollingerBands.calculate({ period, values: closePrices, stdDev });
    const signals: Omit<HistoricalSignal, 'close'>[] = [];

    bbValues.forEach((bb, index) => {
        const dataIndex = index + period -1;
        if (dataIndex < data.length) {
            const close = data[dataIndex].close;
            if (close < bb.lower) {
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: '볼린저 밴드 하단 이탈' });
            } else if (close > bb.upper) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: '볼린저 밴드 상단 돌파' });
            }
        }
    });
    return signals;
}

function calculateStochasticSignals(data: HistoricalDataPoint[], params: any): Omit<HistoricalSignal, 'close'>[] {
    const { period = 14, signalPeriod = 3 } = params;
    const stochInput = {
        high: data.map(d => d.high),
        low: data.map(d => d.low),
        close: data.map(d => d.close),
        period: period,
        signalPeriod: signalPeriod,
    };
    
    const stochValues = Stochastic.calculate(stochInput);
    const signals: Omit<HistoricalSignal, 'close'>[] = [];

    for (let i = 1; i < stochValues.length; i++) {
        const prev = stochValues[i - 1];
        const curr = stochValues[i];
        const dataIndex = i + period - 1 + (stochInput.close.length - stochValues.length);

        // Ensure k and d values are defined before using them
        if (dataIndex < data.length && curr.k !== undefined && curr.d !== undefined && prev.k !== undefined && prev.d !== undefined) {
             if (prev.k < 20 && prev.d < 20 && curr.k > curr.d) {
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: `스토캐스틱 과매도 탈출` });
            }
            else if (prev.k > 80 && prev.d > 80 && curr.k < curr.d) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: `스토캐스틱 과매수 탈출` });
            }
        }
    }
    return signals;
}
