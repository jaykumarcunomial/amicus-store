"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ProductItem } from './CompareContext'
import { addCartApi, updateCartApi, deleteCartApi } from '../actions'
import { useAuth } from './AuthContext'

export interface CartItem {
    id: number
    title: string
    price: number
    discountPercentage?: number
    thumbnail: string
    quantity: number
    stock?: number
}

interface CartContextType {
    cartItems: CartItem[]
    totalItems: number
    subtotal: number
    totalDiscount: number
    totalPrice: number
    cartId: number | null
    isDrawerOpen: boolean
    setIsDrawerOpen: (open: boolean) => void
    addToCart: (product: ProductItem, quantity?: number) => Promise<{ success: boolean; message?: string }>
    updateQuantity: (productId: number, quantity: number) => Promise<void>
    removeFromCart: (productId: number) => Promise<void>
    clearCart: () => Promise<void>
}

const STORAGE_KEY = 'dummyjson_cart_items'
const CART_ID_KEY = 'dummyjson_cart_id'

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [cartId, setCartId] = useState<number | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Hydrate from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return
        const saved = localStorage.getItem(STORAGE_KEY)
        const savedId = localStorage.getItem(CART_ID_KEY)
        if (saved) {
            try {
                setCartItems(JSON.parse(saved))
            } catch {
                localStorage.removeItem(STORAGE_KEY)
            }
        }
        if (savedId) {
            setCartId(Number(savedId))
        }
    }, [])

    const saveCart = useCallback((items: CartItem[], id?: number) => {
        setCartItems(items)
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
            if (id !== undefined) {
                localStorage.setItem(CART_ID_KEY, String(id))
            }
        }
    }, [])

    // Add to Cart
    const addToCart = useCallback(
        async (product: ProductItem, quantity = 1): Promise<{ success: boolean; message?: string }> => {
            let updated: CartItem[] = []
            const existingIndex = cartItems.findIndex((item) => item.id === product.id)

            if (existingIndex > -1) {
                updated = cartItems.map((item, idx) =>
                    idx === existingIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            } else {
                const newItem: CartItem = {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                    thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
                    quantity,
                    stock: product.stock,
                }
                updated = [...cartItems, newItem]
            }

            saveCart(updated)
            setIsDrawerOpen(true)

            // Trigger DummyJSON cart API asynchronously
            try {
                const apiProducts = updated.map((p) => ({ id: p.id, quantity: p.quantity }))
                const res = await addCartApi(user?.id || 1, apiProducts)
                if (res.success && res.data?.id) {
                    setCartId(res.data.id)
                    saveCart(updated, res.data.id)
                }
            } catch (err) {
                console.warn('DummyJSON cart sync notice:', err)
            }

            return { success: true }
        },
        [cartItems, saveCart, user]
    )

    // Update Quantity
    const updateQuantity = useCallback(
        async (productId: number, quantity: number) => {
            if (quantity <= 0) {
                const updated = cartItems.filter((item) => item.id !== productId)
                saveCart(updated)
            } else {
                const updated = cartItems.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
                saveCart(updated)
            }

            if (cartId) {
                try {
                    await updateCartApi(cartId, [{ id: productId, quantity }])
                } catch (err) {
                    console.warn('DummyJSON cart update notice:', err)
                }
            }
        },
        [cartItems, cartId, saveCart]
    )

    // Remove item
    const removeFromCart = useCallback(
        async (productId: number) => {
            const updated = cartItems.filter((item) => item.id !== productId)
            saveCart(updated)

            if (cartId && updated.length === 0) {
                try {
                    await deleteCartApi(cartId)
                    setCartId(null)
                    if (typeof window !== 'undefined') localStorage.removeItem(CART_ID_KEY)
                } catch (err) {
                    console.warn('DummyJSON cart delete notice:', err)
                }
            }
        },
        [cartItems, cartId, saveCart]
    )

    // Clear cart
    const clearCart = useCallback(async () => {
        saveCart([])
        if (cartId) {
            try {
                await deleteCartApi(cartId)
            } catch (err) {
                console.warn('DummyJSON cart clear notice:', err)
            }
        }
        setCartId(null)
        if (typeof window !== 'undefined') localStorage.removeItem(CART_ID_KEY)
    }, [cartId, saveCart])

    // Calculations
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalDiscount = cartItems.reduce((sum, item) => {
        if (!item.discountPercentage) return sum
        const originalPrice = item.price / (1 - item.discountPercentage / 100)
        return sum + (originalPrice - item.price) * item.quantity
    }, 0)
    const totalPrice = subtotal

    return (
        <CartContext.Provider
            value={{
                cartItems,
                totalItems,
                subtotal,
                totalDiscount,
                totalPrice,
                cartId,
                isDrawerOpen,
                setIsDrawerOpen,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart(): CartContextType {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
