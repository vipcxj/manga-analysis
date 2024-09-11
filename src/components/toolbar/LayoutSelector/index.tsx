'use client';
import { Select } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { MangaLayout, selectCurrentMangaLayout, setCurrentMangaLayout } from '@/lib/features/mangas/mangasSlice';
import clsx from 'clsx';
import React from 'react';

const MangaLayout2Name = {
    'fit-width': '适配宽度',
    'fit-height': '适配高度',
    'original': '原始大小',
};

export default function LayoutSelector() {
    const dispatch = useAppDispatch();
    const layout = useAppSelector(selectCurrentMangaLayout);
    const handleLayoutChange: React.ChangeEventHandler<HTMLSelectElement> = React.useCallback((e) => {
        dispatch(setCurrentMangaLayout(e.target.value as MangaLayout));
    }, [dispatch]);
    return (
        <div className='relative'>
            <Select 
                className={clsx(
                    'm-1.5 py-0.5 pl-2 pr-6 block appearance-none',
                    'rounded-lg border-none',
                    'bg-black/10 text-xs/6 text-black/60',
                    'hover:bg-black/20 hover:text-black/80',
                    'active:ring-1 active:ring-blue-500/50'
                )}
                value={layout}
                onChange={handleLayoutChange}
            >
                <option value="fit-width">{ MangaLayout2Name['fit-width'] }</option>
                <option value="fit-height">{ MangaLayout2Name['fit-height'] }</option>
                <option value="original">{ MangaLayout2Name['original'] }</option>
            </Select>
            <ChevronDownIcon
                className="group pointer-events-none absolute top-3 right-3 size-4 fill-black/50"
                aria-hidden="true"
            />
        </div>
    );
}