import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  primaryCurrency: string;
  supportedCurrencies: string[];
  updatePrimaryCurrency: (currency: string) => void;
  addSupportedCurrency: (currency: string) => void;
  removeSupportedCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [primaryCurrency, setPrimaryCurrency] = useState<string>('TRX');
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([
    'TRX', 'BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'DOT', 'LINK'
  ]);

  const updatePrimaryCurrency = (currency: string) => {
    setPrimaryCurrency(currency);
  };

  const addSupportedCurrency = (currency: string) => {
    if (!supportedCurrencies.includes(currency)) {
      setSupportedCurrencies([...supportedCurrencies, currency]);
    }
  };

  const removeSupportedCurrency = (currency: string) => {
    if (currency !== primaryCurrency) {
      setSupportedCurrencies(supportedCurrencies.filter(c => c !== currency));
    }
  };

  const value: CurrencyContextType = {
    primaryCurrency,
    supportedCurrencies,
    updatePrimaryCurrency,
    addSupportedCurrency,
    removeSupportedCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 
