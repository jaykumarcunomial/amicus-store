"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface ProductItem {
    id: number
    title: string
    price: number
    discountPercentage?: number
    rating?: number
    stock?: number
    brand?: string
    category?: string
    thumbnail?: string
    images?: string[]
    description?: string
    dimensions?: {
        width?: number
        height?: number
        depth?: number
    }
    weight?: number
    warrantyInformation?: string
    shippingInformation?: string
    returnPolicy?: string
    sku?: string
    tags?: string[]
    reviews?: {
        rating: number
        comment: string
        date: string
        reviewerName: string
    }[]
}

interface CompareContextType {
    compareList: ProductItem[]
    addToCompare: (product: ProductItem) => { success: boolean; message?: string }
    removeFromCompare: (productId: number) => void
    isInCompare: (productId: number) => boolean
    clearCompare: () => void
}

const STORAGE_KEY = 'dummyjson_compare_products'
const MAX_COMPARE = 3

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<ProductItem[]>([])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                setCompareList(JSON.parse(saved))
            } catch {
                localStorage.removeItem(STORAGE_KEY)
            }
        }
    }, [])

    const saveList = useCallback((list: ProductItem[]) => {
        setCompareList(list)
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
        }
    }, [])

    const addToCompare = useCallback(
        (product: ProductItem): { success: boolean; message?: string } => {
            if (compareList.some((p) => p.id === product.id)) {
                return { success: false, message: 'Product is already in compare list' }
            }
            if (compareList.length >= MAX_COMPARE) {
                return {
                    success: false,
                    message: `You can only compare up to ${MAX_COMPARE} products at once.`,
                }
            }
            const updated = [...compareList, product]
            saveList(updated)
            return { success: true }
        },
        [compareList, saveList]
    )

    const removeFromCompare = useCallback(
        (productId: number) => {
            const updated = compareList.filter((p) => p.id !== productId)
            saveList(updated)
        },
        [compareList, saveList]
    )

    const isInCompare = useCallback(
        (productId: number) => compareList.some((p) => p.id === productId),
        [compareList]
    )

    const clearCompare = useCallback(() => {
        saveList([])
    }, [saveList])

    return (
        <CompareContext.Provider
            value={{
                compareList,
                addToCompare,
                removeFromCompare,
                isInCompare,
                clearCompare,
            }}
        >
            {children}
        </CompareContext.Provider>
    )
}

export function useCompare(): CompareContextType {
    const context = useContext(CompareContext)
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider')
    }
    return context
}
