import { useArgs } from "@storybook/preview-api"
import type { Meta, StoryObj } from "@storybook/react"

import { NumericInput } from "@/components/ui/numeric-input"

const meta = {
  title: "ui/numeric-input",
  component: NumericInput,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
  },
  decorators: [
    function Component(Story, ctx) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const [, setArgs] = useArgs<typeof ctx.args>()

      const onUserInput = (value: string) => {
        ctx.args.onUserInput?.(value)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setArgs({ value })
      }

      return <Story args={{ ...ctx.args, onUserInput }} />
    },
  ],
} satisfies Meta<typeof NumericInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <NumericInput {...args} />,
}
