import { faker } from "@faker-js/faker"

import { strategySchema, type Strategy } from "../../../_schemas/kandels"

const markets = [
  [
    "0x2Fa2e7a6dEB7bb51B625336DBe1dA23511914a8A",
    "0xc8c0Cf9436F4862a8F60Ce680Ca5a9f0f99b5ded",
  ],
  [
    "0x2bbF1f48a678d2f7c291dc5F8fD04805D34F485f",
    "0x2Fa2e7a6dEB7bb51B625336DBe1dA23511914a8A",
  ],
  [
    "0x193163EeFfc795F9d573b171aB12cCDdE10392e8",
    "0xe8099699aa4A79d89dBD20A63C50b7d35ED3CD9e",
  ],
  [
    "0xe9259C5B6936Ee6439654171AFd674b31a533985",
    "0xe8099699aa4A79d89dBD20A63C50b7d35ED3CD9e",
  ],
  [
    "0x406bF0fcE108dD8864627EC6816AaFF8336f8231",
    "0xe8099699aa4A79d89dBD20A63C50b7d35ED3CD9e",
  ],
]

export const MOCKS: Strategy[] = Array.from({ length: 10 }, (_, i) => {
  const market = markets[i % markets.length]
  return strategySchema.parse({
    transactionHash: faker.string.uuid(),
    creationDate: faker.date.recent(),
    address: faker.finance.ethereumAddress(),
    type: i % 2 === 0 ? "Kandel" : "KandelAAVE",
    base: market?.[0],
    quote: market?.[1],
    depositedBase: faker.finance.amount(0, 1000, 18).toString(),
    depositedQuote: faker.finance.amount(0, 1000, 18).toString(),
    currentParameter: {
      gasprice: faker.finance.amount(0, 100, 9).toString(),
      gasreq: faker.number.int({ min: 21000, max: 100000 }).toString(),
      stepSize: faker.number.int({ min: 1, max: 10 }).toString(),
      length: faker.number.int({ min: 1, max: 10 }).toString(),
    },
    offers: Array.from({ length: 5 }, (_, j) => ({
      offerType: j % 2 === 0 ? "bids" : "asks",
      gives: faker.finance.amount(0, 1000, 18).toString(),
      gasprice: faker.finance.amount(0, 100, 9).toString(),
      gasreq: faker.number.int({ min: 21000, max: 100000 }).toString(),
      gasbase: faker.finance.amount(0, 1000, 18).toString(),
      price: faker.finance.amount(0, 1000, 18).toString(),
      index: j,
      offerId: j,
      live: j % 2 === 0,
    })),
  })
})
