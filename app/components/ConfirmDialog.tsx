"use client"

import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    loadingText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
    error?: string | null;
    success?: string | null;
    children?: React.ReactNode;
    footerSlot?: React.ReactNode;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    icon,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loadingText = 'Processing...',
    variant = 'primary',
    isLoading = false,
    error,
    success,
    children,
    footerSlot,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-rose-100 text-rose-600',
            buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white',
        },
        warning: {
            iconBg: 'bg-amber-100 text-amber-600',
            buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        primary: {
            iconBg: 'bg-indigo-100 text-indigo-600',
            buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        },
    }[variant];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 text-center">
                {icon && (
                    <div className={`size-14 mx-auto ${variantStyles.iconBg} rounded-full flex items-center justify-center mb-4`}>
                        {icon}
                    </div>
                )}

                <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>

                {description && (
                    <div className="text-xs text-gray-500 mb-5">{description}</div>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <ExclamationTriangleIcon className="size-4 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <p className="mb-4 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                        {success}
                    </p>
                )}

                {children}

                {footerSlot ? (
                    footerSlot
                ) : (
                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-xl ${variantStyles.buttonBg} text-xs font-semibold shadow-sm transition-colors disabled:opacity-60 cursor-pointer`}
                        >
                            {isLoading ? loadingText : confirmText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
