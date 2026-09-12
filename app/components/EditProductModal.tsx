"use client"

import React, { useState, useEffect } from 'react'
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import { updateProduct } from '../actions'
import { ProductItem } from '@/app/types'
import { saveEditedProductToStorage } from '@/helpers/productStorage'

interface EditProductModalProps {
    product: ProductItem
    isOpen: boolean
    onClose: () => void
    onUpdated?: (updated: ProductItem) => void
}

export default function EditProductModal({
    product,
    isOpen,
    onClose,
    onUpdated,
}: EditProductModalProps) {
    const [title, setTitle] = useState(product.title || '')
    const [brand, setBrand] = useState(product.brand || '')
    const [category, setCategory] = useState(product.category || '')
    const [price, setPrice] = useState(String(product.price || 0))
    const [stock, setStock] = useState(String(product.stock || 0))
    const [description, setDescription] = useState(product.description || '')
    const [submitting, setSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setTitle(product.title || '')
            setBrand(product.brand || '')
            setCategory(product.category || '')
            setPrice(String(product.price || 0))
            setStock(String(product.stock || 0))
            setDescription(product.description || '')
            setErrorMsg(null)
            setSuccessMsg(null)
        }
    }, [isOpen, product])

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)

        const numPrice = parseFloat(price)
        if (isNaN(numPrice) || numPrice <= 0) {
            setErrorMsg('Please enter a valid price.')
            return
        }

        setSubmitting(true)
        const updateData = {
            title,
            brand,
            category,
            price: numPrice,
            stock: parseInt(stock, 10) || 0,
            description,
        }

        const res = await updateProduct(product.id, updateData)
        setSubmitting(false)

        if (res.success && res.data) {
            const updatedProduct: ProductItem = {
                ...product,
                ...res.data,
                ...updateData,
            }
            saveEditedProductToStorage(updatedProduct)

            setSuccessMsg('Product updated successfully via PUT /products/' + product.id)
            if (onUpdated) {
                onUpdated(updatedProduct)
            }
            setTimeout(() => {
                onClose()
            }, 1200)
        } else {
            setErrorMsg(res.error || 'Failed to update product.')
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                    <h2 className="text-lg font-bold text-gray-900">
                        Edit Product #{product.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="size-5" />
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <ExclamationTriangleIcon className="size-4 text-rose-500 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckIcon className="size-4 text-emerald-600 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Brand
                            </label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Category
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Stock
                            </label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 p-3 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                        />
                    </div>

                    <div className="pt-3 flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
