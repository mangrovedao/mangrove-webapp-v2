import React, { useId } from "react"

import { cn } from "@/utils"

export type IconType =
  | "lock"
  | "success"
  | "cross"
  | "arrowUp"
  | "spinner"
  | "exclamationMark"

type Props = {
  iconType?: IconType
} & React.ComponentProps<"svg">

function SpinnerPath({
  id,
  ...props
}: React.ComponentProps<"path"> & { id: string }) {
  return (
    <path
      stroke={`url(#${id})`}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6"
      d="M50.5 91.5C27.58 91.5 9 72.92 9 50S27.58 8.5 50.5 8.5"
      {...props}
    ></path>
  )
}

function LockPath(props: React.ComponentProps<"path">) {
  return (
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6"
      d="M61.083 48.417H38.917a3.167 3.167 0 00-3.167 3.166v11.084a3.167 3.167 0 003.167 3.166h22.166a3.167 3.167 0 003.167-3.166V51.583a3.167 3.167 0 00-3.167-3.166zm-19 0v-6.334A7.917 7.917 0 0157.758 40.5"
      {...props}
    ></path>
  )
}

function ArrowUpPath(props: React.ComponentProps<"path">) {
  return (
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6"
      d="M66.667 50L50 33.333 33.333 50M50 66.667V33.333"
      {...props}
    ></path>
  )
}
function SuccessPath(props: React.ComponentProps<"path">) {
  return (
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6"
      d="M67 39L44.312 61.688 34 51.374"
      {...props}
    ></path>
  )
}
function ExclamationMarkPath(props: React.ComponentProps<"path">) {
  return (
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="6"
      d="M50.003 91.667c23.011 0 41.666-18.655 41.666-41.667S73.015 8.334 50.003 8.334C26.99 8.334 8.336 26.988 8.336 50c0 23.012 18.655 41.667 41.667 41.667zM50 34v16m0 16h.04"
      {...props}
    ></path>
  )
}

export function Spinner({
  iconType = "spinner",
  className = "h-12 w-12",
  ...props
}: Props) {
  const id = useId()
  const gradientId = `spinnerGradient-${id}`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 100 100"
      {...props}
      className={cn(className, { "animate-spin": iconType === "spinner" })}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
        d="M50 91.5c22.92 0 41.5-18.58 41.5-41.5S72.92 8.5 50 8.5 8.5 27.08 8.5 50 27.08 91.5 50 91.5z"
        className={cn("transition-opacity", {
          "opacity-5": iconType === "spinner",
        })}
      ></path>
      <LockPath
        className={cn("transition-all scale-100", {
          "opacity-0 scale-110": iconType !== "lock",
        })}
      />
      <ArrowUpPath
        className={cn("transition-all scale-100", {
          "opacity-0 scale-110": iconType !== "arrowUp",
        })}
      />
      <SuccessPath
        className={cn("transition-all scale-100", {
          "opacity-0 scale-110": iconType !== "success",
        })}
      />
      <ExclamationMarkPath
        className={cn("transition-all scale-100", {
          "opacity-0 scale-110": iconType !== "exclamationMark",
        })}
      />
      <SpinnerPath
        id={gradientId}
        className={cn("transition-opacity", {
          "opacity-0": iconType !== "spinner",
        })}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="51.25"
          x2="51.25"
          y1="7.75"
          y2="91.75"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor"></stop>
          <stop offset="1" stopColor="currentColor" stopOpacity="0"></stop>
        </linearGradient>
      </defs>
    </svg>
  )
}
