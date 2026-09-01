"use client"

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
    { label: 'Featured / Default', value: '' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Rating: High to Low', value: 'rating-desc' },
    { label: 'Title: A to Z', value: 'title-asc' },
    { label: 'Title: Z to A', value: 'title-desc' },
]

export default function SortDropdown() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentSort = searchParams.get('sortBy') || ''
    const currentOrder = searchParams.get('order') || ''
    const activeValue = currentSort ? `${currentSort}-${currentOrder}` : ''

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            const [sortBy, order] = value.split('-')
            params.set('sortBy', sortBy)
            params.set('order', order)
        } else {
            params.delete('sortBy')
            params.delete('order')
        }
        params.set('page', '1') // reset to page 1 on sort change

        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-medium text-gray-500 whitespace-nowrap">
                Sort by:
            </label>
            <select
                id="sort-select"
                value={activeValue}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-xs text-gray-700 font-medium focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-2xs"
            >
                {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
