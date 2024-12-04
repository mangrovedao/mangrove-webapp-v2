import {
  arbitrumARBUSDCe,
  arbitrumUSDCUSDT,
  arbitrumWBTCUSDT,
  arbitrumWETHUSDC,
  arbitrumWETHweETH,
  baseSepoliaWBTCDAI,
} from "@mangrovedao/mgv/addresses"
import { Address } from "viem"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { useAccount } from "wagmi"

export const VAULTS_WHITELIST_ARBITRUM = [
  {
    manager: "Redacted Labs",
    address: "0x17086132Af8d39586c25FF8eA0B0283652108402" as Address,
    market: arbitrumARBUSDCe,
    strategyType: "Kandel Aave",
    description:
      "The LP's concentrated Vault strategy is an optimized approach to liquidity provision on Mangrove via Kandel. Rather than spreading liquidity across the entire price spectrum, this strategy focuses on specific price ranges to maximize returns.\n\n",
    descriptionBonus:
      "Avoiding High-Volatility Phases:\nUsing predictive models or on-chain volatility indicators, the vault anticipates high-volatility periods. Before these phases, the strategy either expands the range or exits liquidity provision. This proactive measure reduces exposure during risky periods, mitigating potential impermanent loss.\n\nFee Collection from Traders:\nBy concentrating liquidity in specific ranges, the strategy enhances fee generation from trades within these ranges. The strategy dynamically adjusts liquidity based on market conditions to keep it where trading activity is highest. This ensures fee collection, even during moderate price movement, while avoiding unnecessary risk.\n\nImpermanent Loss Mitigation:\nImpermanent Loss (IL) occurs when token prices in a pool shift significantly. This strategy reduces IL through several techniques\n\n- Dynamic Asset Allocation: Unlike traditional LPs with a strict 50-50 asset split, this strategy allows flexible allocation when liquidity is withdrawn from the pool. This approach lowers the risk of overexposure to a volatile asset, thus minimizing potential IL.\n- Yield Optimization through Aave: When assets are not used in the pool, they are temporarily deposited in Aave or other lending platforms. This provides additional yield from lending interest, ensuring productive use of capital even outside trading.\n- Adaptive Range Management: When asset prices move outside the initial liquidity range, the strategy adjusts or withdraws liquidity to prevent significant divergence in asset prices, which often leads to IL. By rebalancing assets only when strategically beneficial, this approach minimizes IL while maximizing returns through fee capture during favorable conditions.",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
  {
    manager: "Redacted Labs",
    address: "0x533fcD483a7793bfC6f1D1Fe0f25158Cc60e0cC1" as Address,
    market: arbitrumWETHUSDC,
    strategyType: "Kandel Aave",
    description:
      "The LP's concentrated Vault strategy is an optimized approach to liquidity provision on Mangrove via Kandel. Rather than spreading liquidity across the entire price spectrum, this strategy focuses on specific price ranges to maximize returns.\n\n",
    descriptionBonus:
      "Avoiding High-Volatility Phases:\nUsing predictive models or on-chain volatility indicators, the vault anticipates high-volatility periods. Before these phases, the strategy either expands the range or exits liquidity provision. This proactive measure reduces exposure during risky periods, mitigating potential impermanent loss.\n\nFee Collection from Traders:\nBy concentrating liquidity in specific ranges, the strategy enhances fee generation from trades within these ranges. The strategy dynamically adjusts liquidity based on market conditions to keep it where trading activity is highest. This ensures fee collection, even during moderate price movement, while avoiding unnecessary risk.\n\nImpermanent Loss Mitigation:\nImpermanent Loss (IL) occurs when token prices in a pool shift significantly. This strategy reduces IL through several techniques\n\n- Dynamic Asset Allocation: Unlike traditional LPs with a strict 50-50 asset split, this strategy allows flexible allocation when liquidity is withdrawn from the pool. This approach lowers the risk of overexposure to a volatile asset, thus minimizing potential IL.\n- Yield Optimization through Aave: When assets are not used in the pool, they are temporarily deposited in Aave or other lending platforms. This provides additional yield from lending interest, ensuring productive use of capital even outside trading.\n- Adaptive Range Management: When asset prices move outside the initial liquidity range, the strategy adjusts or withdraws liquidity to prevent significant divergence in asset prices, which often leads to IL. By rebalancing assets only when strategically beneficial, this approach minimizes IL while maximizing returns through fee capture during favorable conditions.",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
  {
    manager: "Redacted Labs",
    address: "0xD97278e50aFd813C697526AaEAeC5022393d4B7B" as Address,
    market: arbitrumWBTCUSDT,
    strategyType: "Kandel Aave",
    description:
      "The LP's concentrated Vault strategy is an optimized approach to liquidity provision on Mangrove via Kandel. Rather than spreading liquidity across the entire price spectrum, this strategy focuses on specific price ranges to maximize returns.\n\n",
    descriptionBonus:
      "Avoiding High-Volatility Phases:\nUsing predictive models or on-chain volatility indicators, the vault anticipates high-volatility periods. Before these phases, the strategy either expands the range or exits liquidity provision. This proactive measure reduces exposure during risky periods, mitigating potential impermanent loss.\n\nFee Collection from Traders:\nBy concentrating liquidity in specific ranges, the strategy enhances fee generation from trades within these ranges. The strategy dynamically adjusts liquidity based on market conditions to keep it where trading activity is highest. This ensures fee collection, even during moderate price movement, while avoiding unnecessary risk.\n\nImpermanent Loss Mitigation:\nImpermanent Loss (IL) occurs when token prices in a pool shift significantly. This strategy reduces IL through several techniques\n\n- Dynamic Asset Allocation: Unlike traditional LPs with a strict 50-50 asset split, this strategy allows flexible allocation when liquidity is withdrawn from the pool. This approach lowers the risk of overexposure to a volatile asset, thus minimizing potential IL.\n- Yield Optimization through Aave: When assets are not used in the pool, they are temporarily deposited in Aave or other lending platforms. This provides additional yield from lending interest, ensuring productive use of capital even outside trading.\n- Adaptive Range Management: When asset prices move outside the initial liquidity range, the strategy adjusts or withdraws liquidity to prevent significant divergence in asset prices, which often leads to IL. By rebalancing assets only when strategically beneficial, this approach minimizes IL while maximizing returns through fee capture during favorable conditions.",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
  {
    manager: "Redacted Labs",
    address: "0x17008340AC68B11E883FC0fd7f82a6106419b12a" as Address,
    market: arbitrumWETHweETH,
    strategyType: "Kandel Aave",
    description:
      "The LP's concentrated Vault strategy is an optimized approach to liquidity provision on Mangrove via Kandel. Rather than spreading liquidity across the entire price spectrum, this strategy focuses on specific price ranges to maximize returns.\n\n",
    descriptionBonus:
      "Avoiding High-Volatility Phases:\nUsing predictive models or on-chain volatility indicators, the vault anticipates high-volatility periods. Before these phases, the strategy either expands the range or exits liquidity provision. This proactive measure reduces exposure during risky periods, mitigating potential impermanent loss.\n\nFee Collection from Traders:\nBy concentrating liquidity in specific ranges, the strategy enhances fee generation from trades within these ranges. The strategy dynamically adjusts liquidity based on market conditions to keep it where trading activity is highest. This ensures fee collection, even during moderate price movement, while avoiding unnecessary risk.\n\nImpermanent Loss Mitigation:\nImpermanent Loss (IL) occurs when token prices in a pool shift significantly. This strategy reduces IL through several techniques\n\n- Dynamic Asset Allocation: Unlike traditional LPs with a strict 50-50 asset split, this strategy allows flexible allocation when liquidity is withdrawn from the pool. This approach lowers the risk of overexposure to a volatile asset, thus minimizing potential IL.\n- Yield Optimization through Aave: When assets are not used in the pool, they are temporarily deposited in Aave or other lending platforms. This provides additional yield from lending interest, ensuring productive use of capital even outside trading.\n- Adaptive Range Management: When asset prices move outside the initial liquidity range, the strategy adjusts or withdraws liquidity to prevent significant divergence in asset prices, which often leads to IL. By rebalancing assets only when strategically beneficial, this approach minimizes IL while maximizing returns through fee capture during favorable conditions.",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
  {
    manager: "Redacted Labs",
    address: "0xa99C55E911c028d610e709603CCCA2Df7a22C19D" as Address,
    market: arbitrumUSDCUSDT,
    strategyType: "Kandel Aave",
    description:
      "The LP's concentrated Vault strategy is an optimized approach to liquidity provision on Mangrove via Kandel. Rather than spreading liquidity across the entire price spectrum, this strategy focuses on specific price ranges to maximize returns.\n\n",
    descriptionBonus:
      "Avoiding High-Volatility Phases:\nUsing predictive models or on-chain volatility indicators, the vault anticipates high-volatility periods. Before these phases, the strategy either expands the range or exits liquidity provision. This proactive measure reduces exposure during risky periods, mitigating potential impermanent loss.\n\nFee Collection from Traders:\nBy concentrating liquidity in specific ranges, the strategy enhances fee generation from trades within these ranges. The strategy dynamically adjusts liquidity based on market conditions to keep it where trading activity is highest. This ensures fee collection, even during moderate price movement, while avoiding unnecessary risk.\n\nImpermanent Loss Mitigation:\nImpermanent Loss (IL) occurs when token prices in a pool shift significantly. This strategy reduces IL through several techniques\n\n- Dynamic Asset Allocation: Unlike traditional LPs with a strict 50-50 asset split, this strategy allows flexible allocation when liquidity is withdrawn from the pool. This approach lowers the risk of overexposure to a volatile asset, thus minimizing potential IL.\n- Yield Optimization through Aave: When assets are not used in the pool, they are temporarily deposited in Aave or other lending platforms. This provides additional yield from lending interest, ensuring productive use of capital even outside trading.\n- Adaptive Range Management: When asset prices move outside the initial liquidity range, the strategy adjusts or withdraws liquidity to prevent significant divergence in asset prices, which often leads to IL. By rebalancing assets only when strategically beneficial, this approach minimizes IL while maximizing returns through fee capture during favorable conditions.",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
]

export const VAULTS_WHITELIST_BASE_SEPOLIA = [
  {
    manager: "Redacted Labs",
    address: "0xae68E2f084bC5B72Dbb5Dc5bD75AF8879eDb5CBC" as Address,
    market: baseSepoliaWBTCDAI,
    strategyType: "Kandel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ed ut perspiciatis unde omnis iste natus error sit voluptatem perspiciatis ...",
    descriptionBonus: "More infos...",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
]

export function useVaultsWhitelist() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return []
    case arbitrum.id:
      return VAULTS_WHITELIST_ARBITRUM
    case baseSepolia.id:
      return VAULTS_WHITELIST_BASE_SEPOLIA
    default:
      return VAULTS_WHITELIST_ARBITRUM
  }
}

export function useVaultMintHelper() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return ""
    case arbitrum.id:
      return "0xC39b5Fb38a8AcBFFB51D876f0C0DA0325b5cD440"
    case baseSepolia.id:
      return "0xC0Ba6baF6899686bB601effE73bFC42404B93670"
    default:
      return "0xC39b5Fb38a8AcBFFB51D876f0C0DA0325b5cD440"
  }
}
