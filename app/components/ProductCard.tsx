/* eslint-disable @next/next/no-img-element */
"use client"

import React from "react";
import Link from "next/link";
import { StarIcon, ShoppingBagIcon, CheckIcon, ScaleIcon } from "@heroicons/react/20/solid";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import { ProductItem } from "../types";

export interface ProductCardProps {
    product: ProductItem;
    isCompared?: boolean;
    onToggleCompare?: (product: ProductItem) => void;
    onAddToCart?: (product: ProductItem) => void;
    showCompare?: boolean;
    showAddToCart?: boolean;
    badgeSlot?: React.ReactNode;
    actionsSlot?: React.ReactNode;
    renderBadges?: (product: ProductItem) => React.ReactNode;
    renderActions?: (product: ProductItem, state: { inCompare: boolean }) => React.ReactNode;
    renderPrice?: (product: ProductItem) => React.ReactNode;
    renderHeader?: (product: ProductItem) => React.ReactNode;
    className?: string;
}

export default function ProductCard({
    product,
    isCompared,
    onToggleCompare,
    onAddToCart,
    showCompare = true,
    showAddToCart = true,
    badgeSlot,
    actionsSlot,
    renderBadges,
    renderActions,
    renderPrice,
    renderHeader,
    className = "",
}: ProductCardProps) {
    const { addToCart } = useCart();
    const { isInCompare, addToCompare, removeFromCompare } = useCompare();

    const activeInCompare = isCompared !== undefined ? isCompared : isInCompare(product.id);

    const handleToggleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onToggleCompare) {
            onToggleCompare(product);
        } else if (activeInCompare) {
            removeFromCompare(product.id);
        } else {
            addToCompare(product);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onAddToCart) {
            onAddToCart(product);
        } else {
            addToCart(product, 1);
        }
    };

    const imageSrc = product.thumbnail || (product.images && product.images[0]) || "";

    return (
        <div
            className={`group relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-2xs hover:shadow-lg transition-all duration-200 ${className}`}
        >
            <div>
                {/* Image container & Badges */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 mb-3">
                    <img
                        alt={product.title}
                        src={imageSrc}
                        className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Custom or default Badges */}
                    {badgeSlot ? (
                        badgeSlot
                    ) : renderBadges ? (
                        renderBadges(product)
                    ) : (
                        product.discountPercentage && product.discountPercentage > 0 ? (
                            <span className="absolute top-2 left-2 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                -{Math.round(product.discountPercentage)}%
                            </span>
                        ) : null
                    )}

                    {/* Compare toggle button */}
                    {showCompare && (
                        <button
                            type="button"
                            onClick={handleToggleCompare}
                            className={`absolute top-2 right-2 p-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1 ${activeInCompare
                                ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                                : "bg-white/90 text-gray-600 hover:bg-white hover:text-indigo-600"
                                }`}
                            title={activeInCompare ? "Remove from comparison" : "Add to comparison"}
                        >
                            <ScaleIcon className="size-3.5" />
                            {activeInCompare && <CheckIcon className="size-3" />}
                        </button>
                    )}
                </div>

                {/* Custom or default Header (Category / Brand) */}
                {renderHeader ? (
                    renderHeader(product)
                ) : (
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                        <span className="font-medium text-indigo-600 uppercase tracking-wider">
                            {product.category}
                        </span>
                        {product.brand && <span className="truncate">{product.brand}</span>}
                    </div>
                )}

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

            {/* Price & Action footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {renderPrice ? (
                    renderPrice(product)
                ) : (
                    <div>
                        <p className="text-base font-bold text-gray-900">
                            ${product.price?.toFixed(2)}
                        </p>
                    </div>
                )}

                {actionsSlot ? (
                    actionsSlot
                ) : renderActions ? (
                    renderActions(product, { inCompare: activeInCompare })
                ) : showAddToCart ? (
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                        title="Add to Cart"
                    >
                        <ShoppingBagIcon className="size-3.5" />
                        <span>Add</span>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
