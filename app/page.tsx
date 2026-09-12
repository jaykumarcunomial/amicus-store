import Link from "next/link";
import { PlusIcon } from "@heroicons/react/20/solid";

import { getProducts, getProductsByCategory, searchProducts } from "./actions";
import { ProductQueryOptions, ProductItem } from "./types";

import SearchBox from "./components/SearchBox";
import ProductsGrid from "./components/ProductsGrid";
import SortDropdown from "./components/SortDropdown";
import Pagination from "./components/Pagination";

interface ProductsPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.query || '';
  const selectedCategory = resolvedParams?.category || '';
  const sortBy = resolvedParams?.sortBy || '';
  const order = resolvedParams?.order as 'asc' | 'desc' | undefined;
  const currentPage = Math.max(1, parseInt(resolvedParams?.page || '1', 10));
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  const queryOptions: ProductQueryOptions = {
    limit,
    skip,
    sortBy: sortBy || undefined,
    order: order || undefined,
  };

  const productsResponse = searchQuery
    ? await searchProducts(searchQuery, queryOptions)
    : selectedCategory
      ? await getProductsByCategory(selectedCategory, queryOptions)
      : await getProducts(queryOptions);

  const products: ProductItem[] = productsResponse?.products || [];
  const total = productsResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const getHeading = () => {
    if (selectedCategory) {
      return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace(/-/g, ' ')}`;
    }
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }
    return "All Products";
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-5 sm:px-6 lg:max-w-7xl lg:px-8">

        {/* Search Bar & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1">
            <SearchBox />
          </div>
          <Link
            href="/product/add"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <PlusIcon className="size-4" />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Heading & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">{getHeading()}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {total} {total === 1 ? 'product found' : 'products found'}
            </p>
          </div>
          <SortDropdown />
        </div>

        {/* Products Grid */}
        <ProductsGrid products={products} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          limit={limit}
        />
      </div>
    </div>
  );
}
