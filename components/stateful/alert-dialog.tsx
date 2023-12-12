/* eslint-disable @next/next/no-img-element */
import * as Root from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAlertDialogStore } from "@/stores/alert-dialog.store"
import { Check, ExclamationMark } from "@/svgs"
import { cn } from "@/utils"

function AlertDialogIcon({
  type,
}: {
  type: "error" | "success" | "info" | "confirm" | undefined
}) {
  return (
    <>
      <div className="w-full flex justify-center mb-8">
        <div
          className={cn(
            "w-16 aspect-square rounded-lg flex items-center justify-center",
            {
              "bg-red-500 text-red-100": type === "error",
              "bg-primary-dark-green text-green-caribbean": type === "success",
            },
          )}
        >
          {type === "error" ? <ExclamationMark /> : <Check />}
        </div>
      </div>

      <img
        src={`/assets/illustrations/${type}-chameleon.webp`}
        alt="red chameleon illustration"
        className="absolute top-1 left-0 w-1/2 aspect-auto -translate-y-3/4"
      />
    </>
  )
}

// TODO: handle all types "Success" "Warning" "Info"
export function AlertDialog() {
  const { opened, setOpened, title, children, actionButtons, type } =
    useAlertDialogStore()
  return (
    <Root.AlertDialog open={opened} onOpenChange={setOpened}>
      <div className="w-full h-full relative">
        <Root.AlertDialogContent
          className={cn("p-8 max-w-md", {
            "border-red-500 border-2 !shadow-error": type === "error",
            "border-primary-dark-green border-2 !shadow-success":
              type === "success",
          })}
        >
          <Root.AlertDialogHeader>
            <AlertDialogIcon type={type} />
            <Root.AlertDialogTitle className="text-center text-2xl font-medium">
              {title}
            </Root.AlertDialogTitle>
            <Root.AlertDialogDescription className="text-center text-sm font-normal !mt-4">
              {children}
            </Root.AlertDialogDescription>
          </Root.AlertDialogHeader>
          <Root.AlertDialogFooter className="mt-8">
            <div className="flex space-x-2 w-full">
              {actionButtons?.map(({ isClosing, ...props }, i) => {
                if (isClosing) {
                  return (
                    <Root.AlertDialogCancel key={i} asChild>
                      <Button {...props} variant={"tertiary"}>
                        Close
                      </Button>
                    </Root.AlertDialogCancel>
                  )
                }
                return <Button key={i} size={"lg"} rightIcon {...props} />
              })}
            </div>
          </Root.AlertDialogFooter>
        </Root.AlertDialogContent>
      </div>
    </Root.AlertDialog>
  )
}
