"use client"

import React from "react";
import { ProductItem } from "../types";

import ProductCard from "./ProductCard";

export interface ProductsGridProps {
    products: ProductItem[];
    renderItem?: (product: ProductItem, index: number) => React.ReactNode;
    renderEmpty?: () => React.ReactNode;
    emptyMessage?: string;
    emptyDescription?: string;
    className?: string;
}

export default function ProductsGrid({
    products,
    renderItem,
    renderEmpty,
    emptyMessage = "No products found",
    emptyDescription = "Try adjusting your search query or filters.",
    className = "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}: ProductsGridProps) {
    if (!products || products.length === 0) {
        if (renderEmpty) {
            return <>{renderEmpty()}</>;
        }
        return (
            <div className="py-16 text-center">
                <p className="text-base font-semibold text-gray-700">{emptyMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{emptyDescription}</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {products.map((product, index) => {
                if (renderItem) {
                    return <React.Fragment key={product.id}>{renderItem(product, index)}</React.Fragment>;
                }
                return <ProductCard key={product.id} product={product} />;
            })}
        </div>
    );
}
