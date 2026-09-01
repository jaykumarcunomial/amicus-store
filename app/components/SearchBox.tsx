'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

// Custom lightweight debounce hook
function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number) {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    );
}

export default function SearchBox({ placeholder = 'Search...' }: { placeholder?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const query = searchParams.get('query') || '';
    const [searchTerm, setSearchTerm] = useState(query);

    useEffect(() => {
        setSearchTerm(query);
    }, [query]);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (term) {
            params.set('query', term);
            params.delete('category');
        } else {
            params.delete('query');
        }

        const targetUrl = pathname === '/' ? `/?${params.toString()}` : `/?${params.toString()}`;

        startTransition(() => {
            router.replace(targetUrl, { scroll: false });
        });
    }, 300);

    return (
        <div className="relative">
            <input
                type="text"
                className="block w-full rounded-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                }}
            />
            {isPending && (
                <span className="absolute right-3 top-2.5 text-sm text-gray-400 animate-pulse">
                    Searching...
                </span>
            )}
        </div>
    );
}