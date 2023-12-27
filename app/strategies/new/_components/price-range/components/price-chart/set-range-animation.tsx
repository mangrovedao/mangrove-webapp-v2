import { MousePointer, MousePointerClick } from "lucide-react"
import React from "react"

export function SetRangeAnimation() {
  const [stage, setStage] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStage((prevStage) => (prevStage + 1) % 3)
    }, 1000) // Change stage every 1 second

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className={`cursor-animation stage-${stage}`}>
      <MousePointer className="mouse-pointer" />
      <MousePointerClick className="mouse-pointer-click" />
      <style global jsx>{`
        .cursor-animation {
          position: relative;
          animation: moveRight 3s ease-in-out infinite;
        }

        .mouse-pointer,
        .mouse-pointer-click {
          position: absolute;
          transition: opacity 0.5s;
        }

        .mouse-pointer {
          opacity: 1;
        }

        .mouse-pointer-click {
          opacity: 0;
        }

        .cursor-animation.stage-1 .mouse-pointer,
        .cursor-animation.stage-2 .mouse-pointer-click {
          opacity: 0;
        }

        .cursor-animation.stage-1 .mouse-pointer-click,
        .cursor-animation.stage-2 .mouse-pointer {
          opacity: 1;
        }

        @keyframes moveRight {
          0% {
            transform: translateX(0);
          }
          33% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(50%); /* Adjust as needed */
          }
        }
      `}</style>
    </div>
  )
}
