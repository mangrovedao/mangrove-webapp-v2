const fs = require("fs")
const manifest = require("cryptocurrency-icons/manifest.json")

function copyIcons() {
  fs.cpSync(
    "./node_modules/cryptocurrency-icons/svg",
    "./public/cryptocurrency-icons/svg",
    { recursive: true },
  )
  // TODO: to remove after working on a generic mapping
  fs.copyFileSync(
    "./node_modules/cryptocurrency-icons/svg/color/eth.svg",
    "./public/cryptocurrency-icons/svg/color/weth.svg",
  )
  fs.copyFileSync(
    "./node_modules/cryptocurrency-icons/svg/color/matic.svg",
    "./public/cryptocurrency-icons/svg/color/wmatic.svg",
  )
  fs.copyFileSync(
    "./public/custom-token-icons/blast/usdb.svg",
    "./public/cryptocurrency-icons/svg/color/usdb.svg",
  )
  fs.copyFileSync(
    "./public/custom-token-icons/blast/usde.svg",
    "./public/cryptocurrency-icons/svg/color/usde.svg",
  )
}

function genetareDicFromManifestFile() {
  const dic = Object.assign(
    {},
    ...manifest.map(({ symbol, color, name }) => ({
      [symbol]: { color, name, symbol },
    })),
    // TODO: to remove after working on a generic mapping
    { WETH: { color: "#627eea", name: "Wrapped Ethereum", symbol: "WETH" } },
    { WMATIC: { color: "#7F44E0", name: "Wrapped MATIC", symbol: "WMATIC" } },
    { USDB: { color: "#FCFC01", name: "USDB", symbol: "USDB" } },
    { USDe: { color: "#FFFFFF", name: "USDe", symbol: "USDe" } },
  )
  fs.mkdirSync("./generated", { recursive: true })
  fs.writeFileSync("./generated/icons.json", JSON.stringify(dic))
}

;(() => {
  copyIcons()
  genetareDicFromManifestFile()
})()
