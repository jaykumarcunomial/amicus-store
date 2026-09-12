'use client';

import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface SearchBoxProps {
    placeholder?: string;
    value?: string;
    onChange?: (term: string) => void;
    onSearch?: (term: string) => void;
    debounceMs?: number;
    clearCategoryOnSearch?: boolean;
    iconSlot?: React.ReactNode;
    className?: string;
}

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

export default function SearchBox({
    placeholder = 'Search...',
    value,
    onChange,
    onSearch,
    debounceMs = 300,
    clearCategoryOnSearch = true,
    iconSlot,
    className = '',
}: SearchBoxProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const queryFromUrl = searchParams.get('query') || '';
    const [searchTerm, setSearchTerm] = useState(value !== undefined ? value : queryFromUrl);

    useEffect(() => {
        if (value !== undefined) {
            setSearchTerm(value);
        } else {
            setSearchTerm(queryFromUrl);
        }
    }, [value, queryFromUrl]);

    const handleSearch = useDebouncedCallback((term: string) => {
        if (onSearch) {
            onSearch(term);
            return;
        }

        // Default URL navigation behavior
        const params = new URLSearchParams(searchParams.toString());

        if (term) {
            params.set('query', term);
            if (clearCategoryOnSearch) {
                params.delete('category');
            }
        } else {
            params.delete('query');
        }

        const targetUrl = pathname === '/' ? `/?${params.toString()}` : `/?${params.toString()}`;

        startTransition(() => {
            router.replace(targetUrl, { scroll: false });
        });
    }, debounceMs);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = e.target.value;
        setSearchTerm(nextValue);
        if (onChange) {
            onChange(nextValue);
        }
        handleSearch(nextValue);
    };

    return (
        <div className={`relative ${className}`}>
            {iconSlot && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {iconSlot}
                </div>
            )}
            <input
                type="text"
                className={`block w-full rounded-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500 ${iconSlot ? 'pl-9' : ''
                    }`}
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleChange}
            />
            {isPending && (
                <span className="absolute right-3 top-2.5 text-sm text-gray-400 animate-pulse">
                    Searching...
                </span>
            )}
        </div>
    );
}