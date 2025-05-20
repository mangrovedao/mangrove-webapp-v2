import { seiWBTCUSDC, seiWETHUSDC, seiWSEIUSDC } from "@/hooks/use-addresses"
import {
  arbitrumARBUSDCe,
  arbitrumUSDCUSDT,
  arbitrumWBTCUSDT,
  arbitrumWETHUSDC,
  arbitrumWETHweETH,
  baseCBBTCEURC,
  baseCBBTCUSDC,
  baseCBETHWETH,
  baseSepoliaWBTCDAI,
  baseWETHUSDC,
  baseWSTETHWETH,
} from "@mangrovedao/mgv/addresses"
import { Address } from "viem"

export const VAULTS_WHITELIST_ARBITRUM = [
  {
    strategist: "Redacted Labs",
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
    strategist: "Redacted Labs",
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
    strategist: "Redacted Labs",
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
    strategist: "Redacted Labs",
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
    strategist: "Redacted Labs",
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
    strategist: "Redacted Labs",
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

export const VAULTS_WHITELIST_BASE = [
  {
    isDeprecated: true,
    strategist: "Redacted Labs",
    address: "0xCC1beacCdA8024bA968D63e6db9f01A15D593C52" as Address,
    oracle: "0x15356207735c7d75Fb268c0cf8e11A4F3Bf68c33" as Address,
    market: baseWETHUSDC, // good
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
    isDeprecated: true,
    strategist: "Redacted Labs",
    address: "0x365cBDdFc764600D4728006730dd055B18f518ce" as Address,
    oracle: "0xEF62766c96FEcC5a44704a97962849D2F6a4394F" as Address,
    market: baseCBBTCUSDC, // good
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
    isDeprecated: true,
    strategist: "Redacted Labs",
    address: "0xC95a225fd311E911a610D8274593C19282012119" as Address,
    oracle: "0xcF9115B12502Bb9AA9E644c83c1DcBeFbeBbc1a6" as Address,
    market: baseCBBTCEURC,
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
    strategist: "Redacted Labs",
    isDeprecated: false,
    address: "0x5ebDEB4019E0D82537c9490DE89459a050CF9ed3" as Address,
    market: baseWETHUSDC,
    strategyType: "Morpho",
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
    strategist: "Redacted Labs",
    isDeprecated: false,
    address: "0x764c8A041F7CA7ad3C47d38dc6970d3B894Ce481" as Address,
    market: baseCBBTCUSDC,
    strategyType: "Morpho",
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
    strategist: "Redacted Labs",
    isDeprecated: false,
    address: "0x5c5Baf2b2cE96bC5BCb4Cde1B5b7e3FBd176E01C" as Address,
    market: baseCBBTCEURC,
    strategyType: "Morpho",
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
    strategist: "Redacted Labs",
    isDeprecated: false,
    address: "0x1E059d02b7dc5eDA998e0686b28A1e715616F6e5" as Address,
    market: baseCBETHWETH,
    strategyType: "Aave",
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
    strategist: "Redacted Labs",
    isDeprecated: false,
    address: "0x9bd7f8b3EA501EB5dDB4380f6BA87aF163eA3f12" as Address,
    market: baseWSTETHWETH,
    strategyType: "Aave",
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
    isDeprecated: true,
    strategist: "Redacted Labs",
    address: "0x8ec6a6BB89ccF694129077954587B25b6c712bc8" as Address,
    oracle: "0xB95FfCFB01F66Bb30F6940aF5118E46F69628cb2" as Address,
    market: baseWSTETHWETH,
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
export const VAULTS_WHITELIST_SEI = [
  {
    isDeprecated: false,
    strategist: "Redacted Labs",
    address: "0xc384421754908b1Ad244df323D9d4f9FD0Edf0cA" as Address,
    oracle: "0x77c131f98f3b841f99F4C47C1Af1FB044817944f" as Address,
    market: seiWSEIUSDC,
    strategyType: "Kandle Yei",
    description:
      "Concentrated Vault Strategy on Oxium.\n This strategy focuses liquidity within targeted price ranges rather than the full spectrum, boosting capital efficiency and fee capture.\n\n",
    descriptionBonus: "",
    // descriptionBonus:
    //   "Avoiding High-Volatility Phases:\nUsing predictive models or on-chain volatility indicators, the vault anticipates high-volatility periods. Before these phases, the strategy either expands the range or exits liquidity provision. This proactive measure reduces exposure during risky periods, mitigating potential impermanent loss.\n\nFee Collection from Traders:\nBy concentrating liquidity in specific ranges, the strategy enhances fee generation from trades within these ranges. The strategy dynamically adjusts liquidity based on market conditions to keep it where trading activity is highest. This ensures fee collection, even during moderate price movement, while avoiding unnecessary risk.\n\nImpermanent Loss Mitigation:\nImpermanent Loss (IL) occurs when token prices in a pool shift significantly. This strategy reduces IL through several techniques\n\n- Dynamic Asset Allocation: Unlike traditional LPs with a strict 50-50 asset split, this strategy allows flexible allocation when liquidity is withdrawn from the pool. This approach lowers the risk of overexposure to a volatile asset, thus minimizing potential IL.\n- Yield Optimization through Aave: When assets are not used in the pool, they are temporarily deposited in Aave or other lending platforms. This provides additional yield from lending interest, ensuring productive use of capital even outside trading.\n- Adaptive Range Management: When asset prices move outside the initial liquidity range, the strategy adjusts or withdraws liquidity to prevent significant divergence in asset prices, which often leads to IL. By rebalancing assets only when strategically beneficial, this approach minimizes IL while maximizing returns through fee capture during favorable conditions.",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
  {
    isDeprecated: false,
    strategist: "Redacted Labs",
    address: "0xaFa66E418E182bcBD425aABe566d4CD188c85ebc" as Address,
    oracle: "0x9a039Cc5929DE911C7C963BF24A31479E5dc4E28" as Address,
    market: seiWBTCUSDC,
    strategyType: "Kandle Yei",
    description:
      "Concentrated Vault Strategy on Oxium.\n This strategy focuses liquidity within targeted price ranges rather than the full spectrum, boosting capital efficiency and fee capture.\n\n",
    descriptionBonus: "",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },

  {
    isDeprecated: false,
    strategist: "Redacted Labs",
    address: "0x62706bc2Eb921D0f33FD7D8771434De41315f113" as Address,
    oracle: "0x37b3291ef17eeF398D2F9Ac010e81827f6Cf6BA1" as Address,
    market: seiWETHUSDC,
    strategyType: "Kandle Yei",
    description:
      "Concentrated Vault Strategy on Oxium.\n This strategy focuses liquidity within targeted price ranges rather than the full spectrum, boosting capital efficiency and fee capture.\n\n",
    descriptionBonus: "",
    // descriptionBonus:
    //   "Avoiding High-Volatility Phases:\nUsing predictive models or on-chain volatility indicators, the vault anticipates high-volatility periods. Before these phases, the strategy either expands the range or exits liquidity provision. This proactive measure reduces exposure during risky periods, mitigating potential impermanent loss.\n\nFee Collection from Traders:\nBy concentrating liquidity in specific ranges, the strategy enhances fee generation from trades within these ranges. The strategy dynamically adjusts liquidity based on market conditions to keep it where trading activity is highest. This ensures fee collection, even during moderate price movement, while avoiding unnecessary risk.\n\nImpermanent Loss Mitigation:\nImpermanent Loss (IL) occurs when token prices in a pool shift significantly. This strategy reduces IL through several techniques\n\n- Dynamic Asset Allocation: Unlike traditional LPs with a strict 50-50 asset split, this strategy allows flexible allocation when liquidity is withdrawn from the pool. This approach lowers the risk of overexposure to a volatile asset, thus minimizing potential IL.\n- Yield Optimization through Aave: When assets are not used in the pool, they are temporarily deposited in Aave or other lending platforms. This provides additional yield from lending interest, ensuring productive use of capital even outside trading.\n- Adaptive Range Management: When asset prices move outside the initial liquidity range, the strategy adjusts or withdraws liquidity to prevent significant divergence in asset prices, which often leads to IL. By rebalancing assets only when strategically beneficial, this approach minimizes IL while maximizing returns through fee capture during favorable conditions.",
    socials: {
      x: "https://x.com/RedactedLabs_",
      website: "https://www.redactedlabs.fr/",
    },
  },
]
