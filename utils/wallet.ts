export const shortenAddress = (address: string, length = 7): string =>
  address ? `${address.substr(0, length - 1)}...${address.substr(-length)}` : ""
