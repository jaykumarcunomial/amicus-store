import { ProductItem } from '@/app/context/CompareContext'

export const EDITED_PRODUCTS_STORAGE_KEY = 'dummyjson_edited_products'
export const DELETED_PRODUCTS_STORAGE_KEY = 'dummyjson_deleted_products'

// Checks if a product is marked as deleted in localStorage
export function isProductDeletedInStorage(productId: number): boolean {
    if (typeof window === 'undefined') return false
    try {
        const saved = localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) {
                if (parsed.includes(productId) || parsed.includes(String(productId))) {
                    return true
                }
            } else if (parsed && typeof parsed === 'object') {
                if (parsed[productId] || parsed[String(productId)]) {
                    return true
                }
            }
        }

        const singleDeleted = localStorage.getItem(`dummyjson_deleted_product_${productId}`)
        if (singleDeleted === 'true' || singleDeleted === '1') {
            return true
        }

        const altDeleted = localStorage.getItem('deleted_products') || localStorage.getItem('deletedProducts')
        if (altDeleted) {
            const parsedAlt = JSON.parse(altDeleted)
            if (Array.isArray(parsedAlt)) {
                if (parsedAlt.includes(productId) || parsedAlt.includes(String(productId))) {
                    return true
                }
            } else if (parsedAlt && typeof parsedAlt === 'object') {
                if (parsedAlt[productId] || parsedAlt[String(productId)]) {
                    return true
                }
            }
        }

        // Check if stored in edited products with isDeleted flag
        const editedSaved = localStorage.getItem(EDITED_PRODUCTS_STORAGE_KEY)
        if (editedSaved) {
            const map = JSON.parse(editedSaved)
            if (map && (map[productId]?.isDeleted || map[String(productId)]?.isDeleted)) {
                return true
            }
        }

        const singleEdited = localStorage.getItem(`dummyjson_product_${productId}`)
        if (singleEdited) {
            const parsedSingle = JSON.parse(singleEdited)
            if (parsedSingle?.isDeleted) {
                return true
            }
        }
    } catch (err) {
        console.error('Failed to check if product is deleted in localStorage:', err)
    }
    return false
}

// Persists a deleted product ID to localStorage
export function markProductAsDeletedInStorage(productId: number): void {
    if (typeof window === 'undefined') return
    try {
        const saved = localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY)
        let map: Record<string | number, boolean> = {}
        if (saved) {
            try {
                map = JSON.parse(saved)
            } catch {
                map = {}
            }
        }
        if (Array.isArray(map)) {
            const arr = map as unknown as (number | string)[]
            if (!arr.includes(productId) && !arr.includes(String(productId))) {
                arr.push(productId)
            }
            localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(arr))
        } else {
            map[productId] = true
            localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(map))
        }
        localStorage.setItem(`dummyjson_deleted_product_${productId}`, 'true')

        // Clean up from edited products storage so stale data isn't preserved as active
        removeEditedProductFromStorage(productId)
    } catch (err) {
        console.error('Failed to mark product as deleted in localStorage:', err)
    }
}

// Retrieves a locally saved edited product by ID, if one exists in localStorage.
export function getStoredEditedProduct(productId: number): ProductItem | null {
    if (typeof window === 'undefined') return null
    try {
        const saved = localStorage.getItem(EDITED_PRODUCTS_STORAGE_KEY)
        if (saved) {
            const map = JSON.parse(saved)
            if (map && map[productId]) {
                return map[productId]
            }
        }
        const single = localStorage.getItem(`dummyjson_product_${productId}`)
        if (single) {
            return JSON.parse(single)
        }
    } catch (err) {
        console.error('Failed to get edited product from localStorage:', err)
    }
    return null
}

// Persists an edited product to localStorage.
export function saveEditedProductToStorage(product: ProductItem): void {
    if (typeof window === 'undefined') return
    try {
        const saved = localStorage.getItem(EDITED_PRODUCTS_STORAGE_KEY)
        const map = saved ? JSON.parse(saved) : {}
        map[product.id] = product
        localStorage.setItem(EDITED_PRODUCTS_STORAGE_KEY, JSON.stringify(map))
        localStorage.setItem(`dummyjson_product_${product.id}`, JSON.stringify(product))
    } catch (err) {
        console.error('Failed to save edited product to localStorage:', err)
    }
}

// Clears an edited product from localStorage (e.g. on deletion).
export function removeEditedProductFromStorage(productId: number): void {
    if (typeof window === 'undefined') return
    try {
        const saved = localStorage.getItem(EDITED_PRODUCTS_STORAGE_KEY)
        if (saved) {
            const map = JSON.parse(saved)
            delete map[productId]
            localStorage.setItem(EDITED_PRODUCTS_STORAGE_KEY, JSON.stringify(map))
        }
        localStorage.removeItem(`dummyjson_product_${productId}`)
    } catch (err) {
        console.error('Failed to remove edited product from localStorage:', err)
    }
}

