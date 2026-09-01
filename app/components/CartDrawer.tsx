/* eslint-disable @next/next/no-img-element */
"use client"

import Link from 'next/link'
import {
    XMarkIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    ShoppingBagIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
    const {
        cartItems,
        totalItems,
        subtotal,
        isDrawerOpen,
        setIsDrawerOpen,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart()

    if (!isDrawerOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                onClick={() => setIsDrawerOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBagIcon className="size-5 text-indigo-600" />
                            <h2 className="text-base font-bold text-gray-900">
                                Shopping Cart ({totalItems})
                            </h2>
                        </div>
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="size-5" />
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                                <ShoppingBagIcon className="size-12 text-gray-300 mb-3 stroke-1" />
                                <p className="text-sm font-semibold text-gray-700">Your cart is empty</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Explore the catalog to add products.
                                </p>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                >
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="size-18 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-xs font-semibold text-gray-900 truncate">
                                                    {item.title}
                                                </h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 hover:text-rose-600 transition-colors p-0.5"
                                                    title="Remove item"
                                                >
                                                    <TrashIcon className="size-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-xs font-bold text-gray-900 mt-0.5">
                                                ${item.price.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                                                >
                                                    <MinusIcon className="size-3" />
                                                </button>
                                                <span className="px-2 text-xs font-semibold text-gray-800">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                                                >
                                                    <PlusIcon className="size-3" />
                                                </button>
                                            </div>
                                            <span className="text-[11px] text-gray-500">
                                                Total: ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-600">Subtotal</span>
                                <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <p className="text-[11px] text-gray-400">
                                Taxes and shipping calculated at checkout.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => clearCart()}
                                    className="px-3 py-2.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Clear
                                </button>
                                <Link
                                    href="/cart"
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <span>View Cart & Checkout</span>
                                    <ArrowRightIcon className="size-3.5" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
