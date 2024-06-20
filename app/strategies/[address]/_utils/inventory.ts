// import { OfferWithPrices } from "@mangrovedao/indexer-sdk/dist/src/kandel/types"

// import Big from "big.js"

// export type MergedOffer = OfferWithPrices & {
//   index: number
//   base: Big
//   quote: Big
// }
// export type MergedOffers = MergedOffer[]

// function getPublished(
//   mergedOffers: MergedOffers | undefined,
//   offerType: "asks" | "bids",
// ) {
//   if (!mergedOffers) return Big(0)

//   const key = offerType === "asks" ? "base" : "quote"
//   return mergedOffers.reduce(
//     (acc: Big, offer) =>
//       acc.add(
//         offer.live && offer.offerType === offerType ? Big(offer[key]) : Big(0),
//       ),
//     Big(0),
//   )
// }

// export function getPublishedBase(mergedOffers: MergedOffers | undefined) {
//   return getPublished(mergedOffers, "asks")
// }

// export function getPublishedQuote(mergedOffers: MergedOffers | undefined) {
//   return getPublished(mergedOffers, "bids")
// }

// export function getUnallocated(total: Big | undefined, published: Big) {
//   return total?.sub(published) || Big(0)
// }

// export function getMinPrice(offerStatuses: Statuses | null | undefined) {
//   return offerStatuses?.minPrice || Big(0)
// }

// export function getMaxPrice(offerStatuses: Statuses | null | undefined) {
//   return offerStatuses?.maxPrice || Big(0)
// }

// export function getMergedOffers(
//   sdkOffers: Statuses | null | undefined,
//   indexedOffers: OfferWithPrices[] | undefined,
//   market: Market | undefined,
// ) {
//   if (!market || !indexedOffers || !sdkOffers) return []
//   const asksPriceHelper = new TickPriceHelper("asks", market)
//   const bidsPriceHelper = new TickPriceHelper("bids", market)
//   console.log(sdkOffers)
//   return sdkOffers?.statuses
//     .map((sdkOffer) => {
//       const indexedOffer = indexedOffers?.find((indexedOffer) => {
//         const isExpectedLiveAsk = sdkOffer.expectedLiveAsk
//         const isExpectedLiveBid = sdkOffer.expectedLiveBid

//         // we do not have ask/bid type information, so we retreive the corresponding offer by comparing the price
//         if (!isExpectedLiveAsk && !isExpectedLiveBid) {
//           return (
//             (indexedOffer?.offerId === sdkOffer.asks?.id &&
//               sdkOffer.asks?.price?.toString() ===
//                 indexedOffer.price?.toString()) ||
//             (indexedOffer?.offerId === sdkOffer.bids?.id &&
//               sdkOffer.bids?.price?.toString() ===
//                 indexedOffer.price?.toString())
//           )
//         }

//         const offerType = sdkOffer?.expectedLiveAsk ? "asks" : "bids"

//         return (
//           indexedOffer?.offerId === sdkOffer?.[offerType]?.id &&
//           indexedOffer.offerType === offerType
//         )
//       })
//       const offerType = indexedOffer?.offerType
//       const expectedLive =
//         offerType === "bids"
//           ? sdkOffer.expectedLiveBid
//           : sdkOffer.expectedLiveAsk
//       const live =
//         expectedLive &&
//         (offerType === "bids" ? sdkOffer.bids?.live : sdkOffer.asks?.live)
//       const isBid = offerType === "bids"
//       const wants = (
//         isBid ? bidsPriceHelper : asksPriceHelper
//       ).inboundFromOutbound(
//         indexedOffer?.tick ?? 0,
//         indexedOffer?.gives ?? 0,
//         "roundUp",
//       )
//       const base = Big(isBid ? wants || 0 : indexedOffer?.gives || 0)
//       const quote = Big(isBid ? indexedOffer?.gives || 0 : wants || 0)
//       return {
//         ...indexedOffer,
//         index: indexedOffer?.index ?? 0,
//         base,
//         quote,
//         live,
//       }
//     })
//     .filter((x) => x.offerId)
//     .sort((a, b) =>
//       a.offerType === b.offerType || !(a.offerType && b.offerType)
//         ? 0
//         : a.offerType < b.offerType
//           ? 1
//           : -1,
//     )
// }

// export type BountyInfos = {
//   isBountySufficient: boolean
//   bounty: Big
//   balance: Big
//   lockedBountyFromOffers: Big
//   expectedBounty: Big
// }

// // export async function getBountyInfos(
// //   stratInstance: GeometricKandelInstance,
// //   indexedStrat: Kandel,
// //   gasprice: number,
// // ): Promise<BountyInfos> {
// //   const balance = await stratInstance.offerLogic.getMangroveBalance()
// //   const offersGasInfo =
// //     indexedStrat?.offers?.map(({ gasbase, gasreq, gasprice }) => ({
// //       gasbase: Number(gasbase || 0),
// //       gasreq: Number(gasreq || 0),
// //       gasprice: Number(gasprice || 0),
// //     })) || []
// //   const lockedBountyFromOffers =
// //     stratInstance.getLockedProvisionFromOffers(offersGasInfo)
// //   const bounty = lockedBountyFromOffers.add(balance || 0) || Big(0)
// //   const expectedBounty = await stratInstance.getMissingProvisionFromOffers(
// //     { gasprice },
// //     offersGasInfo,
// //   )
// //   return {
// //     isBountySufficient: bounty?.lt(expectedBounty || 0),
// //     bounty,
// //     balance,
// //     lockedBountyFromOffers,
// //     expectedBounty,
// //   }
// // }
