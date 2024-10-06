/* eslint-disable @next/next/no-img-element */
import { Heading } from "@/components/dialogs/heading"
import {
  descriptionClasses,
  footerClasses,
  getContentClasses,
  titleClasses,
} from "@/components/dialogs/styles"
import * as Root from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button-old"
import { useAlertDialogStore } from "@/stores/alert-dialog.store"

export function AlertDialog() {
  const { opened, setOpened, title, children, actionButtons, type } =
    useAlertDialogStore()
  return (
    <Root.AlertDialog open={opened} onOpenChange={setOpened}>
      <div className="w-full h-full relative">
        <Root.AlertDialogContent className={getContentClasses(type)}>
          <Root.AlertDialogHeader>
            <Heading type={type} />
            <Root.AlertDialogTitle className={titleClasses}>
              {title}
            </Root.AlertDialogTitle>
            <Root.AlertDialogDescription className={descriptionClasses}>
              {children}
            </Root.AlertDialogDescription>
          </Root.AlertDialogHeader>
          <Root.AlertDialogFooter className={footerClasses}>
            {actionButtons?.map(({ isClosing, id, ...props }) => {
              if (isClosing) {
                return (
                  <Root.AlertDialogCancel key={id} asChild>
                    <Button {...props} variant={"tertiary"}>
                      Close
                    </Button>
                  </Root.AlertDialogCancel>
                )
              }
              return <Button key={id} size={"lg"} aria-label={id} {...props} />
            })}
          </Root.AlertDialogFooter>
        </Root.AlertDialogContent>
      </div>
    </Root.AlertDialog>
  )
}
