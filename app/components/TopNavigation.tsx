/* eslint-disable @next/next/no-img-element */
"use client"

import {
    QuestionMarkCircleIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    ShieldCheckIcon,
    ScaleIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCompare } from '../context/CompareContext'

const currencies = ['INR', 'CAD', 'USD', 'AUD', 'EUR', 'GBP']

export default function TopNavigation() {
    const { user, isAuthenticated, logout, isLoading } = useAuth()
    const { totalItems, setIsDrawerOpen } = useCart()
    const { compareList } = useCompare()

    return (
        <div className="bg-white shadow-xs sticky top-0 z-40">
            <header className="relative">
                <nav aria-label="Top">
                    {/* Top utility bar */}
                    <div className="bg-gray-900">
                        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                            {/* Currency selector */}
                            <form>
                                <div className="-ml-2 inline-grid grid-cols-1">
                                    <select
                                        id="desktop-currency"
                                        name="currency"
                                        aria-label="Currency"
                                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-gray-900 py-0.5 pr-7 pl-2 text-left text-base font-medium text-white focus:outline-2 focus:-outline-offset-1 focus:outline-white sm:text-sm/6"
                                    >
                                        {currencies.map((currency) => (
                                            <option key={currency}>{currency}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-1 size-5 self-center justify-self-end fill-gray-300"
                                    />
                                </div>
                            </form>

                            {/* Auth controls in top bar */}
                            <div className="flex items-center space-x-5">
                                {isLoading ? (
                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                        <div className="size-2 rounded-full bg-indigo-500 animate-ping" />
                                        <span>Loading...</span>
                                    </div>
                                ) : isAuthenticated && user ? (
                                    <Menu as="div" className="relative inline-block text-left">
                                        <MenuButton className="flex items-center gap-2 text-sm font-medium text-white hover:text-indigo-200 focus:outline-none transition-colors group cursor-pointer">
                                            <div className="relative">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.firstName}
                                                        className="size-6 rounded-full ring-1 ring-indigo-400 object-cover bg-gray-800"
                                                    />
                                                ) : (
                                                    <UserCircleIcon className="size-6 text-gray-300" />
                                                )}
                                                <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 ring-1 ring-gray-900" />
                                            </div>
                                            <span className="max-w-[120px] truncate sm:max-w-none">
                                                {user.firstName} {user.lastName}
                                            </span>
                                            {user.role && (
                                                <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-900/80 px-2 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30">
                                                    {user.role}
                                                </span>
                                            )}
                                            <ChevronDownIcon className="size-4 text-gray-400 group-hover:text-white transition-transform" />
                                        </MenuButton>

                                        <MenuItems
                                            transition
                                            className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
                                        >
                                            <div className="px-3 py-2 border-b border-gray-100 mb-1">
                                                <p className="text-xs text-gray-500">Signed in as</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    @{user.username}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>

                                            <MenuItem>
                                                {({ focus }) => (
                                                    <Link
                                                        href="/profile"
                                                        className={`${focus ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors`}
                                                    >
                                                        <UserIcon className="mr-2.5 size-4 text-gray-500 group-hover:text-indigo-600" />
                                                        Account Profile
                                                    </Link>
                                                )}
                                            </MenuItem>

                                            <MenuItem>
                                                {({ focus }) => (
                                                    <Link
                                                        href="/product/add"
                                                        className={`${focus ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors`}
                                                    >
                                                        <PlusCircleIcon className="mr-2.5 size-4 text-gray-500 group-hover:text-indigo-600" />
                                                        Add Product
                                                    </Link>
                                                )}
                                            </MenuItem>

                                            <MenuItem>
                                                {({ focus }) => (
                                                    <Link
                                                        href="/profile#token-inspector"
                                                        className={`${focus ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                                                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors`}
                                                    >
                                                        <ShieldCheckIcon className="mr-2.5 size-4 text-gray-500 group-hover:text-indigo-600" />
                                                        Session & Tokens
                                                    </Link>
                                                )}
                                            </MenuItem>

                                            <div className="my-1 border-t border-gray-100" />

                                            <MenuItem>
                                                {({ focus }) => (
                                                    <button
                                                        onClick={() => logout()}
                                                        className={`${focus ? 'bg-rose-50 text-rose-700' : 'text-rose-600'
                                                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors font-medium cursor-pointer`}
                                                    >
                                                        <ArrowRightOnRectangleIcon className="mr-2.5 size-4 text-rose-500" />
                                                        Sign out
                                                    </button>
                                                )}
                                            </MenuItem>
                                        </MenuItems>
                                    </Menu>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/login"
                                            className="text-sm font-semibold text-white hover:text-indigo-200 transition-colors flex items-center gap-1.5"
                                        >
                                            <UserCircleIcon className="size-4" />
                                            <span>Sign in</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Secondary navigation */}
                    <div className="bg-white">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="border-b border-gray-200">
                                <div className="flex h-16 items-center justify-between">
                                    {/* Logo */}
                                    <div className="flex items-center gap-3">
                                        <Link href="/" className="flex items-center gap-2 group">
                                            <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                                🛍️
                                            </div>
                                            <span className="text-lg font-bold bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                                                NextStore
                                            </span>
                                        </Link>
                                    </div>

                                    {/* Nav Links */}
                                    <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
                                        <Link
                                            href="/"
                                            className="text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
                                        >
                                            Catalog
                                        </Link>

                                        <Link
                                            href="/product/add"
                                            className="text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                        >
                                            <PlusCircleIcon className="size-4 text-indigo-600" />
                                            <span>Add Product</span>
                                        </Link>

                                        <Link
                                            href="/compare"
                                            className="text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                                        >
                                            <ScaleIcon className="size-4 text-gray-500" />
                                            <span>Compare</span>
                                            {compareList.length > 0 && (
                                                <span className="size-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                    {compareList.length}
                                                </span>
                                            )}
                                        </Link>

                                        {isAuthenticated && (
                                            <Link
                                                href="/profile"
                                                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
                                            >
                                                Profile
                                            </Link>
                                        )}

                                        <div className="flex items-center pl-2">
                                            {/* Cart Button */}
                                            <button
                                                type="button"
                                                onClick={() => setIsDrawerOpen(true)}
                                                className="group relative flex items-center p-2 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-200 transition-colors cursor-pointer"
                                                title="Open cart drawer"
                                            >
                                                <ShoppingBagIcon
                                                    aria-hidden="true"
                                                    className="size-5 shrink-0 text-gray-700 group-hover:text-indigo-600"
                                                />
                                                <span className="ml-1.5 text-xs font-bold text-gray-900 group-hover:text-indigo-600">
                                                    {totalItems}
                                                </span>
                                                <span className="sr-only">items in cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </div>
    )
}
