/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    PlusIcon,
    XMarkIcon,
    SparklesIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import { getAllProductCategories, addProduct } from '../actions'

interface FormState {
    // Step 1
    category: string
    // Step 2
    title: string
    brand: string
    description: string
    tags: string[]
    // Step 3
    dimensions: {
        width: string
        height: string
        depth: string
    }
    weight: string
    warrantyInformation: string
    // Step 4
    price: string
    discountPercentage: string
    stock: string
    sku: string
}

const INITIAL_FORM_STATE: FormState = {
    category: '',
    title: '',
    brand: '',
    description: '',
    tags: ['new', 'trending'],
    dimensions: {
        width: '10',
        height: '15',
        depth: '5',
    },
    weight: '1',
    warrantyInformation: '1 year standard warranty',
    price: '',
    discountPercentage: '0',
    stock: '50',
    sku: '',
}

const STEPS = [
    { number: 1, title: 'Category', subtitle: 'Select product category' },
    { number: 2, title: 'Brand & Tags', subtitle: 'Title, brand and tags' },
    { number: 3, title: 'Dimensions', subtitle: 'Size & physical specs' },
    { number: 4, title: 'Pricing & Stock', subtitle: 'Price, inventory & review' },
]

export default function AddProductWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE)
    const [categories, setCategories] = useState<{ slug: string; name: string }[]>([])
    const [categoryFilter, setCategoryFilter] = useState('')
    const [newTagInput, setNewTagInput] = useState('')
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState<any | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        getAllProductCategories()
            .then((data) => {
                if (Array.isArray(data)) {
                    const formatted = data.map((c) =>
                        typeof c === 'string' ? { slug: c, name: c } : { slug: c.slug, name: c.name }
                    )
                    setCategories(formatted)
                }
            })
            .catch(console.error)
    }, [])

    // Step 1 Validation
    const validateStep1 = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.category) {
            errors.category = 'Please select a product category to proceed.'
        }
        setStepErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Step 2 Validation
    const validateStep2 = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.title.trim()) {
            errors.title = 'Product title is required.'
        } else if (formData.title.length < 3) {
            errors.title = 'Product title must be at least 3 characters long.'
        }
        if (!formData.brand.trim()) {
            errors.brand = 'Brand name is required.'
        }
        if (formData.tags.length === 0) {
            errors.tags = 'Add at least one product tag.'
        }
        setStepErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Step 3 Validation
    const validateStep3 = (): boolean => {
        const errors: Record<string, string> = {}
        const w = parseFloat(formData.dimensions.width)
        const h = parseFloat(formData.dimensions.height)
        const d = parseFloat(formData.dimensions.depth)

        if (isNaN(w) || w <= 0) errors.width = 'Width must be a positive number.'
        if (isNaN(h) || h <= 0) errors.height = 'Height must be a positive number.'
        if (isNaN(d) || d <= 0) errors.depth = 'Depth must be a positive number.'

        setStepErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Step 4 Validation
    const validateStep4 = (): boolean => {
        const errors: Record<string, string> = {}
        const p = parseFloat(formData.price)
        const s = parseInt(formData.stock, 10)

        if (isNaN(p) || p <= 0) {
            errors.price = 'Valid product price greater than $0 is required.'
        }
        if (isNaN(s) || s < 0) {
            errors.stock = 'Stock quantity must be a non-negative number.'
        }
        setStepErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleNext = () => {
        let isValid = false
        if (currentStep === 1) isValid = validateStep1()
        else if (currentStep === 2) isValid = validateStep2()
        else if (currentStep === 3) isValid = validateStep3()
        else if (currentStep === 4) isValid = validateStep4()

        if (isValid) {
            setStepErrors({})
            setCurrentStep((prev) => Math.min(prev + 1, 4))
        }
    }

    const handleBack = () => {
        setStepErrors({})
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleAddTag = () => {
        if (!newTagInput.trim()) return
        const cleanTag = newTagInput.trim().toLowerCase()
        if (!formData.tags.includes(cleanTag)) {
            setFormData({ ...formData, tags: [...formData.tags, cleanTag] })
        }
        setNewTagInput('')
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) })
    }

    const handleSubmit = async () => {
        if (!validateStep4()) return

        setSubmitting(true)
        setSubmitError(null)

        const payload = {
            title: formData.title,
            category: formData.category,
            brand: formData.brand,
            description: formData.description || 'Newly added custom product',
            tags: formData.tags,
            dimensions: {
                width: parseFloat(formData.dimensions.width),
                height: parseFloat(formData.dimensions.height),
                depth: parseFloat(formData.dimensions.depth),
            },
            weight: parseFloat(formData.weight) || 1,
            warrantyInformation: formData.warrantyInformation,
            price: parseFloat(formData.price),
            discountPercentage: parseFloat(formData.discountPercentage) || 0,
            stock: parseInt(formData.stock, 10) || 10,
            sku: formData.sku || `SKU-${Date.now().toString().slice(-6)}`,
        }

        const res = await addProduct(payload)
        setSubmitting(false)

        if (res.success && res.data) {
            setSubmitSuccess(res.data)
        } else {
            setSubmitError(res.error || 'Failed to submit product to DummyJSON API.')
        }
    }

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categoryFilter.toLowerCase())
    )

    if (submitSuccess) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center">
                <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="size-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Successfully Added!</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Product <strong className="text-gray-900">{submitSuccess.title}</strong> has been created with ID #{submitSuccess.id} via <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">POST /products/add</code>.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left text-xs space-y-2 mb-6">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Product ID:</span>
                        <span className="font-bold text-gray-900">#{submitSuccess.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-semibold text-gray-900 capitalize">{submitSuccess.category}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Brand & Tags:</span>
                        <span className="font-semibold text-gray-900">{submitSuccess.brand} ({submitSuccess.tags?.join(', ')})</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Dimensions (W x H x D):</span>
                        <span className="font-semibold text-gray-900">
                            {submitSuccess.dimensions?.width || formData.dimensions.width} x {submitSuccess.dimensions?.height || formData.dimensions.height} x {submitSuccess.dimensions?.depth || formData.dimensions.depth} cm
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-emerald-600">${submitSuccess.price}</span>
                    </div>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => {
                            setFormData(INITIAL_FORM_STATE)
                            setCurrentStep(1)
                            setSubmitSuccess(null)
                        }}
                        className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Add Another Product
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                    >
                        Back to Catalog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Header & Step Wizard Indicators */}
            <div className="bg-slate-900 text-white p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="size-5 text-indigo-400" />
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                        Multi-Step Creation
                    </span>
                </div>
                <h1 className="text-2xl font-extrabold">Add New Product</h1>
                <p className="text-xs text-slate-400 mt-1">
                    Complete all 4 steps to publish your product to the catalog.
                </p>

                {/* Progress Indicators */}
                <div className="mt-8 grid grid-cols-4 gap-2">
                    {STEPS.map((step) => {
                        const isCompleted = currentStep > step.number
                        const isCurrent = currentStep === step.number

                        return (
                            <div key={step.number} className="flex flex-col gap-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-emerald-500'
                                            : isCurrent
                                            ? 'bg-indigo-500'
                                            : 'bg-slate-700'
                                    }`}
                                />
                                <div className="hidden sm:flex items-center gap-1.5">
                                    <span
                                        className={`size-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                            isCompleted
                                                ? 'bg-emerald-500 text-white'
                                                : isCurrent
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-800 text-slate-400'
                                        }`}
                                    >
                                        {isCompleted ? '✓' : step.number}
                                    </span>
                                    <span
                                        className={`text-[11px] font-medium truncate ${
                                            isCurrent ? 'text-white' : 'text-slate-400'
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8">
                {submitError && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
                        <ExclamationTriangleIcon className="size-5 text-rose-500 shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}

                {/* STEP 1: CATEGORY SELECTION */}
                {currentStep === 1 && (
                    <div className="space-y-5 animate-fade-in">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Step 1: Select Category</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Choose the primary category for this product.
                            </p>
                        </div>

                        {stepErrors.category && (
                            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                                {stepErrors.category}
                            </p>
                        )}

                        <input
                            type="text"
                            placeholder="Filter categories (e.g. beauty, laptops, smartphones)..."
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none"
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                            {filteredCategories.map((cat) => {
                                const selected = formData.category === cat.slug
                                return (
                                    <button
                                        key={cat.slug}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, category: cat.slug })
                                            setStepErrors({})
                                        }}
                                        className={`p-3 rounded-xl border text-left text-xs font-semibold capitalize transition-all cursor-pointer flex items-center justify-between ${
                                            selected
                                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20'
                                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="truncate">{cat.name.replace(/-/g, ' ')}</span>
                                        {selected && <CheckCircleIcon className="size-4 text-indigo-600 shrink-0" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 2: BRAND, TITLE, DESCRIPTION & TAGS */}
                {currentStep === 2 && (
                    <div className="space-y-5 animate-fade-in">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Step 2: Tags & Brand</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Specify product branding, title, description, and searchable tags.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Ultra Slim Wireless Headphones"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none"
                            />
                            {stepErrors.title && <p className="text-xs text-rose-600 mt-1">{stepErrors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Sony, Apple, Nike"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none"
                            />
                            {stepErrors.brand && <p className="text-xs text-rose-600 mt-1">{stepErrors.brand}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Describe product features and specs..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                Tags *
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Add tag (e.g. bluetooth, sale, premium)..."
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddTag()
                                        }
                                    }}
                                    className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                                >
                                    <PlusIcon className="size-3.5" />
                                    <span>Add</span>
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-indigo-400 hover:text-indigo-700"
                                        >
                                            <XMarkIcon className="size-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            {stepErrors.tags && <p className="text-xs text-rose-600 mt-1">{stepErrors.tags}</p>}
                        </div>
                    </div>
                )}

                {/* STEP 3: DIMENSIONS & SPECS */}
                {currentStep === 3 && (
                    <div className="space-y-5 animate-fade-in">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Step 3: Dimensions & Specifications</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Enter physical measurements and warranty terms.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Width (cm) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dimensions.width}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dimensions: { ...formData.dimensions, width: e.target.value },
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                                {stepErrors.width && <p className="text-xs text-rose-600 mt-1">{stepErrors.width}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Height (cm) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dimensions.height}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dimensions: { ...formData.dimensions, height: e.target.value },
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                                {stepErrors.height && <p className="text-xs text-rose-600 mt-1">{stepErrors.height}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Depth (cm) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.dimensions.depth}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dimensions: { ...formData.dimensions, depth: e.target.value },
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                                {stepErrors.depth && <p className="text-xs text-rose-600 mt-1">{stepErrors.depth}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Warranty Info
                                </label>
                                <input
                                    type="text"
                                    value={formData.warrantyInformation}
                                    onChange={(e) => setFormData({ ...formData, warrantyInformation: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: PRICE, INVENTORY & SUBMIT */}
                {currentStep === 4 && (
                    <div className="space-y-5 animate-fade-in">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Step 4: Price & Inventory</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Set product pricing, discount rate, inventory stock, and review summary.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Base Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 49.99"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                                {stepErrors.price && <p className="text-xs text-rose-600 mt-1">{stepErrors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Discount (%)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="99"
                                    placeholder="e.g. 10"
                                    value={formData.discountPercentage}
                                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                                {stepErrors.stock && <p className="text-xs text-rose-600 mt-1">{stepErrors.stock}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Custom SKU
                                </label>
                                <input
                                    type="text"
                                    placeholder="Auto-generated if empty"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 focus:border-indigo-600 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Complete Summary Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                                Final Product Summary
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-slate-600">
                                <div>
                                    <span className="text-slate-400">Title:</span> {formData.title || '—'}
                                </div>
                                <div>
                                    <span className="text-slate-400">Category:</span> {formData.category || '—'}
                                </div>
                                <div>
                                    <span className="text-slate-400">Brand:</span> {formData.brand || '—'}
                                </div>
                                <div>
                                    <span className="text-slate-400">Tags:</span> {formData.tags.join(', ')}
                                </div>
                                <div>
                                    <span className="text-slate-400">Dimensions:</span> {formData.dimensions.width}x{formData.dimensions.height}x{formData.dimensions.depth} cm
                                </div>
                                <div>
                                    <span className="text-slate-400">Price:</span> ${formData.price || '0'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 1 || submitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeftIcon className="size-3.5" />
                        <span>Back</span>
                    </button>

                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                            <span>Continue to Step {currentStep + 1}</span>
                            <ArrowRightIcon className="size-3.5" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Submitting to DummyJSON...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="size-4" />
                                    <span>Submit & Create Product</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
