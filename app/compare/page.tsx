/* eslint-disable @next/next/no-img-element */
"use client"

import Link from 'next/link'
import {
    ScaleIcon,
    XMarkIcon,
    ShoppingBagIcon,
    StarIcon,
    ArrowLeftIcon,
    CheckIcon,
} from '@heroicons/react/24/outline'
import { useCompare } from '../context/CompareContext'
import { useCart } from '../context/CartContext'

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare()
    const { addToCart } = useCart()

    if (compareList.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center">
                    <div className="size-16 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <ScaleIcon className="size-8" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">No Products Selected</h1>
                    <p className="text-xs text-gray-500 mb-6">
                        Select 2 or 3 products from the catalog to compare them side by side.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                        Browse Catalog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                <ArrowLeftIcon className="size-3" /> Back to Catalog
                            </Link>
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                            <span>Product Comparison</span>
                            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                                {compareList.length} of 3 items
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearCompare}
                            className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Clear All
                        </button>
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                            Add More Products
                        </Link>
                    </div>
                </div>

                {/* Side-by-Side Comparison Matrix Table */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50">
                                    <th className="p-4 sm:p-6 w-48 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Feature
                                    </th>
                                    {compareList.map((product) => (
                                        <th key={product.id} className="p-4 sm:p-6 w-72 min-w-[240px] align-top">
                                            <div className="flex flex-col gap-3">
                                                <div className="relative aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                                                    <img
                                                        src={product.thumbnail || (product.images && product.images[0]) || ''}
                                                        alt={product.title}
                                                        className="size-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => removeFromCompare(product.id)}
                                                        className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-gray-500 hover:text-rose-600 shadow-xs transition-colors"
                                                        title="Remove from compare"
                                                    >
                                                        <XMarkIcon className="size-4" />
                                                    </button>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                                                        {product.category}
                                                    </span>
                                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                                                        {product.title}
                                                    </h3>
                                                    <p className="text-base font-extrabold text-gray-900 mt-1">
                                                        ${product.price?.toFixed(2)}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => addToCart(product, 1)}
                                                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                                >
                                                    <ShoppingBagIcon className="size-3.5" />
                                                    <span>Add to Cart</span>
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 text-xs">
                                {/* Brand */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Brand</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4 font-semibold text-gray-900">
                                            {p.brand || 'Generic'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Rating */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Rating</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4 text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <StarIcon className="size-4 text-amber-400 fill-current" />
                                                <span className="font-bold">{p.rating?.toFixed(1) || '—'}</span>
                                                <span className="text-gray-400">/ 5</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Dimensions */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Dimensions (W x H x D)</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4 font-mono text-gray-800">
                                            {p.dimensions
                                                ? `${p.dimensions.width || '—'} x ${p.dimensions.height || '—'} x ${p.dimensions.depth || '—'} cm`
                                                : 'Standard'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Weight */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Weight</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4 text-gray-900">
                                            {p.weight ? `${p.weight} kg` : 'N/A'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Stock Status */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Stock Status</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
                                                    (p.stock || 0) > 0
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}
                                            >
                                                <CheckIcon className="size-3" />
                                                {p.stock ? `${p.stock} in stock` : 'Out of stock'}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Warranty */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Warranty</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4 text-gray-700">
                                            {p.warrantyInformation || '1 Year Standard'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Return Policy */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Return Policy</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4 text-gray-700">
                                            {p.returnPolicy || '30 days free return'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Description */}
                                <tr>
                                    <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Description</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-4 text-gray-600 leading-relaxed text-[11px]">
                                            {p.description || '—'}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}
