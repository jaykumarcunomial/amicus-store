"use client"

import Link from 'next/link'
import { LockClosedIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/app/context/AuthContext'
import AddProductWizard from '@/app/components/AddProductWizard'

export default function AddProductPage() {
    const { isAuthenticated, isLoading, user } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
                <div className="size-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-xs font-semibold text-gray-500">Checking authorization...</p>
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
                    <div className="size-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
                        <LockClosedIcon className="size-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-xs text-gray-500 mb-6">
                        You must be signed in to add new products to the catalog.
                    </p>
                    <Link
                        href="/login?redirect=/product/add"
                        className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-colors"
                    >
                        Sign in to Continue
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <AddProductWizard />
        </div>
    )
}
