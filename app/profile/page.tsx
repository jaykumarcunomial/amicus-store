/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    UserIcon,
    ShieldCheckIcon,
    KeyIcon,
    ArrowPathIcon,
    ArrowRightOnRectangleIcon,
    CheckIcon,
    DocumentDuplicateIcon,
    LockClosedIcon,
    EnvelopeIcon,
    SparklesIcon,
    ExclamationCircleIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { getAuthUser } from '../actions/auth'

export default function ProfilePage() {
    const router = useRouter()
    const { user, accessToken, refreshToken, isAuthenticated, isLoading, logout, refreshSession } = useAuth()

    const [copiedAccess, setCopiedAccess] = useState(false)
    const [copiedRefresh, setCopiedRefresh] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshStatus, setRefreshStatus] = useState<string | null>(null)

    const [testMeLoading, setTestMeLoading] = useState(false)
    const [testMeResult, setTestMeResult] = useState<object | null>(null)

    const handleCopy = (text: string, type: 'access' | 'refresh') => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(text)
            if (type === 'access') {
                setCopiedAccess(true)
                setTimeout(() => setCopiedAccess(false), 2000)
            } else {
                setCopiedRefresh(true)
                setTimeout(() => setCopiedRefresh(false), 2000)
            }
        }
    }

    const handleManualRefresh = async () => {
        setIsRefreshing(true)
        setRefreshStatus(null)
        try {
            const success = await refreshSession()
            if (success) {
                setRefreshStatus('Successfully refreshed access token via POST /auth/refresh!')
            } else {
                setRefreshStatus('Failed to refresh token.')
            }
        } catch {
            setRefreshStatus('Error occurred during token refresh.')
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleTestAuthMe = async () => {
        if (!accessToken) return
        setTestMeLoading(true)
        setTestMeResult(null)
        try {
            const res = await getAuthUser(accessToken)
            setTestMeResult(res)
        } catch (err) {
            setTestMeResult({ error: err instanceof Error ? err.message : 'Request failed' })
        } finally {
            setTestMeLoading(false)
        }
    }

    const handleSignOut = () => {
        logout()
        router.push('/login')
    }

    // Decode JWT payload safely for demonstration
    const decodeJwt = (token: string | null) => {
        if (!token) return null
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )
            return JSON.parse(jsonPayload)
        } catch {
            return null
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
                <div className="size-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-600">Verifying session with DummyJSON...</p>
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
                    <div className="size-16 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-5">
                        <LockClosedIcon className="size-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        You need to be signed in to view your profile and token inspector.
                    </p>
                    <Link
                        href="/login?redirect=/profile"
                        className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-colors"
                    >
                        Go to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    const decodedToken = decodeJwt(accessToken)

    return (
        <div className="min-h-[calc(100vh-8rem)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Banner */}
                <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <img
                                src={user.image || 'https://dummyjson.com/icon/emilys/128'}
                                alt={user.firstName}
                                className="size-20 rounded-2xl bg-indigo-50 border-2 border-indigo-200 object-cover shadow-sm"
                            />
                            <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-[10px] text-white font-bold" title="Authenticated">
                                ✓
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-extrabold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h1>
                                {user.role && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-100 text-indigo-800 border border-indigo-200">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">@{user.username}</p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <EnvelopeIcon className="size-3.5" />
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleSignOut}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                            <ArrowRightOnRectangleIcon className="size-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* User Profile Information Card */}
                    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                            <UserIcon className="size-5 text-indigo-600" />
                            <h2 className="text-base font-bold text-gray-900">User Profile</h2>
                        </div>

                        <dl className="space-y-3.5 text-sm">
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <dt className="text-gray-500 text-xs font-medium">User ID</dt>
                                <dd className="font-mono font-semibold text-gray-900">#{user.id}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <dt className="text-gray-500 text-xs font-medium">First Name</dt>
                                <dd className="font-semibold text-gray-900">{user.firstName}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <dt className="text-gray-500 text-xs font-medium">Last Name</dt>
                                <dd className="font-semibold text-gray-900">{user.lastName}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <dt className="text-gray-500 text-xs font-medium">Gender</dt>
                                <dd className="font-semibold text-gray-900 capitalize">{user.gender || 'Not specified'}</dd>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50">
                                <dt className="text-gray-500 text-xs font-medium">Account Role</dt>
                                <dd className="font-semibold text-indigo-600">{user.role || 'user'}</dd>
                            </div>
                            <div className="flex justify-between py-1">
                                <dt className="text-gray-500 text-xs font-medium">Auth Provider</dt>
                                <dd className="font-semibold text-emerald-600">DummyJSON REST API</dd>
                            </div>
                        </dl>
                    </div>

                    {/* API Testing Actions Card */}
                    <div className="md:col-span-2 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <CpuChipIcon className="size-5 text-indigo-600" />
                                <h2 className="text-base font-bold text-gray-900">Live DummyJSON Auth Testing</h2>
                            </div>
                            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                                Interactive
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {/* Test /auth/me Button */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Verify Auth (`GET /auth/me`)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Tests authorization header with your current bearer token.
                                    </p>
                                </div>
                                <button
                                    onClick={handleTestAuthMe}
                                    disabled={testMeLoading}
                                    className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                                >
                                    {testMeLoading ? (
                                        <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <SparklesIcon className="size-3.5" />
                                    )}
                                    <span>Call /auth/me</span>
                                </button>
                            </div>

                            {/* Test /auth/refresh Button */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Token Refresh (`POST /auth/refresh`)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Generates new JWT accessToken using refreshToken.
                                    </p>
                                </div>
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={isRefreshing}
                                    className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                                >
                                    {isRefreshing ? (
                                        <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <ArrowPathIcon className="size-3.5" />
                                    )}
                                    <span>Refresh Access Token</span>
                                </button>
                            </div>
                        </div>

                        {refreshStatus && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 mb-4">
                                <CheckIcon className="size-4 text-emerald-600 shrink-0" />
                                <span>{refreshStatus}</span>
                            </div>
                        )}

                        {testMeResult && (
                            <div className="mt-4">
                                <p className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                    <span>Response from /auth/me:</span>
                                </p>
                                <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 max-h-48">
                                    {JSON.stringify(testMeResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Token Inspector Section */}
                <div id="token-inspector" className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="size-6 text-indigo-600" />
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">JWT Token Inspector</h2>
                                <p className="text-xs text-gray-500">Live inspection of DummyJSON JWT credentials and session payload</p>
                            </div>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            Session Active
                        </span>
                    </div>

                    <div className="space-y-5">
                        {/* Access Token */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <KeyIcon className="size-4 text-indigo-600" />
                                    Access Token (Bearer)
                                </label>
                                <button
                                    onClick={() => handleCopy(accessToken || '', 'access')}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                >
                                    {copiedAccess ? (
                                        <>
                                            <CheckIcon className="size-3.5 text-emerald-600" />
                                            <span className="text-emerald-600">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <DocumentDuplicateIcon className="size-3.5" />
                                            <span>Copy Token</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="bg-slate-900 text-indigo-300 font-mono text-xs p-3.5 rounded-xl break-all border border-slate-800 selection:bg-indigo-600">
                                {accessToken || 'No token active'}
                            </div>
                        </div>

                        {/* Refresh Token */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <ArrowPathIcon className="size-4 text-emerald-600" />
                                    Refresh Token
                                </label>
                                <button
                                    onClick={() => handleCopy(refreshToken || '', 'refresh')}
                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                                >
                                    {copiedRefresh ? (
                                        <>
                                            <CheckIcon className="size-3.5 text-emerald-600" />
                                            <span className="text-emerald-600">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <DocumentDuplicateIcon className="size-3.5" />
                                            <span>Copy Token</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="bg-slate-900 text-emerald-300 font-mono text-xs p-3.5 rounded-xl break-all border border-slate-800 selection:bg-emerald-600">
                                {refreshToken || 'No refresh token active'}
                            </div>
                        </div>

                        {/* Decoded Payload */}
                        {decodedToken && (
                            <div className="mt-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                    Decoded JWT Payload
                                </label>
                                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                                    {JSON.stringify(decodedToken, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
