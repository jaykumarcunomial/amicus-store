/* eslint-disable @next/next/no-img-element */
"use client"

import Link from 'next/link'
import {
    ShoppingBagIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
    const {
        cartItems,
        totalItems,
        subtotal,
        totalDiscount,
        totalPrice,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart()
    const { isAuthenticated } = useAuth()

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center">
                    <div className="size-16 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <ShoppingBagIcon className="size-8 stroke-1" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
                    <p className="text-xs text-gray-500 mb-6">
                        Looks like you haven't added any products to your cart yet.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mb-1">
                            <ArrowLeftIcon className="size-3" /> Continue Shopping
                        </Link>
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            Shopping Cart ({totalItems} items)
                        </h1>
                    </div>
                    <button
                        onClick={() => clearCart()}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-3">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="size-20 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-bold text-gray-900 truncate">
                                            <Link href={`/product/${item.id}`} className="hover:text-indigo-600">
                                                {item.title}
                                            </Link>
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Unit Price: ${item.price.toFixed(2)}
                                        </p>
                                        {item.discountPercentage && item.discountPercentage > 0 && (
                                            <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                                {item.discountPercentage}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <MinusIcon className="size-3.5" />
                                        </button>
                                        <span className="px-3 text-xs font-bold text-gray-800">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
                                        >
                                            <PlusIcon className="size-3.5" />
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <p className="text-sm font-extrabold text-gray-900 min-w-[70px] text-right">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                                        title="Remove item"
                                    >
                                        <TrashIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                            Order Summary
                        </h2>

                        <dl className="space-y-2.5 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <dt>Subtotal</dt>
                                <dd className="font-semibold text-gray-900">${subtotal.toFixed(2)}</dd>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-semibold">
                                    <dt>Estimated Savings</dt>
                                    <dd>-${totalDiscount.toFixed(2)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <dt>Estimated Shipping</dt>
                                <dd className="font-semibold text-emerald-600">FREE</dd>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-100">
                                <dt>Total</dt>
                                <dd className="text-base font-extrabold text-indigo-600">${totalPrice.toFixed(2)}</dd>
                            </div>
                        </dl>

                        {/* Checkout CTA */}
                        {isAuthenticated ? (
                            <button
                                onClick={() => alert('Checkout simulation successful! Order placed.')}
                                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                            >
                                Proceed to Checkout
                            </button>
                        ) : (
                            <Link
                                href="/login?redirect=/cart"
                                className="block text-center w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                            >
                                Sign in to Checkout
                            </Link>
                        )}

                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-2">
                            <ShieldCheckIcon className="size-4 text-emerald-600" />
                            <span>Secure checkout with DummyJSON API</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
