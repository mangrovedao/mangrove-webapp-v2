import * as Root from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAlertDialogStore } from "@/stores/alert-dialog.store"

// TODO: handle all types "Success" "Error" "Warning" "Info"
export function AlertDialog() {
  const { opened, setOpened, title, children, actionButtons } =
    useAlertDialogStore()
  return (
    <Root.AlertDialog open={opened} onOpenChange={setOpened}>
      <Root.AlertDialogContent>
        <Root.AlertDialogHeader>
          <Root.AlertDialogTitle>{title}</Root.AlertDialogTitle>
          <Root.AlertDialogDescription>{children}</Root.AlertDialogDescription>
        </Root.AlertDialogHeader>
        <Root.AlertDialogFooter>
          <div className="flex space-x-2 justify-end">
            {actionButtons?.map(({ isClosing, ...props }, i) => {
              if (isClosing) {
                return (
                  <Root.AlertDialogCancel key={i} asChild>
                    <Button {...props} variant={"outline"}>
                      Close
                    </Button>
                  </Root.AlertDialogCancel>
                )
              }
              return <Button key={i} {...props} />
            })}
          </div>
        </Root.AlertDialogFooter>
      </Root.AlertDialogContent>
    </Root.AlertDialog>
  )
}
