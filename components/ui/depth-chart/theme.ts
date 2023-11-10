import { buildChartTheme, darkTheme } from "@visx/xychart"

const borderVar = "hsl(var(--border))"
const borderWidthVar = "var(--border-width)"
const greenColorVar = "var(--color-green)"
const redColorVar = "var(--color-red)"
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
