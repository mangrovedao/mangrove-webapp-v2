import { buildChartTheme, darkTheme } from "@visx/xychart"

const borderVar = "hsl(var(--border), .3)"
const borderWidthVar = "var(--border-width)"
const greenColorVar = "hsl(var(--color-green-caribbean))"
const redColorVar = "hsl(var(--color-red-100))"
const crosshairStyle = {
  strokeWidth: 1,
  strokeDasharray: "5 5",
  opacity: 0.7,
} as React.SVGProps<SVGLineElement>

const theme = buildChartTheme({
  ...darkTheme,
  colors: [greenColorVar, redColorVar, "white"],
  tickLength: 0,
  gridColor: borderVar,
  gridColorDark: borderVar,
})

export {
  borderVar,
  borderWidthVar,
  crosshairStyle,
  greenColorVar,
  redColorVar,
  theme,
}
