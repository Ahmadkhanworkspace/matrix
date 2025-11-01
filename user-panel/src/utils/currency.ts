// Currency formatting utility
const CRYPTO_CURRENCIES = ['USDT', 'BTC', 'ETH', 'TRX', 'BNB', 'ADA', 'DOT', 'XRP'];

export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'USD'): string => {
  // Handle invalid inputs
  if (amount === null || amount === undefined) {
    amount = 0;
  }

  // Convert to number if it's a string
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
    if (isNaN(amount)) amount = 0;
  }

  // Final check for NaN
  if (isNaN(amount as number)) {
    amount = 0;
  }

  // Ensure amount is a number
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return '0.00 USD';
  }

  // Ensure currency is a string
  if (!currency || typeof currency !== 'string') {
    currency = 'USD';
  }

  const currencyUpper = currency.toUpperCase().trim();

  // Check if it's a crypto currency
  if (CRYPTO_CURRENCIES.includes(currencyUpper)) {
    // Format crypto currencies without currency symbol
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: currencyUpper === 'BTC' ? 8 : currencyUpper === 'ETH' ? 6 : 2
      }).format(numAmount);
      return `${formatted} ${currencyUpper}`;
    } catch (error) {
      return `${numAmount.toFixed(2)} ${currencyUpper}`;
    }
  }

  // Format fiat currencies with Intl.NumberFormat
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyUpper || 'USD',
      minimumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    // Fallback to USD if currency code is invalid
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(numAmount);
    } catch (fallbackError) {
      // Last resort: format as plain number
      return `${numAmount.toFixed(2)} ${currencyUpper || 'USD'}`;
    }
  }
};

