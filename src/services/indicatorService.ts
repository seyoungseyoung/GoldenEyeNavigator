
import { RSI, MACD, BollingerBands, Stochastic } from 'technicalindicators';
import type { StockSignalOutput } from '@/ai/flows/stock-signal-generator';
import type { HistoricalSignal } from '@/components/timing/StockChartWithSignals';

type HistoricalDataPoint = StockSignalOutput['historicalData'][0];
type RecommendedIndicator = StockSignalOutput['recommendedIndicators'][0];

// Define the names of supported indicators
export const INDICATORS = ["RSI", "MACD", "BollingerBands", "Stochastic"] as const;

/**
 * Calculates buy/sell signals based on a set of technical indicators.
 * @param data Historical stock data.
 * @param indicators The indicators and their parameters chosen by the AI.
 * @returns An array of historical signals.
 */
export function calculateSignals(data: HistoricalDataPoint[], indicators: RecommendedIndicator[]): HistoricalSignal[] {
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
                signals.push(...calculateStochasticSignals(data, closePrices, indicator.params));
                break;
        }
    });

    // Combine signals from all indicators and add the close price for each signal date
    const dataMap = new Map(data.map(d => [d.date, d.close]));
    const combinedSignals: HistoricalSignal[] = [];

    signals.forEach(signal => {
        if (dataMap.has(signal.date)) {
            combinedSignals.push({
                ...signal,
                close: dataMap.get(signal.date)!
            });
        }
    });

    // Return unique signals sorted by date
    const uniqueSignals = Array.from(new Map(combinedSignals.map(s => [s.date, s])).values());
    return uniqueSignals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: `RSI (${rsi.toFixed(2)})가 과매도 구간(${oversold})에 진입했습니다.` });
            } else if (rsi > overbought) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: `RSI (${rsi.toFixed(2)})가 과매수 구간(${overbought})에 진입했습니다.` });
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

        if (dataIndex < data.length) {
             // Buy signal: MACD line crosses above the signal line
            if (prev.MACD < prev.signal && curr.MACD > curr.signal) {
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: 'MACD선이 시그널선을 상향 돌파했습니다 (골든 크로스).' });
            }
            // Sell signal: MACD line crosses below the signal line
            else if (prev.MACD > prev.signal && curr.MACD < curr.signal) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: 'MACD선이 시그널선을 하향 돌파했습니다 (데드 크로스).' });
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
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: `주가가 볼린저 밴드 하단(${bb.lower.toFixed(2)}) 아래로 떨어졌습니다.` });
            } else if (close > bb.upper) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: `주가가 볼린저 밴드 상단(${bb.upper.toFixed(2)}) 위로 치솟았습니다.` });
            }
        }
    });
    return signals;
}

function calculateStochasticSignals(data: HistoricalDataPoint[], closePrices: number[], params: any): Omit<HistoricalSignal, 'close'>[] {
    const { period = 14, signalPeriod = 3 } = params;
    const highPrices = data.map(d => d.high); 
    const lowPrices = data.map(d => d.low);
    
    const stochValues = Stochastic.calculate({
        high: highPrices,
        low: lowPrices,
        close: closePrices,
        period,
        signalPeriod,
    });
    const signals: Omit<HistoricalSignal, 'close'>[] = [];

    for (let i = 1; i < stochValues.length; i++) {
        const prev = stochValues[i - 1];
        const curr = stochValues[i];
        const dataIndex = i + period -1;

        if (dataIndex < data.length) {
             // Buy signal: %K crosses above %D in the oversold region
            if (prev.k < 20 && prev.d < 20 && curr.k > curr.d) {
                signals.push({ date: data[dataIndex].date, signal: '매수', rationale: `스토캐스틱 %K선이 과매도 구간에서 %D선을 상향 돌파했습니다.` });
            }
            // Sell signal: %K crosses below %D in the overbought region
            else if (prev.k > 80 && prev.d > 80 && curr.k < curr.d) {
                signals.push({ date: data[dataIndex].date, signal: '매도', rationale: `스토캐스틱 %K선이 과매수 구간에서 %D선을 하향 돌파했습니다.` });
            }
        }
    }
    return signals;
}
