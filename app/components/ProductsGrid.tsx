/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link";
import { StarIcon, ShoppingBagIcon, CheckIcon, ScaleIcon } from "@heroicons/react/20/solid";
import { useCart } from "../context/CartContext";
import { useCompare, ProductItem } from "../context/CompareContext";

export default function ProductsGrid({ products }: { products: ProductItem[] }) {
    const { addToCart } = useCart();
    const { isInCompare, addToCompare, removeFromCompare } = useCompare();

    if (!products || products.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-base font-semibold text-gray-700">No products found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
                const inCompare = isInCompare(product.id);

                return (
                    <div
                        key={product.id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-2xs hover:shadow-lg transition-all duration-200"
                    >
                        <div>
                            {/* Image container & Badges */}
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 mb-3">
                                <img
                                    alt={product.title}
                                    src={product.thumbnail || (product.images && product.images[0]) || ''}
                                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Discount badge */}
                                {product.discountPercentage && product.discountPercentage > 0 && (
                                    <span className="absolute top-2 left-2 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                        -{Math.round(product.discountPercentage)}%
                                    </span>
                                )}

                                {/* Compare toggle button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (inCompare) {
                                            removeFromCompare(product.id);
                                        } else {
                                            addToCompare(product);
                                        }
                                    }}
                                    className={`absolute top-2 right-2 p-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1 ${inCompare
                                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-indigo-600'
                                        }`}
                                    title={inCompare ? "Remove from comparison" : "Add to comparison"}
                                >
                                    <ScaleIcon className="size-3.5" />
                                    {inCompare && <CheckIcon className="size-3" />}
                                </button>
                            </div>

                            {/* Category / Brand */}
                            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                                <span className="font-medium text-indigo-600 uppercase tracking-wider">
                                    {product.category}
                                </span>
                                {product.brand && <span className="truncate">{product.brand}</span>}
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                <Link href={`/product/${product.id}`}>
                                    {product.title}
                                </Link>
                            </h3>

                            {/* Rating */}
                            {product.rating !== undefined && (
                                <div className="mt-1.5 flex items-center gap-1">
                                    <div className="flex items-center text-amber-400">
                                        <StarIcon className="size-3.5 fill-current" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {product.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price & Add to Cart button */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-base font-bold text-gray-900">
                                    ${product.price?.toFixed(2)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => addToCart(product, 1)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                                title="Add to Cart"
                            >
                                <ShoppingBagIcon className="size-3.5" />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
