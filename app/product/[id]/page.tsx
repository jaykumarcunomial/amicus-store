import type { Metadata } from 'next'
import { getProductById } from '@/app/actions'
import ProductDetailClient from '@/app/components/ProductDetailClient'

interface ProductDetailsPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
        return { title: 'Product Details' };
    }

    try {
        const product = await getProductById(numId);
        const title = product.title || product.name || 'Product Details';
        const description = product.description?.slice(0, 160) || 'View product details on NextStore';
        const imageUrl = product.thumbnail || (product.images && product.images[0]) || '';

        return {
            title: `${title} | NextStore`,
            description,
            openGraph: {
                title: `${title} | NextStore`,
                description,
                images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: imageUrl ? [imageUrl] : [],
            },
        };
    } catch {
        return {
            title: 'Product Details | NextStore',
            description: 'View product details',
        };
    }
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const product = await getProductById(numId);

    const title = product.title || product.name || 'Product';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        image: product.images || [product.thumbnail],
        description: product.description,
        sku: product.sku || `SKU-${product.id}`,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'Generic',
        },
        offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price,
            availability: (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
        aggregateRating: product.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviews?.length || 1,
            }
            : undefined,
    };

    return (
        <>
            {/* JSON-LD Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailClient initialProduct={product} />
        </>
    );
}
