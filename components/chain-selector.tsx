import Dialog from "@/components/dialogs/dialog"
import {
  provideRainbowKitChains,
  RainbowKitChain,
} from "@/utils/provideRainbowKitChains"
import { ChevronDown } from "lucide-react"
import React from "react"
import { useChainId, useChains, useSwitchChain } from "wagmi"
import { Button } from "./ui/button"
import { ImageWithHideOnError } from "./ui/image-with-hide-on-error"

export type AsyncImageSrc = () => Promise<string>

const cachedUrls = new Map<AsyncImageSrc, string>()
// Store requests in a cache so we don't fetch the same image twice
const cachedRequestPromises = new Map<AsyncImageSrc, Promise<string | void>>()

function useForceUpdate() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  return forceUpdate
}

async function loadAsyncImage(asyncImage: () => Promise<string>) {
  const cachedRequestPromise = cachedRequestPromises.get(asyncImage)

  // Don't fetch if we already have a request in progress / completed
  if (cachedRequestPromise) {
    return cachedRequestPromise
  }

  const load = async () =>
    asyncImage().then(async (url: string) => {
      // Uncomment to simulate slow image loading:
      // await new Promise(resolve =>
      //   setTimeout(resolve, 2000 + Math.random() * 1000)
      // );

      // Uncomment to simulate random failure:
      // if (Math.random() > 0.25) {
      //   throw new Error();
      // }

      cachedUrls.set(asyncImage, url)

      return url
    })

  const requestPromise = load().catch((_err) => {
    // Retry once if the request failed
    return load().catch((_err) => {
      // Ignore failed retry, remove failed request from
      // promise cache so next request can try again
      cachedRequestPromises.delete(asyncImage)
    })
  })

  cachedRequestPromises.set(asyncImage, requestPromise)

  return requestPromise
}

export function useAsyncImage(
  url?: string | AsyncImageSrc,
): string | undefined {
  const cachedUrl = typeof url === "function" ? cachedUrls.get(url) : undefined
  const forceUpdate = useForceUpdate()

  React.useEffect(() => {
    if (typeof url === "function" && !cachedUrl) {
      loadAsyncImage(url).then(forceUpdate)
    }
  }, [url, cachedUrl, forceUpdate])

  return typeof url === "function" ? cachedUrl : url
}

function AsyncImage(props: React.ComponentProps<"img">) {
  const src = useAsyncImage(props.src)
  return <img {...props} src={src} />
}

export default function ChainSelector() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const chains = useChains()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const chain = chains.find((c) => c.id === chainId)
  const rainbowkitChains: RainbowKitChain[] = provideRainbowKitChains(chains)

  console.log(rainbowkitChains)

  function openDialog() {
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
  }

  return (
    <>
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <Dialog.Description>
          {rainbowkitChains.map(({ id, name, iconUrl }) => (
            <div key={id}>
              {iconUrl ? <AsyncImage src={iconUrl} /> : undefined}
              <span>{name}</span>
            </div>
          ))}
        </Dialog.Description>
      </Dialog>
      <Button
        variant="invisible"
        className="!space-x-4 lg:flex items-center hidden"
        size="sm"
        onClick={openDialog}
      >
        <span className="flex space-x-2">
          <ImageWithHideOnError
            src={`/assets/chains/${chainId}.webp`}
            width={16}
            height={16}
            className="h-4 rounded-sm"
            key={chainId}
            alt={`${chain?.name}-logo`}
          />
          <span className="text-sm whitespace-nowrap">{chain?.name}</span>
        </span>
        <div className="pl-2">
          <ChevronDown className="w-3" />
        </div>
      </Button>
    </>
  )
}
