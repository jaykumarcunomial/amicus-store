"use client"

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export interface SortOption {
    label: string
    value: string
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
    { label: 'Featured / Default', value: '' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Rating: High to Low', value: 'rating-desc' },
    { label: 'Title: A to Z', value: 'title-asc' },
    { label: 'Title: Z to A', value: 'title-desc' },
]

export interface SortDropdownProps {
    options?: SortOption[]
    value?: string
    onChange?: (value: string) => void
    label?: string
    id?: string
    className?: string
}

export default function SortDropdown({
    options = DEFAULT_SORT_OPTIONS,
    value,
    onChange,
    label = 'Sort by:',
    id = 'sort-select',
    className = '',
}: SortDropdownProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Determine current sort value: controlled prop takes precedence, otherwise fallback to URL search params
    const currentSort = searchParams.get('sortBy') || ''
    const currentOrder = searchParams.get('order') || ''
    const urlValue = currentSort ? `${currentSort}-${currentOrder}` : ''
    const activeValue = value !== undefined ? value : urlValue

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value

        if (onChange) {
            onChange(newValue)
            return
        }

        // Default URL navigation behavior
        const params = new URLSearchParams(searchParams.toString())

        if (newValue) {
            const [sortBy, order] = newValue.split('-')
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
        <div className={`flex items-center gap-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    {label}
                </label>
            )}
            <select
                id={id}
                value={activeValue}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-xs text-gray-700 font-medium focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer shadow-2xs"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
