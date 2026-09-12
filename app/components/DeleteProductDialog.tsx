"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@heroicons/react/24/outline'

import { deleteProduct } from '../actions'
import { removeEditedProductFromStorage, markProductAsDeletedInStorage } from '@/helpers/productStorage'

import ConfirmDialog from './ConfirmDialog'

export interface DeleteProductDialogProps {
    productId: number
    productTitle: string
    isOpen: boolean
    onClose: () => void
    onDeleted?: () => void
    onDeleteAction?: (id: number) => Promise<{ success: boolean; error?: string }>
}

export default function DeleteProductDialog({
    productId,
    productTitle,
    isOpen,
    onClose,
    onDeleted,
    onDeleteAction = deleteProduct,
}: DeleteProductDialogProps) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const handleDelete = async () => {
        setSubmitting(true)
        setErrorMsg(null)
        const res = await onDeleteAction(productId)
        setSubmitting(false)

        if (res.success) {
            removeEditedProductFromStorage(productId)
            markProductAsDeletedInStorage(productId)
            if (onDeleted) {
                onDeleted()
            }
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
        <ConfirmDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            title={`Delete Product #${productId}?`}
            variant="danger"
            icon={<TrashIcon className="size-7" />}
            confirmText="Confirm Delete"
            cancelText="Cancel"
            loadingText="Deleting..."
            isLoading={submitting}
            error={errorMsg}
            success={successMsg}
            description={
                <p>
                    Are you sure you want to delete <strong className="text-gray-800">{productTitle}</strong>? This action will invoke <code className="text-rose-600 font-mono bg-rose-50 px-1 py-0.5 rounded">DELETE /products/{productId}</code>.
                </p>
            }
        />
    )
}
