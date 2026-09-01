/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    LockClosedIcon,
    UserIcon,
    EyeIcon,
    EyeSlashIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, isAuthenticated, user } = useAuth()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [expiresInMins, setExpiresInMins] = useState<number>(60)
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const redirectTo = searchParams.get('redirect') || '/'

    useEffect(() => {
        if (isAuthenticated && !submitting) {
            // Already authenticated
        }
    }, [isAuthenticated, submitting])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setErrorMsg(null)
        setSuccessMsg(null)

        if (!username.trim() || !password) {
            setErrorMsg('Please enter both username and password.')
            return
        }

        setSubmitting(true)
        const res = await login({
            username: username.trim(),
            password,
            expiresInMins,
        })

        setSubmitting(false)

        if (res.success) {
            setSuccessMsg('Authentication successful! Redirecting...')
            setTimeout(() => {
                router.push(redirectTo)
            }, 800)
        } else {
            setErrorMsg(res.error || 'Invalid username or password. Please try again.')
        }
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] py-12 px-4 flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
                        <SparklesIcon className="size-3.5" />
                        DummyJSON Auth
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Authenticate against DummyJSON REST JWT endpoints.
                    </p>
                </div>

                {/* Already logged in banner */}
                {isAuthenticated && user && (
                    <div className="mb-5 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={user.image || 'https://dummyjson.com/icon/emilys/128'}
                                alt={user.firstName}
                                className="size-9 rounded-full bg-indigo-100 border border-indigo-300"
                            />
                            <div>
                                <p className="text-xs font-semibold text-gray-900">
                                    Signed in as {user.firstName} {user.lastName}
                                </p>
                                <p className="text-[11px] text-gray-600">@{user.username}</p>
                            </div>
                        </div>
                        <Link
                            href="/profile"
                            className="text-xs font-semibold px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                            <span>Profile</span>
                            <ArrowRightIcon className="size-3" />
                        </Link>
                    </div>
                )}

                {/* Alerts */}
                {errorMsg && (
                    <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-rose-800 text-xs">
                        <ExclamationTriangleIcon className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Authentication failed</p>
                            <p className="text-rose-700 mt-0.5">{errorMsg}</p>
                        </div>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5 text-emerald-800 text-xs">
                        <CheckCircleIcon className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">{successMsg}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                            Username
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="size-4 text-gray-400" />
                            </div>
                            <input
                                id="login-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g. emilys or michaelw"
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                                {showPassword ? (
                                    <>
                                        <EyeSlashIcon className="size-3.5" /> Hide
                                    </>
                                ) : (
                                    <>
                                        <EyeIcon className="size-3.5" /> Show
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon className="size-4 text-gray-400" />
                            </div>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="e.g. emilyspass"
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                        <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
                            <span>Token Duration:</span>
                            <select
                                value={expiresInMins}
                                onChange={(e) => setExpiresInMins(Number(e.target.value))}
                                className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                            >
                                <option value={30}>30 mins</option>
                                <option value={60}>60 mins</option>
                                <option value={1440}>24 hours</option>
                            </select>
                        </label>
                        <span className="text-gray-400">Bearer JWT</span>
                    </div>

                    <button
                        id="login-submit-btn"
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                        {submitting ? (
                            <>
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRightIcon className="size-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
