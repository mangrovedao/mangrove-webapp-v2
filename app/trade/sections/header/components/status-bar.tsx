export default function StatusBar() {
  return (
    <div className="flex self-center w-full space-x-5  whitespace-nowrap">
      <div className="grid text-md">
        <span>1 234.12</span>{" "}
        <span className="text-muted-foreground">$1 234.12</span>
      </div>
      <div className="grid text-xs ">
        <span className="text-muted-foreground">24h change</span>{" "}
        <span>21.36 +0.2%</span>
      </div>
      <div className="grid text-xs ">
        <span className="text-muted-foreground">24h high</span>{" "}
        <span>1 234.12</span>
      </div>
      <div className="grid text-xs ">
        <span className="text-muted-foreground">24h low</span>{" "}
        <span>1 234.12</span>
      </div>
      <div className="grid text-xs ">
        <span className="text-muted-foreground">24h volume (ETH)</span>
        <span>123 456.12</span>
      </div>
      <div className="grid text-xs ">
        <span className="text-muted-foreground">24h volume (USDC)</span>
        <span>123 456.12</span>
      </div>
    </div>
  )
}
