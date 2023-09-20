import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDialogStore } from "@/stores/dialog.store"
import { Button } from "@components/ui/button"

// TODO: handle all types "Success" "Error" "Warning" "Info"
export default function ChangeNetworkDialog() {
  const { opened, setOpened, title, description, children, actionButtons } =
    useDialogStore()
  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : undefined}
        </DialogHeader>
        {children}
        <div className="flex space-x-2 justify-end">
          {actionButtons?.map(({ isClosing, ...props }, i) => {
            if (isClosing) {
              return (
                <DialogClose key={i}>
                  <Button {...props} variant={"outline"}>
                    Close
                  </Button>
                </DialogClose>
              )
            }
            return <Button key={i} {...props} />
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
