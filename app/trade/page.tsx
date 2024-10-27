"use client"
import MarketSelector from "@/app/trade/_components/market-selector/market-selector"
import { Market } from "./_components/charts/charts"
import { PricesBar } from "./_components/prices-bar/prices-bar"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  return (
    <main className="">
      <div className="flex items-center">
        <MarketSelector />
        <PricesBar />
      </div>
      <section className="chart-container border-x border-t rounded-t-2xl">
        <div
          style={{
            gridArea: "chart",
          }}
        >
          <Market className="w-full h-full" />
        </div>
      </section>

      <section className="border-x border-t border-b rounded-b-2xl tables-section z-50 bg-background">
        <Tables className="h-full" />
        {/* <OrderBook
          className="overflow-hidden"
          // style={{ gridArea: "book" }}
        /> */}
      </section>

      <section className="trade-section">
        <div className="px-4 h-[var(--bar-height)] flex items-center relative"></div>
        {/* <Forms /> */}
      </section>
      <style jsx global>{`
        body {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
      `}</style>

      <style jsx>{`
        main {
          display: grid;
          grid-area: main;
          grid-template-columns: minmax(0, 1fr) 20.5rem;
          grid-template-areas:
            "nav nav"
            "content trade"
            "tables trade";
          grid-template-rows: 56px 1fr 400px;
          height: calc(100vh - 112px);
          max-height: calc(100vh - 112px);
        }

        .tables-section {
          grid-area: tables;
        }

        .trade-section {
          grid-area: trade;
        }

        .chart-container {
          display: grid;
          grid-area: content;
          grid-template-areas: "chart";
          grid-template-columns: minmax(0, 1fr);
          {/* grid-template-rows: var(--book-chart-height); */}
          {/* grid-template-rows: var(--book-chart-height); */}
        }

        {/* @media (max-height: 800px) {
          main {
            grid-template-rows: 56px 50% 50%;
          }

          .chart-container {
            grid-template-rows: calc(50vh - var(--bar-height) + 38px);
          }
        } */}
      `}</style>
      <style global jsx>{`
        {/* .market-chart-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height) * 2);
        }
        .book-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height));
        } */}

        {/* @media (max-height: 800px) {
          :root {
            --history-table-content-height: calc(50vh - var(--bar-height) * 2);
          }
        } */}
      `}</style>
    </main>
  )
  // return (
  //   <main className="px-2 gap-x-5">
  //     <section
  //       className="space-y-3 flex flex-col"
  //       style={{ gridArea: "content", flexGrow: 1 }}
  //     >
  //       <div className="col-span-full flex items-center h-10">
  //         <div>
  //           <MarketSelector />
  //         </div>
  //         <PricesBar />
  //       </div>
  //       <div className="col-span-full border border-b-transparent rounded-t-2xl h-full flex flex-col">
  //         <Market className="" />
  //       </div>
  //     </section>

  //     <section className=" bg-red-200" style={{ gridArea: "trade" }}></section>

  //     <section className="border-x border-b rounded-b-2xl tables-section z-50 bg-background">
  //       <OrderBook className="overflow-hidden" />
  //     </section>
  //     <style jsx global>{`
  //       body {
  //         position: absolute;
  //         top: 0;
  //         left: 0;
  //         right: 0;
  //         bottom: 0;
  //         overflow: hidden;
  //       }
  //     `}</style>
  //     <style jsx>{`
  //       main {
  //         display: grid;
  //         grid-area: main;
  //         grid-template-columns: minmax(0, 1fr) 20.5rem;
  //         grid-template-areas:
  //           "content trade"
  //           "tables trade";
  //         grid-template-rows: 1fr 200px;
  //         height: calc(100vh - 112px);
  //       }
  //       .tables-section {
  //         grid-area: tables;
  //       }

  //       .trade-section {
  //         grid-area: trade;
  //       }
  //     `}</style>

  //     <style global jsx>{`
  //       .market-chart-container div[role="tabpanel"] {
  //         height: calc(100% - var(--bar-height) * 2);
  //       }
  //       .book-container div[role="tabpanel"] {
  //         height: calc(100% - var(--bar-height));
  //       }

  //       @media (max-height: 800px) {
  //         :root {
  //           --history-table-content-height: calc(50vh - var(--bar-height) * 2);
  //         }
  //       }
  //     `}</style>
  //   </main>
  // )
}
