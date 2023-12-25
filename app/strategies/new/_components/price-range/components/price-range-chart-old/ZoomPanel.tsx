import React from "react";
import clsx from "clsx";

function ZoomButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={clsx(
        "p-[6px] rounded-[6px] bg-[#1B1F2F] flex items-center justify-center hover:opacity-80 active:opacity-90 transition-opacity",
        className
      )}
      {...props}
    >
      {props.children}
    </button>
  );
}

type Props = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  showReset: boolean;
  topRightElements?: JSX.Element;
};

export default function ZoomPanel({
  zoomIn,
  zoomOut,
  reset,
  showReset,
  topRightElements,
}: Props) {
  return (
    <div className="top-2 left-2 space-x-1 flex items-center">
      {topRightElements || (
        <>
          {showReset && (
            <ZoomButton onClick={reset} className="text-xs">
              Reset
            </ZoomButton>
          )}
          <ZoomButton onClick={zoomIn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="none"
            >
              <path
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 2.5v7M2.5 6h7"
              ></path>
            </svg>
          </ZoomButton>
          <ZoomButton onClick={zoomOut}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="none"
            >
              <path
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.5 6h7"
              ></path>
            </svg>
          </ZoomButton>
        </>
      )}
    </div>
  );
}
