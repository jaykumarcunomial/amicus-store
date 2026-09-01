/* eslint-disable @next/next/no-img-element */
"use client"

import Link from 'next/link'
import { XMarkIcon, ScaleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useCompare } from '../context/CompareContext'

export default function CompareFloatingBar() {
    const { compareList, removeFromCompare, clearCompare } = useCompare()

    if (compareList.length === 0) return null

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-gray-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl p-3 sm:p-4 border border-gray-700/80 flex items-center justify-between gap-4 animate-slide-up">
            <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <ScaleIcon className="size-5" />
                </div>
                <div>
                    <p className="text-xs font-bold text-white">
                        Compare Products ({compareList.length}/3)
                    </p>
                    <p className="text-[11px] text-gray-400 hidden sm:block">
                        {compareList.length < 2
                            ? 'Select at least 2 products to compare'
                            : 'Ready to compare side-by-side'}
                    </p>
                </div>
            </div>

            {/* Selected item chips */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
                {compareList.map((p) => (
                    <div
                        key={p.id}
                        className="relative group flex items-center gap-1.5 bg-gray-800/90 border border-gray-700 rounded-lg p-1 pr-2 shrink-0"
                    >
                        <img
                            src={p.thumbnail || (p.images && p.images[0]) || ''}
                            alt={p.title}
                            className="size-7 rounded bg-white object-cover shrink-0"
                        />
                        <span className="text-[11px] font-medium text-gray-200 max-w-[80px] truncate">
                            {p.title}
                        </span>
                        <button
                            onClick={() => removeFromCompare(p.id)}
                            className="text-gray-400 hover:text-rose-400 transition-colors p-0.5"
                            title="Remove"
                        >
                            <XMarkIcon className="size-3" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={clearCompare}
                    className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
                >
                    Clear
                </button>
                <Link
                    href="/compare"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                        compareList.length >= 2
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                            : 'bg-gray-800 text-gray-400 pointer-events-none'
                    }`}
                >
                    <span>Compare</span>
                    <ArrowRightIcon className="size-3.5" />
                </Link>
            </div>
        </div>
    )
}
