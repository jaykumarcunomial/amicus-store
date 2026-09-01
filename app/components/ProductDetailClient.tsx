/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import {
    StarIcon,
    ShoppingBagIcon,
    ScaleIcon,
    PencilSquareIcon,
    TrashIcon,
    CheckIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    TruckIcon,
    ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/20/solid'
import { useCart } from '../context/CartContext'
import { useCompare, ProductItem } from '../context/CompareContext'
import { useAuth } from '../context/AuthContext'
import EditProductModal from './EditProductModal'
import DeleteProductDialog from './DeleteProductDialog'

export default function ProductDetailClient({ initialProduct }: { initialProduct: ProductItem }) {
    const [product, setProduct] = useState<ProductItem>(initialProduct)
    const [selectedImage, setSelectedImage] = useState<string>(
        (product.images && product.images[0]) || product.thumbnail || ''
    )
    const [quantity, setQuantity] = useState<number>(1)
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

    const { addToCart } = useCart()
    const { isInCompare, addToCompare, removeFromCompare } = useCompare()
    const { isAuthenticated } = useAuth()

    const inCompare = isInCompare(product.id)
    const title = product.title || (product as any).name || 'Product Details'
    const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail || '']

    return (
        <div className="bg-white min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Breadcrumbs & Navigation */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="hover:text-indigo-600 flex items-center gap-1 font-medium">
                            <ArrowLeftIcon className="size-3" /> Back to Catalog
                        </Link>
                        <span>/</span>
                        <span className="capitalize font-medium text-gray-700">{product.category}</span>
                        <span>/</span>
                        <span className="text-gray-900 font-semibold truncate max-w-xs">{title}</span>
                    </div>

                    {/* Auth-protected Edit / Delete Actions */}
                    {isAuthenticated && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
                            >
                                <PencilSquareIcon className="size-3.5 text-indigo-600" />
                                <span>Edit Product</span>
                            </button>
                            <button
                                onClick={() => setIsDeleteOpen(true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
                            >
                                <TrashIcon className="size-3.5" />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left: Interactive Image Gallery */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="aspect-square w-full rounded-3xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center p-4 relative">
                            <img
                                src={selectedImage}
                                alt={title}
                                className="size-full object-contain object-center transition-all duration-300"
                            />
                            {product.discountPercentage && product.discountPercentage > 0 && (
                                <span className="absolute top-4 left-4 rounded-xl bg-rose-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
                                    -{Math.round(product.discountPercentage)}% OFF
                                </span>
                            )}
                        </div>

                        {/* Thumbnail selector */}
                        {images.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`size-20 rounded-2xl border-2 bg-gray-50 p-1 shrink-0 overflow-hidden transition-all ${
                                            selectedImage === img
                                                ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img src={img} alt="" className="size-full object-cover rounded-xl" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details & Actions */}
                    <div className="lg:col-span-6 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                    {product.category}
                                </span>
                                {product.brand && (
                                    <span className="text-xs font-medium text-gray-500">
                                        Brand: <strong className="text-gray-800">{product.brand}</strong>
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                {title}
                            </h1>

                            {/* Ratings & Reviews */}
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex items-center text-amber-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarSolid
                                            key={star}
                                            className={`size-4 ${
                                                (product.rating || 0) >= star
                                                    ? 'text-amber-400'
                                                    : 'text-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-gray-900">
                                    {product.rating?.toFixed(1) || '4.5'}
                                </span>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {product.reviews?.length || 0} reviews
                                </span>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-black text-gray-900">
                                    ${product.price?.toFixed(2)}
                                </p>
                                {product.discountPercentage && product.discountPercentage > 0 && (
                                    <p className="text-xs text-gray-400 line-through mt-0.5">
                                        ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                In Stock ({product.stock ?? 25} available)
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Overview
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Purchase & Compare Actions */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-300 rounded-xl bg-white p-1">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="px-2.5 py-1 text-gray-600 hover:text-black font-bold text-sm"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 text-xs font-bold text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="px-2.5 py-1 text-gray-600 hover:text-black font-bold text-sm"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => addToCart(product, quantity)}
                                    className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <ShoppingBagIcon className="size-4" />
                                    <span>Add to Cart</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (inCompare) removeFromCompare(product.id)
                                        else addToCompare(product)
                                    }}
                                    className={`p-3 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                                        inCompare
                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                    title={inCompare ? "Remove from Compare" : "Add to Compare"}
                                >
                                    <ScaleIcon className="size-4" />
                                    <span className="hidden sm:inline">
                                        {inCompare ? 'Compared' : 'Compare'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Value Props */}
                        <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-gray-600">
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                                <TruckIcon className="size-4 text-indigo-600 shrink-0" />
                                <span>{product.shippingInformation || 'Fast Delivery'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                                <ShieldCheckIcon className="size-4 text-indigo-600 shrink-0" />
                                <span>{product.warrantyInformation || '1-Yr Warranty'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                                <ArrowPathRoundedSquareIcon className="size-4 text-indigo-600 shrink-0" />
                                <span>{product.returnPolicy || '30-Day Return'}</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Specifications & Reviews Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200">
                    
                    {/* Specifications */}
                    <div className="lg:col-span-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">Technical Specifications</h2>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-xs space-y-2.5">
                            <div className="flex justify-between py-1 border-b border-gray-200/60">
                                <span className="text-gray-500">Dimensions</span>
                                <span className="font-semibold text-gray-900 font-mono">
                                    {product.dimensions
                                        ? `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm`
                                        : 'Standard'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200/60">
                                <span className="text-gray-500">Weight</span>
                                <span className="font-semibold text-gray-900">
                                    {product.weight ? `${product.weight} kg` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200/60">
                                <span className="text-gray-500">SKU</span>
                                <span className="font-mono font-semibold text-gray-900">
                                    {product.sku || `SKU-${product.id}`}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500">Tags</span>
                                <span className="font-semibold text-indigo-600">
                                    {product.tags?.join(', ') || 'general'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Reviews */}
                    <div className="lg:col-span-6 space-y-4">
                        <h2 className="text-base font-bold text-gray-900">
                            Customer Reviews ({product.reviews?.length || 0})
                        </h2>

                        <div className="space-y-3">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((rev, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-gray-900">
                                                {rev.reviewerName}
                                            </span>
                                            <div className="flex text-amber-400">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <StarSolid
                                                        key={s}
                                                        className={`size-3 ${
                                                            rev.rating >= s ? 'text-amber-400' : 'text-gray-200'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 italic">"{rev.comment}"</p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {new Date(rev.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic">No reviews yet for this product.</p>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* Modals for Edit & Delete */}
            <EditProductModal
                product={product}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onUpdated={(updated) => setProduct(updated)}
            />

            <DeleteProductDialog
                productId={product.id}
                productTitle={title}
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
            />
        </div>
    )
}
