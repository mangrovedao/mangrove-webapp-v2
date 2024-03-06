"use client"
import { cn } from "@/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const currentRoute = usePathname()
  const getIsCurrentRoute = (route: string) => currentRoute === route

  return (
    <div className="space-y-4 text-sm m-2">
      <Link
        href="/portfolio"
        className={cn("flex items-center space-x-2 py-2 px-4 rounded-xl", {
          "bg-muted": getIsCurrentRoute("/portfolio"),
        })}
      >
        {getIsCurrentRoute("/portfolio") && (
          <div className="bg-green-caribbean size-2 rounded-full" />
        )}
        <span>Overview</span>
      </Link>
      <Link
        href="/portfolio/orders"
        className={cn("flex items-center space-x-2 py-2 px-4 rounded-xl", {
          "bg-muted": getIsCurrentRoute("/portfolio/orders"),
        })}
      >
        {getIsCurrentRoute("/portfolio/orders") && (
          <div className="bg-green-caribbean size-2 rounded-full" />
        )}
        <span>Open Orders</span>
      </Link>
      <Link
        href="/portfolio/strategies"
        className={cn("flex items-center space-x-2 py-2 px-4 rounded-xl", {
          "bg-muted": getIsCurrentRoute("/portfolio/strategies"),
        })}
      >
        {getIsCurrentRoute("/portfolio/strategies") && (
          <div className="bg-green-caribbean size-2 rounded-full" />
        )}
        <span>My Strategies</span>
      </Link>
      <Link
        href="/portfolio/history"
        className={cn("flex items-center space-x-2 py-2 px-4 rounded-xl", {
          "bg-muted": getIsCurrentRoute("/portfolio/history"),
        })}
      >
        {getIsCurrentRoute("/portfolio/history") && (
          <div className="bg-green-caribbean size-2 rounded-full" />
        )}
        <span>History</span>
      </Link>

      <style jsx global>{`
        body {
          display: grid;
          grid-template:
            "header" var(--bar-height)
            "main" minmax(0, 1fr);
          overflow: hidden;
        }
      `}</style>
      <style jsx>{`
        main {
          display: grid;
          grid-area: main;
          grid-template-columns: 12rem minmax(0, 1fr);
          grid-template-rows: 1fr var(--history-table-height);
          grid-template-areas:
            "trade content"
            "trade tables";
        }

        .tables-section {
          grid-area: tables;
        }

        .portfolio-section {
          grid-area: trade;
        }

        .book-and-chart {
          display: grid;
          grid-area: content;
          grid-template-areas: "book chart";
          grid-template-columns: 20.5rem minmax(0, 1fr);
          grid-template-rows: var(--book-chart-height);
        }

        @media (max-height: 800px) {
          main {
            grid-template-rows: 50% 50%;
          }

          .book-and-chart {
            grid-template-rows: calc(50vh - var(--bar-height) + 38px);
          }
        }
      `}</style>
      <style global jsx>{`
        .market-chart-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height) * 2);
        }
        .book-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height));
        }

        @media (max-height: 800px) {
          :root {
            --history-table-content-height: calc(50vh - var(--bar-height) * 2);
          }
        }
      `}</style>
    </div>
  )
}
