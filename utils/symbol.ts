export const overrideSymbol = (symbol: string) => {
  const overrides: { [key: string]: string } = {
    USDC: "USDC.n",
  }
  return overrides[symbol] || symbol
}
