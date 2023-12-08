/* eslint-disable @next/next/no-img-element */
import * as Root from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAlertDialogStore } from "@/stores/alert-dialog.store"
import { ExclamationMark } from "@/svgs"
import { cn } from "@/utils"

// TODO: handle all types "Success" "Warning" "Info"
export function AlertDialog() {
  const { opened, setOpened, title, children, actionButtons, type } =
    useAlertDialogStore()
  return (
    <Root.AlertDialog open={opened} onOpenChange={setOpened}>
      <div className="w-full h-full relative">
        <Root.AlertDialogContent
          className={cn("p-8 max-w-md", {
            "border-red-500 border-2 error-shadow": type === "error",
          })}
        >
          <Root.AlertDialogHeader>
            {type === "error" ? (
              <>
                <div className="w-full flex justify-center mb-8">
                  <div className="w-16 aspect-square bg-red-500 text-red-100 rounded-lg flex items-center justify-center">
                    <ExclamationMark />
                  </div>
                </div>
                <img
                  src="/assets/illustrations/error-chameleon.webp"
                  alt="red chameleon illustration"
                  className="absolute top-1 left-0 w-1/3 aspect-auto -translate-y-3/4"
                />
              </>
            ) : undefined}
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
