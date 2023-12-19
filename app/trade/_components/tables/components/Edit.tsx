import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

type EditProps = {
  open: boolean
  onChange: (value: boolean) => void
}

export default function Edit({ open, onChange }: EditProps) {
  return (
    <div>
      <Drawer open={open} onOpenChange={onChange}>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you sure absolutely sure?</DrawerTitle>
            <DrawerDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <div className="">
              <Button variant={"primary"}>Save</Button>
              <Button variant={"secondary"} onClick={() => onChange(false)}>
                Cancel
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
