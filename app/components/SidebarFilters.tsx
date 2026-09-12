'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { getAllProductCategories } from '../actions'
import { ProductCategory } from '../types'

export interface SidebarFiltersProps {
    children: React.ReactNode
    categories?: ProductCategory[]
    selectedCategory?: string
    onSelectCategory?: (category: string) => void
    title?: string
    description?: string
}

export default function SidebarFilters({
    children,
    categories: initialCategories,
    selectedCategory: controlledCategory,
    onSelectCategory,
}: SidebarFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [productCategories, setProductCategories] = useState<ProductCategory[] | null>(initialCategories || null)
    const [loading, setLoading] = useState(!initialCategories)

    const urlCategory = searchParams.get('category') || ''
    const activeCategory = controlledCategory !== undefined ? controlledCategory : urlCategory

    useEffect(() => {
        if (initialCategories) {
            setProductCategories(initialCategories)
            setLoading(false)
            return
        }

        let isMounted = true

        async function loadProduct() {
            try {
                const data = await getAllProductCategories()
                if (isMounted) {
                    setProductCategories(data)
                }
            } catch (error) {
                console.error('Failed to load categories:', error)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadProduct()

        return () => {
            isMounted = false
        }
    }, [initialCategories])

    const handleCategoryChange = (val: string) => {
        if (onSelectCategory) {
            onSelectCategory(val)
            return
        }

        const params = new URLSearchParams(searchParams.toString())
        if (val) {
            params.set('category', val)
        } else {
            params.delete('category')
        }
        params.delete('query')
        params.set('page', '1')

        const targetUrl = `/?${params.toString()}`

        startTransition(() => {
            router.replace(targetUrl, { scroll: false })
        })
    }

    // Only show sidebar filters on the home catalog page
    if (pathname !== '/') {
        return <div className="flex-1 w-full">{children}</div>;
    }

    return (
        <div className="bg-white">
            <div>
                <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                    <div className="border-b border-gray-200 pb-10">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">New Arrivals</h1>
                        <p className="mt-4 text-base text-gray-500">
                            Check out the latest release of Basic Tees, new and improved with four openings!
                        </p>
                    </div>

                    <div className="pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
                        <aside>
                            <h2 className="sr-only">Filters</h2>

                            <div className="hidden lg:block">
                                <form className="divide-y divide-gray-200">
                                    <div className="py-10 first:pt-0 last:pb-0">
                                        <fieldset>
                                            <legend className="flex items-center justify-between text-sm font-medium text-gray-900">
                                                <span>Categories</span>
                                                {isPending && (
                                                    <span className="text-xs font-normal text-indigo-600 animate-pulse">
                                                        Updating...
                                                    </span>
                                                )}
                                            </legend>
                                            <div className="space-y-3 pt-6 max-h-[70vh] overflow-y-auto pr-2">
                                                {/* "All Categories" reset option */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-5 shrink-0 items-center">
                                                        <div className="group grid size-4 grid-cols-1">
                                                            <input
                                                                id="category-all"
                                                                name="category"
                                                                type="radio"
                                                                value=""
                                                                checked={activeCategory === ''}
                                                                onChange={() => handleCategoryChange('')}
                                                                className="col-start-1 row-start-1 appearance-none rounded-full border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 cursor-pointer"
                                                            />
                                                            <span className="pointer-events-none col-start-1 row-start-1 size-1.5 self-center justify-self-center rounded-full bg-white opacity-0 group-has-checked:opacity-100" />
                                                        </div>
                                                    </div>
                                                    <label htmlFor="category-all" className="text-sm text-gray-600 cursor-pointer select-none">
                                                        All Categories
                                                    </label>
                                                </div>

                                                {loading && (
                                                    <p className="text-xs text-gray-400 py-2">Loading categories...</p>
                                                )}

                                                {/* Dynamic Category List */}
                                                {productCategories?.map((category, index) => {
                                                    const categorySlug = typeof category === 'string' ? category : (category.slug || category.name)
                                                    const categoryName = typeof category === 'string' ? category : category.name
                                                    const inputId = `category-${categorySlug}-${index}`
                                                    const val = categorySlug

                                                    return (
                                                        <div key={categorySlug} className="flex items-center gap-3">
                                                            <div className="flex h-5 shrink-0 items-center">
                                                                <div className="group grid size-4 grid-cols-1">
                                                                    <input
                                                                        id={inputId}
                                                                        name="category"
                                                                        type="radio"
                                                                        value={val}
                                                                        checked={activeCategory === val}
                                                                        onChange={() => handleCategoryChange(val)}
                                                                        className="col-start-1 row-start-1 appearance-none rounded-full border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 cursor-pointer"
                                                                    />
                                                                    {/* Radio center dot indicator */}
                                                                    <span className="pointer-events-none col-start-1 row-start-1 size-1.5 self-center justify-self-center rounded-full bg-white opacity-0 group-has-checked:opacity-100" />
                                                                </div>
                                                            </div>
                                                            <label htmlFor={inputId} className="text-sm text-gray-600 cursor-pointer select-none">
                                                                {categoryName}
                                                            </label>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </fieldset>
                                    </div>
                                </form>
                            </div>
                        </aside>

                        {/* Product grid */}
                        <div className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    )
}