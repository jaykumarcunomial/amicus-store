export interface ProductDimensions {
    width?: number;
    height?: number;
    depth?: number;
}

export interface ProductReview {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
}

export interface ProductItem {
    id: number;
    title: string;
    name?: string; // Optional alias for title
    price: number;
    discountPercentage?: number;
    rating?: number;
    stock?: number;
    brand?: string;
    category?: string;
    thumbnail?: string;
    images?: string[];
    description?: string;
    dimensions?: ProductDimensions;
    weight?: number;
    warrantyInformation?: string;
    shippingInformation?: string;
    returnPolicy?: string;
    sku?: string;
    tags?: string[];
    reviews?: ProductReview[];
    isDeleted?: boolean;
}

export type Product = ProductItem;

export interface ProductCategory {
    slug: string;
    name: string;
    value?: string;
    url?: string;
}

export interface ProductQueryOptions {
    limit?: number;
    skip?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export interface ProductsResponse {
    products: ProductItem[];
    total: number;
    skip: number;
    limit: number;
}

export interface CreateProductInput {
    title: string;
    price: number;
    description?: string;
    category?: string;
    brand?: string;
    stock?: number;
    thumbnail?: string;
    images?: string[];
    [key: string]: unknown;
}

export interface UpdateProductInput {
    title?: string;
    price?: number;
    description?: string;
    category?: string;
    brand?: string;
    stock?: number;
    thumbnail?: string;
    images?: string[];
    [key: string]: unknown;
}

export interface ProductActionResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
