'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectMangaInfoList, setCurrentManga } from '@/lib/features/mangas/mangasSlice';
import MangaCard from './card';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface MangasProps {

}

export default function Mangas() {
    const dispatch = useAppDispatch();
    const mangas = useAppSelector(selectMangaInfoList);
    const router = useRouter();
    return (
        <div className='flex flex-col items-center w-full'>
            { mangas.map(manga => (
                <MangaCard
                    key={manga._id} 
                    path={manga.preview?.path} 
                    title={manga.title_pretty}
                    onClick={() => {
                        dispatch(setCurrentManga(manga._id));
                        router.push(`/preview`);
                    }}
                />
            )) }
        </div>
    )
}