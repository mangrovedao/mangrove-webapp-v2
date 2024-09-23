"use client"
import { useMenuStore } from "@/stores/menu.store"
import { EarnIcon, HelpIcon, RewardsIcon, SwapIcon, TradeIcon } from "@/svgs"
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from "@radix-ui/react-dialog"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import clsx from "clsx"
import Link from "next/link"

const MENUS = [
  {
    href: "/swap",
    icon: SwapIcon,
    text: "Swap",
  },
  {
    href: "/trade",
    icon: TradeIcon,
    text: "Trade",
  },
  {
    href: "/earn",
    icon: EarnIcon,
    text: "Earn",
  },
  {
    href: "/rewards",
    icon: RewardsIcon,
    text: "Rewards",
  },
]

export default function Sidebar() {
  return (
    <>
      <div
        className={clsx(
          "@container/sidebar hidden md:flex group flex-col min-h-screen fixed top-0 left-0 z-[100] transition-[width,opacity] ease-out duration-300 flex-none w-[88px]",
          "shadow-lg",
        )}
      >
        <div className="flex flex-col flex-grow bg-bg-secondary bg-contain bg-no-repeat bg-left-bottom text-white max-w-[240px] py-5 transition-all ease-out duration-300 flex-none w-[88px] group-hover:w-[240px] 3xl:w-[240px]">
          <div className="@container mb-8 px-[22px] py-3 flex justify-between relative overflow-hidden">
            <div className="overflow-hidden ml-1.5 w-[155px]">
              <Link href="/" className="relative flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="26"
                  fill="none"
                >
                  <path
                    fill="#00BF58"
                    d="M26.26 13.483c-1.557 0-2.979.607-4.12 1.62a10.195 10.195 0 00-3.01-1.532 5.42 5.42 0 001.558-1.692c1.62-.03 3.156-.586 4.318-1.732 1.421-1.403 1.953-3.367 1.703-5.361a7.597 7.597 0 00-.969-.057c-1.677 0-3.266.555-4.464 1.738-1.198 1.182-1.76 2.755-1.76 4.41A3.932 3.932 0 0116.76 13V9.294c1.166-1.167 1.88-2.663 1.88-4.313 0-1.984-1.026-3.747-2.636-4.981-1.61 1.229-2.635 2.992-2.635 4.981 0 1.65.713 3.151 1.875 4.313v3.727a3.955 3.955 0 01-2.85-2.123c0-1.66-.557-3.244-1.76-4.426C9.437 5.289 7.85 4.734 6.171 4.734c-.317 0-.64.016-.968.057-.256 1.994.276 3.958 1.703 5.361 1.156 1.141 2.687 1.697 4.307 1.732.401.69.948 1.27 1.589 1.712a10.17 10.17 0 00-2.938 1.506c-1.14-1.007-2.562-1.619-4.12-1.619-2.01 0-3.797 1.013-5.047 2.601 1.245 1.589 3.032 2.601 5.047 2.601 1.532 0 2.933-.586 4.063-1.568.042-.036.083-.077.125-.113a5.46 5.46 0 00.177-.17 8.704 8.704 0 015.13-2.21v3.362c-4.192.37-7.51 3.794-7.703 8.014h1.516c.156-3.418 2.812-6.143 6.193-6.508v6.472h1.516v-6.472c3.375.355 6.041 3.084 6.208 6.508h1.516c-.203-4.225-3.532-7.654-7.724-8.014V14.63c1.916.16 3.708.93 5.135 2.216.057.051.11.108.167.16l.13.123c1.13.976 2.531 1.567 4.063 1.567 2.01 0 3.797-1.012 5.047-2.6-1.245-1.589-3.032-2.601-5.047-2.601l.005-.01zm-3.916-5.952c.912-.9 1.995-1.198 2.89-1.28-.098 1.12-.536 2.102-1.296 2.842-.912.9-1.995 1.198-2.89 1.28.098-1.12.536-2.102 1.296-2.842zM14.88 4.98c0-1.049.396-2.061 1.12-2.92.734.864 1.12 1.861 1.12 2.92S16.724 7.041 16 7.9c-.734-.864-1.12-1.871-1.12-2.92zM7.974 9.093c-.76-.75-1.198-1.727-1.297-2.842.885.077 1.979.38 2.89 1.28.75.75 1.198 1.727 1.297 2.842-.885-.077-1.979-.38-2.89-1.28zM5.739 17.19c-1.068 0-2.088-.39-2.958-1.105.875-.725 1.896-1.105 2.958-1.105 1.063 0 2.089.39 2.959 1.105-.875.725-1.886 1.105-2.959 1.105zm20.517 0c-1.068 0-2.089-.39-2.959-1.105.875-.725 1.896-1.105 2.959-1.105 1.062 0 2.088.39 2.958 1.105-.875.725-1.885 1.105-2.958 1.105z"
                  ></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="155"
                  height="26"
                  fill="none"
                  className="absolute transition duration-300 ease-out md:opacity-0 group-hover:opacity-100 3xl:opacity-100 left-0 top-0 !opacity-100"
                >
                  <path
                    fill="#00BF58"
                    d="M26.26 13.483c-1.557 0-2.979.607-4.12 1.62a10.195 10.195 0 00-3.01-1.532 5.42 5.42 0 001.558-1.692c1.62-.03 3.156-.586 4.318-1.732 1.421-1.403 1.953-3.367 1.703-5.361a7.597 7.597 0 00-.969-.057c-1.677 0-3.266.555-4.464 1.738-1.198 1.182-1.76 2.755-1.76 4.41A3.932 3.932 0 0116.76 13V9.294c1.166-1.167 1.88-2.663 1.88-4.313 0-1.984-1.026-3.747-2.636-4.981-1.61 1.229-2.635 2.992-2.635 4.981 0 1.65.713 3.151 1.875 4.313v3.727a3.955 3.955 0 01-2.85-2.123c0-1.66-.557-3.244-1.76-4.426C9.437 5.289 7.85 4.734 6.171 4.734c-.317 0-.64.016-.968.057-.256 1.994.276 3.958 1.703 5.361 1.156 1.141 2.687 1.697 4.307 1.732.401.69.948 1.27 1.589 1.712a10.17 10.17 0 00-2.938 1.506c-1.14-1.007-2.562-1.619-4.12-1.619-2.01 0-3.797 1.013-5.047 2.601 1.245 1.589 3.032 2.601 5.047 2.601 1.532 0 2.933-.586 4.063-1.568.042-.036.083-.077.125-.113a5.46 5.46 0 00.177-.17 8.704 8.704 0 015.13-2.21v3.362c-4.192.37-7.51 3.794-7.703 8.014h1.516c.156-3.418 2.812-6.143 6.193-6.508v6.472h1.516v-6.472c3.375.355 6.041 3.084 6.208 6.508h1.516c-.203-4.225-3.532-7.654-7.724-8.014V14.63c1.916.16 3.708.93 5.135 2.216.057.051.11.108.167.16l.13.123c1.13.976 2.531 1.567 4.063 1.567 2.01 0 3.797-1.012 5.047-2.6-1.245-1.589-3.032-2.601-5.047-2.601l.005-.01zm-3.916-5.952c.912-.9 1.995-1.198 2.89-1.28-.098 1.12-.536 2.102-1.296 2.842-.912.9-1.995 1.198-2.89 1.28.098-1.12.536-2.102 1.296-2.842zM14.88 4.98c0-1.049.396-2.061 1.12-2.92.734.864 1.12 1.861 1.12 2.92S16.724 7.041 16 7.9c-.734-.864-1.12-1.871-1.12-2.92zM7.974 9.093c-.76-.75-1.198-1.727-1.297-2.842.885.077 1.979.38 2.89 1.28.75.75 1.198 1.727 1.297 2.842-.885-.077-1.979-.38-2.89-1.28zM5.739 17.19c-1.068 0-2.088-.39-2.958-1.105.875-.725 1.896-1.105 2.958-1.105 1.063 0 2.089.39 2.959 1.105-.875.725-1.886 1.105-2.959 1.105zm20.517 0c-1.068 0-2.089-.39-2.959-1.105.875-.725 1.896-1.105 2.959-1.105 1.062 0 2.088.39 2.958 1.105-.875.725-1.885 1.105-2.958 1.105z"
                  ></path>
                  <path
                    fill="#EEF5F6"
                    d="M56.781 7c1.513 0 2.727.484 3.648 1.446.937.937 1.403 2.228 1.403 3.885v7.4h-2.575v-6.988c0-1.076-.256-1.904-.77-2.496-.512-.592-1.214-.885-2.104-.885-.937 0-1.695.314-2.282.942-.586.627-.879 1.461-.879 2.506v6.916h-2.57v-6.942c0-1.06-.262-1.894-.785-2.506-.523-.612-1.23-.916-2.115-.916-.937 0-1.7.319-2.292.952-.592.633-.89 1.482-.89 2.537v6.875H42V7.35h2.523v1.79a4.153 4.153 0 011.565-1.564C46.758 7.19 47.506 7 48.333 7c.859.015 1.639.221 2.34.623.701.396 1.22.952 1.544 1.651.434-.69 1.063-1.24 1.88-1.651A5.827 5.827 0 0156.775 7h.005zm17.467 2.074V7.35h2.48v12.386h-2.48v-1.703c-1.136 1.332-2.57 2.001-4.303 2.001-1.827 0-3.329-.627-4.512-1.883-1.183-1.256-1.78-2.82-1.78-4.688 0-1.868.592-3.386 1.78-4.595 1.183-1.21 2.685-1.811 4.512-1.811 1.827 0 3.167.674 4.303 2.022v-.005zm-3.952 8.64c1.167 0 2.14-.407 2.92-1.22.765-.798 1.147-1.786 1.147-2.964s-.382-2.146-1.147-2.943c-.78-.808-1.753-1.215-2.92-1.215-1.168 0-2.178.407-2.92 1.215-.75.797-1.126 1.785-1.126 2.964 0 1.178.377 2.171 1.125 2.964.749.797 1.722 1.199 2.92 1.199zm11.734 2.022h-2.57V7.35h2.524v1.744a3.96 3.96 0 011.612-1.518c.701-.37 1.497-.55 2.381-.55 1.387 0 2.56.442 3.507 1.332.969.906 1.45 2.182 1.45 3.84v7.538h-2.596v-6.829c0-1.121-.272-1.986-.817-2.609-.544-.617-1.277-.931-2.198-.931-.968 0-1.753.334-2.371.998-.618.664-.927 1.529-.927 2.589v6.782h.006zm21.346-10.801V7.35h2.481v11.125c0 1.992-.623 3.576-1.869 4.755-1.251 1.178-2.9 1.77-4.957 1.77s-3.967-.592-5.637-1.77l1.12-1.956c1.387.983 2.879 1.472 4.465 1.472 1.324 0 2.376-.365 3.156-1.09.78-.726 1.167-1.673 1.167-2.841v-.896c-1.109 1.225-2.517 1.837-4.234 1.837-1.837 0-3.35-.602-4.533-1.816-1.183-1.21-1.78-2.727-1.78-4.549 0-1.822.618-3.334 1.848-4.528 1.236-1.21 2.759-1.811 4.58-1.811 1.67 0 3.062.627 4.187 1.883h.006zm-3.973 8.573c1.167 0 2.135-.391 2.9-1.174.764-.766 1.146-1.739 1.146-2.917 0-1.178-.382-2.166-1.146-2.918-.78-.767-1.743-1.147-2.9-1.147-1.157 0-2.099.39-2.879 1.173-.764.751-1.146 1.713-1.146 2.897 0 1.183.382 2.177 1.146 2.943.78.767 1.738 1.148 2.879 1.148v-.005zm11.761 2.228h-2.57V7.35h2.455v1.77c.748-1.395 1.942-2.094 3.58-2.094.529 0 1.031.072 1.497.205l-.23 2.46a3.962 3.962 0 00-1.377-.226c-1.015 0-1.827.334-2.434 1.008-.607.674-.911 1.647-.911 2.923v6.345l-.01-.005zm4.883-6.206c0-1.796.623-3.324 1.874-4.595 1.262-1.271 2.858-1.91 4.795-1.91 1.936 0 3.522.639 4.768 1.91 1.262 1.255 1.895 2.789 1.895 4.595 0 1.806-.628 3.386-1.895 4.647-1.235 1.255-2.821 1.883-4.768 1.883-1.947 0-3.528-.628-4.795-1.883-1.251-1.271-1.874-2.82-1.874-4.647zm10.736 0c0-1.132-.398-2.105-1.194-2.918-.764-.828-1.722-1.24-2.873-1.24-1.152 0-2.104.412-2.9 1.24-.78.813-1.167 1.786-1.167 2.918 0 1.132.392 2.13 1.167 2.943.796.813 1.759 1.22 2.9 1.22s2.093-.407 2.873-1.22c.796-.813 1.194-1.796 1.194-2.943zm9.118 2.665l3.601-8.85h2.826l-5.517 12.365h-1.868l-5.517-12.365h2.853l3.622 8.85zM155 13.299c0 .396-.031.802-.094 1.22h-9.846c.189.992.634 1.785 1.345 2.366.707.582 1.654.875 2.843.875.717 0 1.465-.124 2.256-.365.785-.247 1.46-.567 2.02-.968l1.073 1.863c-1.576 1.147-3.392 1.724-5.449 1.724-2.214 0-3.894-.633-5.04-1.91-1.147-1.276-1.717-2.804-1.717-4.595 0-1.79.591-3.411 1.774-4.62 1.199-1.225 2.753-1.837 4.653-1.837 1.9 0 3.303.56 4.439 1.677 1.136 1.117 1.732 2.66 1.732 4.575l.011-.005zm-6.171-4.07c-.968 0-1.79.298-2.471.884-.68.587-1.109 1.369-1.298 2.331h7.339c-.11-.967-.492-1.744-1.157-2.33-.665-.593-1.466-.886-2.418-.886h.005z"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="overflow-hidden overscroll-contain flex flex-col flex-1">
            <div className="@container flex flex-col flex-1">
              <div className="grid w-full overflow-hidden">
                {MENUS.map(({ href, icon: Icon, text }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center w-full gap-2 px-6 py-4 transition relative text-nav-item-button-icon-fg hover:text-nav-item-button-icon-fg-hover active:text-nav-item-button-icon-fg-active"
                  >
                    <span className="w-[39px] flex justify-center items-center">
                      <Icon />
                    </span>
                    <div className="opacity-0 @[120px]:opacity-100 transition ease-out duration-300 text-base">
                      {text}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="grid overflow-hidden mt-auto w-[239px]">
                <Link
                  href={"/help"}
                  className="flex items-center w-full gap-2 px-6 py-4 transition relative text-nav-item-button-icon-fg hover:text-nav-item-button-icon-fg-hover"
                >
                  <span className="w-[39px] flex justify-center items-center">
                    <HelpIcon />
                  </span>
                  <div className="opacity-0 @[120px]:opacity-100 transition ease-out duration-300 text-base">
                    Help
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileOverlay />
    </>
  )
}

export function MobileOverlay() {
  const { isOpen, toggle } = useMenuStore()

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogPortal>
        <DialogContent className="fixed inset-0 w-screen h-screen p-0 bg-background z-[99999]">
          <ScrollArea className="h-full w-full p-6">
            <nav>
              <div className="flex mb-4 justify-between">
                <Link href="/" className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="155"
                    height="26"
                    fill="none"
                  >
                    <path
                      fill="#00BF58"
                      d="M26.26 13.483c-1.557 0-2.979.607-4.12 1.62a10.195 10.195 0 00-3.01-1.532 5.42 5.42 0 001.558-1.692c1.62-.03 3.156-.586 4.318-1.732 1.421-1.403 1.953-3.367 1.703-5.361a7.597 7.597 0 00-.969-.057c-1.677 0-3.266.555-4.464 1.738-1.198 1.182-1.76 2.755-1.76 4.41A3.932 3.932 0 0116.76 13V9.294c1.166-1.167 1.88-2.663 1.88-4.313 0-1.984-1.026-3.747-2.636-4.981-1.61 1.229-2.635 2.992-2.635 4.981 0 1.65.713 3.151 1.875 4.313v3.727a3.955 3.955 0 01-2.85-2.123c0-1.66-.557-3.244-1.76-4.426C9.437 5.289 7.85 4.734 6.171 4.734c-.317 0-.64.016-.968.057-.256 1.994.276 3.958 1.703 5.361 1.156 1.141 2.687 1.697 4.307 1.732.401.69.948 1.27 1.589 1.712a10.17 10.17 0 00-2.938 1.506c-1.14-1.007-2.562-1.619-4.12-1.619-2.01 0-3.797 1.013-5.047 2.601 1.245 1.589 3.032 2.601 5.047 2.601 1.532 0 2.933-.586 4.063-1.568.042-.036.083-.077.125-.113a5.46 5.46 0 00.177-.17 8.704 8.704 0 015.13-2.21v3.362c-4.192.37-7.51 3.794-7.703 8.014h1.516c.156-3.418 2.812-6.143 6.193-6.508v6.472h1.516v-6.472c3.375.355 6.041 3.084 6.208 6.508h1.516c-.203-4.225-3.532-7.654-7.724-8.014V14.63c1.916.16 3.708.93 5.135 2.216.057.051.11.108.167.16l.13.123c1.13.976 2.531 1.567 4.063 1.567 2.01 0 3.797-1.012 5.047-2.6-1.245-1.589-3.032-2.601-5.047-2.601l.005-.01zm-3.916-5.952c.912-.9 1.995-1.198 2.89-1.28-.098 1.12-.536 2.102-1.296 2.842-.912.9-1.995 1.198-2.89 1.28.098-1.12.536-2.102 1.296-2.842zM14.88 4.98c0-1.049.396-2.061 1.12-2.92.734.864 1.12 1.861 1.12 2.92S16.724 7.041 16 7.9c-.734-.864-1.12-1.871-1.12-2.92zM7.974 9.093c-.76-.75-1.198-1.727-1.297-2.842.885.077 1.979.38 2.89 1.28.75.75 1.198 1.727 1.297 2.842-.885-.077-1.979-.38-2.89-1.28zM5.739 17.19c-1.068 0-2.088-.39-2.958-1.105.875-.725 1.896-1.105 2.958-1.105 1.063 0 2.089.39 2.959 1.105-.875.725-1.886 1.105-2.959 1.105zm20.517 0c-1.068 0-2.089-.39-2.959-1.105.875-.725 1.896-1.105 2.959-1.105 1.062 0 2.088.39 2.958 1.105-.875.725-1.885 1.105-2.958 1.105z"
                    ></path>
                    <path
                      fill="#EEF5F6"
                      d="M56.781 7c1.513 0 2.727.484 3.648 1.446.937.937 1.403 2.228 1.403 3.885v7.4h-2.575v-6.988c0-1.076-.256-1.904-.77-2.496-.512-.592-1.214-.885-2.104-.885-.937 0-1.695.314-2.282.942-.586.627-.879 1.461-.879 2.506v6.916h-2.57v-6.942c0-1.06-.262-1.894-.785-2.506-.523-.612-1.23-.916-2.115-.916-.937 0-1.7.319-2.292.952-.592.633-.89 1.482-.89 2.537v6.875H42V7.35h2.523v1.79a4.153 4.153 0 011.565-1.564C46.758 7.19 47.506 7 48.333 7c.859.015 1.639.221 2.34.623.701.396 1.22.952 1.544 1.651.434-.69 1.063-1.24 1.88-1.651A5.827 5.827 0 0156.775 7h.005zm17.467 2.074V7.35h2.48v12.386h-2.48v-1.703c-1.136 1.332-2.57 2.001-4.303 2.001-1.827 0-3.329-.627-4.512-1.883-1.183-1.256-1.78-2.82-1.78-4.688 0-1.868.592-3.386 1.78-4.595 1.183-1.21 2.685-1.811 4.512-1.811 1.827 0 3.167.674 4.303 2.022v-.005zm-3.952 8.64c1.167 0 2.14-.407 2.92-1.22.765-.798 1.147-1.786 1.147-2.964s-.382-2.146-1.147-2.943c-.78-.808-1.753-1.215-2.92-1.215-1.168 0-2.178.407-2.92 1.215-.75.797-1.126 1.785-1.126 2.964 0 1.178.377 2.171 1.125 2.964.749.797 1.722 1.199 2.92 1.199zm11.734 2.022h-2.57V7.35h2.524v1.744a3.96 3.96 0 011.612-1.518c.701-.37 1.497-.55 2.381-.55 1.387 0 2.56.442 3.507 1.332.969.906 1.45 2.182 1.45 3.84v7.538h-2.596v-6.829c0-1.121-.272-1.986-.817-2.609-.544-.617-1.277-.931-2.198-.931-.968 0-1.753.334-2.371.998-.618.664-.927 1.529-.927 2.589v6.782h.006zm21.346-10.801V7.35h2.481v11.125c0 1.992-.623 3.576-1.869 4.755-1.251 1.178-2.9 1.77-4.957 1.77s-3.967-.592-5.637-1.77l1.12-1.956c1.387.983 2.879 1.472 4.465 1.472 1.324 0 2.376-.365 3.156-1.09.78-.726 1.167-1.673 1.167-2.841v-.896c-1.109 1.225-2.517 1.837-4.234 1.837-1.837 0-3.35-.602-4.533-1.816-1.183-1.21-1.78-2.727-1.78-4.549 0-1.822.618-3.334 1.848-4.528 1.236-1.21 2.759-1.811 4.58-1.811 1.67 0 3.062.627 4.187 1.883h.006zm-3.973 8.573c1.167 0 2.135-.391 2.9-1.174.764-.766 1.146-1.739 1.146-2.917 0-1.178-.382-2.166-1.146-2.918-.78-.767-1.743-1.147-2.9-1.147-1.157 0-2.099.39-2.879 1.173-.764.751-1.146 1.713-1.146 2.897 0 1.183.382 2.177 1.146 2.943.78.767 1.738 1.148 2.879 1.148v-.005zm11.761 2.228h-2.57V7.35h2.455v1.77c.748-1.395 1.942-2.094 3.58-2.094.529 0 1.031.072 1.497.205l-.23 2.46a3.962 3.962 0 00-1.377-.226c-1.015 0-1.827.334-2.434 1.008-.607.674-.911 1.647-.911 2.923v6.345l-.01-.005zm4.883-6.206c0-1.796.623-3.324 1.874-4.595 1.262-1.271 2.858-1.91 4.795-1.91 1.936 0 3.522.639 4.768 1.91 1.262 1.255 1.895 2.789 1.895 4.595 0 1.806-.628 3.386-1.895 4.647-1.235 1.255-2.821 1.883-4.768 1.883-1.947 0-3.528-.628-4.795-1.883-1.251-1.271-1.874-2.82-1.874-4.647zm10.736 0c0-1.132-.398-2.105-1.194-2.918-.764-.828-1.722-1.24-2.873-1.24-1.152 0-2.104.412-2.9 1.24-.78.813-1.167 1.786-1.167 2.918 0 1.132.392 2.13 1.167 2.943.796.813 1.759 1.22 2.9 1.22s2.093-.407 2.873-1.22c.796-.813 1.194-1.796 1.194-2.943zm9.118 2.665l3.601-8.85h2.826l-5.517 12.365h-1.868l-5.517-12.365h2.853l3.622 8.85zM155 13.299c0 .396-.031.802-.094 1.22h-9.846c.189.992.634 1.785 1.345 2.366.707.582 1.654.875 2.843.875.717 0 1.465-.124 2.256-.365.785-.247 1.46-.567 2.02-.968l1.073 1.863c-1.576 1.147-3.392 1.724-5.449 1.724-2.214 0-3.894-.633-5.04-1.91-1.147-1.276-1.717-2.804-1.717-4.595 0-1.79.591-3.411 1.774-4.62 1.199-1.225 2.753-1.837 4.653-1.837 1.9 0 3.303.56 4.439 1.677 1.136 1.117 1.732 2.66 1.732 4.575l.011-.005zm-6.171-4.07c-.968 0-1.79.298-2.471.884-.68.587-1.109 1.369-1.298 2.331h7.339c-.11-.967-.492-1.744-1.157-2.33-.665-.593-1.466-.886-2.418-.886h.005z"
                    ></path>
                  </svg>
                </Link>
                <DialogTrigger asChild>
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      fill="none"
                    >
                      <path
                        stroke="#AECED4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.75"
                        d="M1 13.233l6.116-6.117m0 0L13.233 1M7.116 7.116L1 1m6.116 6.116l6.117 6.117"
                      ></path>
                    </svg>
                  </button>
                </DialogTrigger>
              </div>
              {MENUS.map(({ href, icon: Icon, text }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center w-full gap-2 py-3 transition relative text-nav-item-button-icon-fg hover:text-nav-item-button-icon-fg-hover active:text-nav-item-button-icon-fg-active"
                >
                  <span className="w-[39px] flex justify-center items-center">
                    <Icon />
                  </span>
                  <div className="text-base">{text}</div>
                </Link>
              ))}
              <Link
                href={"/help"}
                className="flex items-center w-full gap-2 pr-6 py-4 transition relative text-nav-item-button-icon-fg hover:text-nav-item-button-icon-fg-hover"
              >
                <span className="w-[39px] flex justify-center items-center">
                  <HelpIcon />
                </span>
                <div className="text-base">Help</div>
              </Link>
            </nav>
          </ScrollArea>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
