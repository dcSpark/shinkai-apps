export function formatBalance(amount: string, decimals: number): string {
  const balance = Number.parseFloat(amount) / Math.pow(10, decimals);
  return balance.toFixed(decimals === 18 ? 6 : 2);
}

export function formatBalanceWithSymbol(
  amount: string,
  decimals: number,
  symbol: string,
) {
  return `${formatBalance(amount, decimals)} ${symbol}`;
}

export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
