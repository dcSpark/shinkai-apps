export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalanceAmount = (
  amount: string | undefined,
  decimals = 18,
): string => {
  if (!amount) return '0';
  const value = BigInt(amount);
  const bigDecimals = BigInt(decimals);

  // Calculate 10^decimals using string multiplication instead of ** operator
  let divisor = BigInt(1);
  for (let i = 0; i < decimals; i++) {
    divisor *= BigInt(10);
  }

  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  const decimalsNumber = Number(bigDecimals);
  const fractionalStr = fractionalPart.toString().padStart(decimalsNumber, '0');
  const trimmedFractionalStr = fractionalStr.replace(/0+$/, '');

  return `${integerPart}.${trimmedFractionalStr}`;
};

export const getBasescanAddressUrl = (address: string, network?: string) => {
  if (!address) return '';
  return network?.toLowerCase() === 'base-sepolia'
    ? `https://sepolia.basescan.org/address/${address}`
    : `https://basescan.org/address/${address}`;
};
