type Tweet = Database["public"]["Tables"]["tweets"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

type PageDetails = {
  page: number
  pageSize: number
}

declare global {
  type PageDetails = PageDetails
}
