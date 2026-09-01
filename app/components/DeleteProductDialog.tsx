"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { deleteProduct } from '../actions'

interface DeleteProductDialogProps {
    productId: number
    productTitle: string
    isOpen: boolean
    onClose: () => void
}

export default function DeleteProductDialog({
    productId,
    productTitle,
    isOpen,
    onClose,
}: DeleteProductDialogProps) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    if (!isOpen) return null

    const handleDelete = async () => {
        setSubmitting(true)
        setErrorMsg(null)
        const res = await deleteProduct(productId)
        setSubmitting(false)

        if (res.success) {
            setSuccessMsg('Product deleted successfully via DELETE /products/' + productId)
            setTimeout(() => {
                onClose()
                router.push('/')
            }, 1200)
        } else {
            setErrorMsg(res.error || 'Failed to delete product.')
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 text-center">
                <div className="size-14 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                    <TrashIcon className="size-7" />
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Product #{productId}?</h2>
                <p className="text-xs text-gray-500 mb-5">
                    Are you sure you want to delete <strong className="text-gray-800">{productTitle}</strong>? This action will invoke <code className="text-rose-600 font-mono bg-rose-50 px-1 py-0.5 rounded">DELETE /products/{productId}</code>.
                </p>

                {errorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <ExclamationTriangleIcon className="size-4 text-rose-500 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <p className="mb-4 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                        {successMsg}
                    </p>
                )}

                <div className="flex gap-2 justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={submitting}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {submitting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}
