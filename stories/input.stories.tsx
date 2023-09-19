import { Input } from "@/components/ui/input"
import type { Meta, StoryObj } from "@storybook/react"

const meta = {
  title: "ui/input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <Input {...args} />,
}
