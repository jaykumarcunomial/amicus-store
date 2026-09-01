"use client"

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    limit: number
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    limit,
}: PaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    if (totalPages <= 1) return null

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(newPage))
        router.replace(`${pathname}?${params.toString()}`, { scroll: true })
    }

    const startItem = Math.min((currentPage - 1) * limit + 1, totalItems)
    const endItem = Math.min(currentPage * limit, totalItems)

    return (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
                <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalItems}</span> products
            </p>

            <div className="flex items-center gap-1.5">
                {/* Prev Button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeftIcon className="size-4" />
                    <span>Prev</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((p, idx, arr) => {
                            const prev = arr[idx - 1]
                            const showEllipsis = prev && p - prev > 1

                            return (
                                <span key={p} className="flex items-center">
                                    {showEllipsis && (
                                        <span className="px-1 text-xs text-gray-400">...</span>
                                    )}
                                    <button
                                        onClick={() => handlePageChange(p)}
                                        className={`size-8 rounded-lg text-xs font-semibold transition-colors ${
                                            currentPage === p
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                </span>
                            )
                        })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <span>Next</span>
                    <ChevronRightIcon className="size-4" />
                </button>
            </div>
        </div>
    )
}
