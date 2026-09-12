"use server"

export interface ProductQueryOptions {
    limit?: number;
    skip?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

function buildQueryString(options?: ProductQueryOptions): string {
    if (!options) return '';
    const params = new URLSearchParams();
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.skip !== undefined) params.set('skip', String(options.skip));
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.order) params.set('order', options.order);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

export async function getProducts(options?: ProductQueryOptions) {
    const qs = buildQueryString(options);
    const apiUrl = `https://dummyjson.com/products${qs}`;

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 1800 }, // Cache products for 30 minutes
        });
        const products = await response.json();
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
}

export async function searchProducts(query: string, options?: ProductQueryOptions) {
    const params = new URLSearchParams();
    params.set('q', query);
    if (options?.limit !== undefined) params.set('limit', String(options.limit));
    if (options?.skip !== undefined) params.set('skip', String(options.skip));
    if (options?.sortBy) params.set('sortBy', options?.sortBy);
    if (options?.order) params.set('order', options?.order);

    const apiUrl = `https://dummyjson.com/products/search?${params.toString()}`;

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 1800 } // Cache search results for 30 minutes
        });
        const products = await response.json();
        return products;
    } catch (error) {
        console.error(`Error searching products with query "${query}":`, error);
        throw new Error(`Failed to search products with query "${query}"`);
    }
}

export async function getProductById(id: number) {
    const apiUrl = `https://dummyjson.com/products/${id}`;

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 1800 } // Cache products for 30 minutes
        });
        const product = await response.json();
        return product;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw new Error(`Failed to fetch product with ID ${id}`);
    }
}

export async function getProductsByCategory(category: string, options?: ProductQueryOptions) {
    const qs = buildQueryString(options);
    const apiUrl = `https://dummyjson.com/products/category/${category}${qs}`;

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 1800 } // Cache products for 30 minutes
        });
        const products = await response.json();
        return products;
    } catch (error) {
        console.error(`Error fetching products in category "${category}":`, error);
        throw new Error(`Failed to fetch products in category "${category}"`);
    }
}

export async function getAllProductCategories() {
    const apiUrl = "https://dummyjson.com/products/categories";

    try {
        const response = await fetch(apiUrl, {
            next: { revalidate: 1800 } // Cache product categories for 30 minutes
        });
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error("Error fetching product categories:", error);
        throw new Error("Failed to fetch product categories");
    }
}

// ---------------- Product CRUD (Add / Update / Delete) ----------------

export async function addProduct(productData: Record<string, unknown>) {
    try {
        const response = await fetch('https://dummyjson.com/products/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        const result = await response.json();
        return { success: response.ok, data: result };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, error: 'Failed to add product' };
    }
}

export async function updateProduct(id: number, productData: Record<string, unknown>) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        const result = await response.json();
        return { success: response.ok, data: result };
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        return { success: false, error: 'Failed to update product' };
    }
}

export async function deleteProduct(id: number) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        return { success: response.ok, data: result };
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        return { success: false, error: 'Failed to delete product' };
    }
}

// ---------------- Cart Actions (Create / Update / Delete) ----------------

export async function addCartApi(userId: number, products: { id: number; quantity: number }[]) {
    try {
        const response = await fetch('https://dummyjson.com/carts/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, products }),
        });
        const result = await response.json();
        return { success: response.ok, data: result };
    } catch (error) {
        console.error("Error adding to cart:", error);
        return { success: false, error: 'Failed to create cart' };
    }
}

export async function updateCartApi(cartId: number, products: { id: number; quantity: number }[]) {
    try {
        const response = await fetch(`https://dummyjson.com/carts/${cartId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ merge: true, products }),
        });
        const result = await response.json();
        return { success: response.ok, data: result };
    } catch (error) {
        console.error(`Error updating cart ${cartId}:`, error);
        return { success: false, error: 'Failed to update cart' };
    }
}

export async function deleteCartApi(cartId: number) {
    try {
        const response = await fetch(`https://dummyjson.com/carts/${cartId}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        return { success: response.ok, data: result };
    } catch (error) {
        console.error(`Error deleting cart ${cartId}:`, error);
        return { success: false, error: 'Failed to delete cart' };
    }
}