
// src/contexts/PortfolioContext.tsx
"use client";

import type { InvestmentStrategyOutput } from '@/ai/flows/generate-investment-strategy';
import type { SummarizeMarketChangesOutput } from '@/ai/flows/summarize-market-changes';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PortfolioState {
  strategy: InvestmentStrategyOutput | null;
  setStrategy: (strategy: InvestmentStrategyOutput | null) => void;
  marketUpdate: SummarizeMarketChangesOutput | null;
  setMarketUpdate: (update: SummarizeMarketChangesOutput | null) => void;
  isInitialized: boolean;
}

const PortfolioContext = createContext<PortfolioState | undefined>(undefined);

const STRATEGY_STORAGE_KEY = 'goldenYearsPortfolioStrategy';
const MARKET_UPDATE_STORAGE_KEY = 'goldenYearsMarketUpdate';

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [strategy, setStrategyState] = useState<InvestmentStrategyOutput | null>(null);
  const [marketUpdate, setMarketUpdateState] = useState<SummarizeMarketChangesOutput | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load initial state from localStorage
  useEffect(() => {
    let strategyToSet: InvestmentStrategyOutput | null = null;
    let marketUpdateToSet: SummarizeMarketChangesOutput | null = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedStrategy = localStorage.getItem(STRATEGY_STORAGE_KEY);
        if (storedStrategy) {
          try {
            strategyToSet = JSON.parse(storedStrategy);
          } catch (e) {
            console.error("Failed to parse stored strategy from localStorage. Clearing it.", e);
            localStorage.removeItem(STRATEGY_STORAGE_KEY); // Clear corrupted data
          }
        }
      } catch (error) {
        console.error("Error accessing stored strategy from localStorage", error);
      }

      try {
        const storedMarketUpdate = localStorage.getItem(MARKET_UPDATE_STORAGE_KEY);
        if (storedMarketUpdate) {
          try {
            marketUpdateToSet = JSON.parse(storedMarketUpdate);
          } catch (e) {
            console.error("Failed to parse stored market update from localStorage. Clearing it.", e);
            localStorage.removeItem(MARKET_UPDATE_STORAGE_KEY); // Clear corrupted data
          }
        }
      } catch (error) {
        console.error("Error accessing stored market update from localStorage", error);
      }
    }
    
    setStrategyState(strategyToSet);
    setMarketUpdateState(marketUpdateToSet);
    setIsInitialized(true); // Signal that initialization is complete
  }, []);
  
  const setStrategy = (newStrategy: InvestmentStrategyOutput | null) => {
    setStrategyState(newStrategy);
  };

  const setMarketUpdate = (newUpdate: SummarizeMarketChangesOutput | null) => {
    setMarketUpdateState(newUpdate);
  };
  
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined' && window.localStorage) {
      try {
        if (strategy) {
          localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(strategy));
        } else {
          localStorage.removeItem(STRATEGY_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save strategy to localStorage", error);
      }
    }
  }, [strategy, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined' && window.localStorage) {
      try {
        if (marketUpdate) {
          localStorage.setItem(MARKET_UPDATE_STORAGE_KEY, JSON.stringify(marketUpdate));
        } else {
          localStorage.removeItem(MARKET_UPDATE_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save marketUpdate to localStorage", error);
      }
    }
  }, [marketUpdate, isInitialized]);

  return (
    <PortfolioContext.Provider value={{ strategy, setStrategy, marketUpdate, setMarketUpdate, isInitialized }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioState => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
