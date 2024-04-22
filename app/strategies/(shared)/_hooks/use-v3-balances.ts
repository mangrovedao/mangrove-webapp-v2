import {
  createPublicClient,
  encodePacked,
  getContractAddress,
  http,
  isAddressEqual,
  keccak256,
  parseAbi,
  type Address,
  type ContractFunctionParameters,
  type ContractFunctionReturnType,
} from "viem"
import { blast } from "viem/chains"

const client = createPublicClient({
  chain: blast,
  transport: http(),
})
const THRUSTER_FACTORY_ADDRESS = "0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127"
const MONOSWAP_FACTORY_ADDRESS = "0x48d0F09710794313f33619c95147F34458BF7C3b"

const INIT_CODE_HASH =
  "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54" as const

const RESOLUTION = 96n
const Q96 = 0x1000000000000000000000000n

const positionManagerABI = parseAbi([
  "struct Position { uint96 nonce; address operator; address token0; address token1; uint24 fee; int24 tickLower; int24 tickUpper; uint128 liquidity; uint feeGrowthInside0LastX128; uint feeGrowthInside1LastX128; uint128 tokensOwed0; uint128 tokensOwed1; }",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function positions(uint256) view returns (Position)",
  "function factory() view returns (address)",
])

const v3FactoryABI = parseAbi([
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
])

const v3ManagerABI = parseAbi([
  "function balanceOf(address _user, address token) public view returns (uint)",
])

const uniV3PoolABI = parseAbi([
  "struct Slot0 { uint160 sqrtPriceX96; int24 tick; uint16 observationIndex; uint16 observationCardinality; uint16 observationCardinalityNext; uint8 feeProtocol; bool unlocked; }",
  "function slot0() public view returns (Slot0)",
])

type Position = ContractFunctionReturnType<
  typeof positionManagerABI,
  "view",
  "positions"
>

type Slot0 = ContractFunctionReturnType<typeof uniV3PoolABI, "view", "slot0">

/**
 *
 * @param params.positionManage, paramsrNft the address of the position manager nft
 * @param params.v3Manager the address of the v3 manager (Mangrove V3 Manager)
 * @param params.user the address of the user
 * @param params.base the address of the base token (tokens to compute balance of)
 * @param params.quote the address of the quote token (tokens to compute balance of)
 * @returns the balance of nft for the user, the factory address, balance of base token in v3Manager, balance of quote token in v3Manager
 */
async function getInitialParams(params: {
  positionManagerNft: Address
  v3Manager: Address
  user: Address
  base: Address
  quote: Address
}) {
  const [
    positionNftBalance,
    factory,
    baseBalanceInManager,
    quoteBalanceInManager,
  ] = await client.multicall({
    contracts: [
      {
        address: params.positionManagerNft,
        abi: positionManagerABI,
        functionName: "balanceOf",
        args: [params.user],
      },
      {
        address: params.positionManagerNft,
        abi: positionManagerABI,
        functionName: "factory",
      },
      {
        address: params.v3Manager,
        abi: v3ManagerABI,
        functionName: "balanceOf",
        args: [params.user, params.base],
      },
      {
        address: params.v3Manager,
        abi: v3ManagerABI,
        functionName: "balanceOf",
        args: [params.user, params.quote],
      },
    ],
    allowFailure: false,
  })
  return {
    positionNftBalance,
    factory,
    baseBalanceInManager,
    quoteBalanceInManager,
  }
}

/**
 *
 * @param params.positionManagerNft the address of the position manager nft
 * @param params.user the address of the user
 * @param params.balance the balance of the user (number of nfts)
 * @returns the ids of the positions
 */
async function getPositionsIds(params: {
  positionManagerNft: Address
  user: Address
  balance: bigint
}) {
  return client.multicall({
    contracts: Array.from({ length: Number(params.balance) }).map(
      (_, i) =>
        ({
          address: params.positionManagerNft,
          abi: positionManagerABI,
          functionName: "tokenOfOwnerByIndex",
          args: [params.user, BigInt(i)],
        }) as ContractFunctionParameters<
          typeof positionManagerABI,
          "view",
          "tokenOfOwnerByIndex"
        >,
    ),
    allowFailure: false,
  })
}

/**
 * @notice get the positions informations
 * @param params.positionManagerNft the address of the position manager nft
 * @param params.ids the ids of the positions
 * @returns the positions informations
 */
async function getPositions(params: {
  positionManagerNft: Address
  ids: bigint[]
}) {
  return client.multicall({
    contracts: params.ids.map(
      (id) =>
        ({
          address: params.positionManagerNft,
          abi: positionManagerABI,
          functionName: "positions",
          args: [id],
        }) as ContractFunctionParameters<
          typeof positionManagerABI,
          "view",
          "positions"
        >,
    ),
    allowFailure: false,
  })
}

/**
 * @notice get the pool address
 * @param params.factory the factory address
 * @param params.token0 the address of the token0
 * @param params.token1 the address of the token1
 * @param params.fee the fee
 * @returns the pool address
 */
async function getPoolAddress(params: {
  factory: Address
  token0: Address
  token1: Address
  fee: number
}) {
  return getContractAddress({
    from: params.factory,
    opcode: "CREATE2",
    bytecodeHash: INIT_CODE_HASH,
    salt: keccak256(
      encodePacked(
        ["address", "address", "uint24"],
        [params.token0, params.token1, params.fee],
      ),
    ),
  })
}

async function getPoolsFromPosition(params: {
  factory: Address
  positions: Position[]
}) {
  return await client.multicall({
    contracts: params.positions.map((position) => ({
      address: params.factory,
      abi: v3FactoryABI,
      functionName: "getPool",
      args: [position.token0, position.token1, position.fee],
    })),
    allowFailure: false,
  })
}

/**
 * @notice get the slot0 of each pool
 * @param params.factory the factory address
 * @param params.positions the positions
 * @returns the slot0 of each pool
 */
async function getPoolsSlot0FromPositions(params: {
  factory: Address
  positions: Position[]
}) {
  const pools = await getPoolsFromPosition(params)

  return client.multicall({
    contracts: params.positions.map((position, i) => ({
      address: pools[i] as Address,
      abi: uniV3PoolABI,
      functionName: "slot0",
    })),
    allowFailure: false,
  })
}

function getAmount0ForLiquidity({
  sqrtRatioAX96,
  sqrtRatioBX96,
  liquidity,
}: {
  sqrtRatioAX96: bigint
  sqrtRatioBX96: bigint
  liquidity: bigint
}) {
  return (
    ((liquidity << RESOLUTION) * (sqrtRatioBX96 - sqrtRatioAX96)) /
    sqrtRatioBX96 /
    sqrtRatioAX96
  )
}

function getAmount1ForLiquidity({
  sqrtRatioAX96,
  sqrtRatioBX96,
  liquidity,
}: {
  sqrtRatioAX96: bigint
  sqrtRatioBX96: bigint
  liquidity: bigint
}) {
  return (liquidity * (sqrtRatioBX96 - sqrtRatioAX96)) / Q96
}

function getAmountsForLiquidity({
  sqrtRatioX96,
  sqrtRatioAX96,
  sqrtRatioBX96,
  liquidity,
}: {
  sqrtRatioX96: bigint
  sqrtRatioAX96: bigint
  sqrtRatioBX96: bigint
  liquidity: bigint
}) {
  let amount0 = 0n
  let amount1 = 0n
  if (sqrtRatioX96 <= sqrtRatioAX96) {
    amount0 = getAmount0ForLiquidity({
      sqrtRatioAX96,
      sqrtRatioBX96,
      liquidity,
    })
  } else if (sqrtRatioX96 < sqrtRatioBX96) {
    amount0 = getAmount0ForLiquidity({
      sqrtRatioAX96: sqrtRatioX96,
      sqrtRatioBX96,
      liquidity,
    })
    amount1 = getAmount1ForLiquidity({
      sqrtRatioAX96,
      sqrtRatioBX96: sqrtRatioX96,
      liquidity,
    })
  } else {
    amount1 = getAmount1ForLiquidity({
      sqrtRatioAX96,
      sqrtRatioBX96,
      liquidity,
    })
  }
  return { amount0, amount1 }
}

function getSqrtRatioAtTick(tick: number) {
  const ratio = Math.sqrt(1.0001 ** Number(tick))
  return BigInt(ratio * 2 ** 96)
}

function balanceInPosition(params: { slot0: Slot0; position: Position }) {
  const { amount0: amount0FromLiquidity, amount1: amount1FromLiquidity } =
    getAmountsForLiquidity({
      sqrtRatioX96: params.slot0.sqrtPriceX96,
      sqrtRatioAX96: getSqrtRatioAtTick(params.position.tickLower),
      sqrtRatioBX96: getSqrtRatioAtTick(params.position.tickUpper),
      liquidity: params.position.liquidity,
    })
  return {
    amount0: amount0FromLiquidity + params.position.tokensOwed0,
    amount1: amount1FromLiquidity + params.position.tokensOwed1,
  }
}

export async function getV3PositionBalances(params: {
  type: "thruster" | "monoswap"
  positionManagerNft: Address
  v3Manager: Address
  user: Address
  base: Address
  quote: Address
}) {
  const isBaseToken0 = BigInt(params.base) < BigInt(params.quote)
  console.log(1, isBaseToken0, params)
  // ========== useUniV3InitialParams ==========

  // first call
  // - position nft balance
  // - factory address from non positionManagerNft
  // - base/quote balances in v3Manager
  const initialParams = await getInitialParams(params)
  console.log(2, initialParams)

  // ========== end hook ==========

  // ========== useUniV3Positions ==========

  // second call
  // - all token ids
  const ids = await getPositionsIds({
    ...params,
    balance: initialParams.positionNftBalance,
  })
  console.log(3, ids)

  // third call
  // - all positions informations
  const positions = await getPositions({
    ...params,
    ids: ids,
  })
  console.log(4, positions)

  // fourth call
  // - slot0 of each pool
  const poolsSlot0 = await getPoolsSlot0FromPositions({
    factory: initialParams.factory,
    positions,
  })
  console.log(5, poolsSlot0)

  // ========== end hook ==========

  return positions
    .map((position, i) => {
      const balance = balanceInPosition({
        slot0: poolsSlot0[i]!,
        position,
      })
      return {
        balance: {
          base:
            (isBaseToken0 ? balance.amount0 : balance.amount1) +
            initialParams.baseBalanceInManager,
          quote:
            (isBaseToken0 ? balance.amount1 : balance.amount0) +
            initialParams.quoteBalanceInManager,
        },
        position,
        id: ids[i],
      }
    })
    .filter((position) => {
      const isRightTokens = isBaseToken0
        ? isAddressEqual(position.position.token0, params.base) &&
          isAddressEqual(position.position.token1, params.quote)
        : isAddressEqual(position.position.token0, params.quote) &&
          isAddressEqual(position.position.token1, params.base)
      return isRightTokens
    })
}
