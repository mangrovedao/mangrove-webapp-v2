import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"

import { createColumnHelper } from "@tanstack/react-table"
import React from "react"
import { useAccount } from "wagmi"
import { LeaderboardRow } from "@/app/rewards/types"
import { Value, ValueLeft } from "../components/value"
import { Text } from "@/components/typography/text"
import { shortenAddress } from "@/utils/wallet"
import { formatNumber } from "@/utils/numbers"

const columnHelper = createColumnHelper<LeaderboardRow>()
const DEFAULT_DATA: LeaderboardRow[] = []

type Params = {
    data?: LeaderboardRow[]
    pageSize: number
}

export function useLeaderboardTable({ pageSize, data }: Params) {
    const { address: user } = useAccount()

    const columns = React.useMemo(
        () => [
            // columnHelper.display({
            //     header: "Rank",
            //     cell: ({ row }) => {
            //         const rank = row.original.rank

            //         switch (rank) {
            //             case 1:
            //                 return (
            //                     <div className="bg-[#BD8800] border-2 border-[#E5C675] mx-auto w-6 h-6 rounded-full text-center flex">
            //                         <p className="my-auto mx-auto">1</p>
            //                     </div>
            //                 )
            //             case 2:
            //                 return (
            //                     <div className="bg-[#626A6A] border-2 flex border-[#959D9D] mx-auto w-6 h-6 rounded-full text-center">
            //                         <p className="my-auto mx-auto">2</p>
            //                     </div>
            //                 )

            //             case 3:
            //                 return (
            //                     <div className="bg-[#804915] border-2 flex border-[#E09A59] mx-auto w-6 h-6 rounded-full text-center">
            //                         <p className="my-auto mx-auto">3</p>
            //                     </div>
            //                 )
            //             default:
            //                 return <Value value={rank?.toString() ?? "???"} />
            //         }
            //     },
            // }),
            columnHelper.display({
                header: "Address",
                cell: ({ row }) => {
                    const { user: address } = row.original

                    if (user?.toLowerCase() === address.toLowerCase()) {
                        // Add a special style for the user's address
                        return (
                            <div className="flex gap-4">
                                <ValueLeft value={shortenAddress(address)} />
                                <Text
                                    variant={"text1"}
                                    className="flex justify-center font-light items-center p-2 h-7 rounded-sm bg-bg-primary"
                                >
                                    You're position
                                </Text>
                            </div>
                        )
                    }
                    return <ValueLeft value={shortenAddress(address)} />
                },
            }),

            columnHelper.display({
                header: "Rewards",
                cell: ({ row }) => {
                    const { rewards } = row.original
                    return <Value value={formatNumber(rewards ?? 0)} />
                },
            }),


        ],
        [user],
    )

    return useReactTable({
        data: data ?? DEFAULT_DATA,
        columns,
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize,
            },
        },
        enableRowSelection: false,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })
}