import * as Root from "@/components/ui/dialog"
import { useDialogStore } from "@/stores/dialog.store"
import { Button } from "@components/ui/button"

// TODO: handle all types "Success" "Error" "Warning" "Info"
export function Dialog() {
  const { opened, setOpened, title, description, children, actionButtons } =
    useDialogStore()
  return (
    <Root.Dialog open={opened} onOpenChange={setOpened}>
      <Root.DialogContent>
        <Root.DialogHeader>
          <Root.DialogTitle>{title}</Root.DialogTitle>
          {description ? (
            <Root.DialogDescription>{description}</Root.DialogDescription>
          ) : undefined}
        </Root.DialogHeader>
        {children}
        <div className="flex space-x-2 justify-end">
          {actionButtons?.map(({ isClosing, ...props }, i) => {
            if (isClosing) {
              return (
                <Root.DialogClose key={i}>
                  <Button {...props} variant={"outline"}>
                    Close
                  </Button>
                </Root.DialogClose>
              )
            }
            return <Button key={i} {...props} />
          })}
        </div>
      </Root.DialogContent>
    </Root.Dialog>
  )
}
