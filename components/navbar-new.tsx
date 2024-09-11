export default function Navbar() {
  return (
    <div className="@container/sidebar hidden md:flex group flex-col min-h-screen sticky top-0 left-0 z-[100] transition-[width,opacity] ease-out duration-300 flex-none w-[88px]">
      <div className="flex flex-col flex-grow bg-background bg-contain bg-no-repeat bg-left-bottom text-white max-w-[240px] py-5 border-r border-foreground transition-all ease-out duration-300 flex-none w-[88px] group-hover:w-[240px] 3xl:w-[240px]">
        Navbar
      </div>
    </div>
  )
}
