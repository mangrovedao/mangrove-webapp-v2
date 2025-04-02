export const ghostbookAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_mgv", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "MGV",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IMangrove" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "blacklistModule",
    inputs: [{ name: "_module", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "externalSwap",
    inputs: [
      {
        name: "olKey",
        type: "tuple",
        internalType: "struct OLKey",
        components: [
          { name: "outbound_tkn", type: "address", internalType: "address" },
          { name: "inbound_tkn", type: "address", internalType: "address" },
          { name: "tickSpacing", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "amountToSell", type: "uint256", internalType: "uint256" },
      { name: "maxTick", type: "int256", internalType: "Tick" },
      {
        name: "moduleData",
        type: "tuple",
        internalType: "struct ModuleData",
        components: [
          {
            name: "module",
            type: "address",
            internalType: "contract IExternalSwapModule",
          },
          { name: "data", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "taker", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "gave", type: "uint256", internalType: "uint256" },
      { name: "got", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "marketOrderByTick",
    inputs: [
      {
        name: "olKey",
        type: "tuple",
        internalType: "struct OLKey",
        components: [
          { name: "outbound_tkn", type: "address", internalType: "address" },
          { name: "inbound_tkn", type: "address", internalType: "address" },
          { name: "tickSpacing", type: "uint256", internalType: "uint256" },
        ],
      },
      { name: "maxTick", type: "int256", internalType: "Tick" },
      { name: "amountToSell", type: "uint256", internalType: "uint256" },
      {
        name: "moduleData",
        type: "tuple",
        internalType: "struct ModuleData",
        components: [
          {
            name: "module",
            type: "address",
            internalType: "contract IExternalSwapModule",
          },
          { name: "data", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    outputs: [
      { name: "takerGot", type: "uint256", internalType: "uint256" },
      { name: "takerGave", type: "uint256", internalType: "uint256" },
      { name: "bounty", type: "uint256", internalType: "uint256" },
      { name: "feePaid", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rescueFunds",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whitelistModule",
    inputs: [{ name: "_module", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whitelistedModules",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IExternalSwapModule",
      },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ModuleBlacklisted",
    inputs: [
      {
        name: "module",
        type: "address",
        indexed: false,
        internalType: "contract IExternalSwapModule",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ModuleWhitelisted",
    inputs: [
      {
        name: "module",
        type: "address",
        indexed: false,
        internalType: "contract IExternalSwapModule",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "InferredTickHigherThanMaxTick",
    inputs: [
      { name: "inferredTick", type: "int256", internalType: "Tick" },
      { name: "maxTick", type: "int256", internalType: "Tick" },
    ],
  },
  { type: "error", name: "ModuleNotWhitelisted", inputs: [] },
  { type: "error", name: "OnlyThisContractCanCallThisFunction", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "ReentrancyGuardReentrantCall", inputs: [] },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "TransferFailed", inputs: [] },
] as const;
