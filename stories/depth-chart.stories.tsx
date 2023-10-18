import type { Meta, StoryObj } from "@storybook/react"

import DepthChart from "@/components/ui/depth-chart"

const meta = {
  title: "ui/depth-chart",
  component: DepthChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DepthChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <DepthChart {...args} />,
}
