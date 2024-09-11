'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    search,
    selectMangaInfoList,
    selectMangaInfoPage,
    selectMangaInfoCount,
    selectMangaInfoPerPage,
    setMangaInfoPage,
    setCurrentManga
} from '@/lib/features/mangas/mangasSlice';
import MangaCard from './card';
import PurePagination from '../toolbar/pagination/pure';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface MangasProps {

}

export default function Mangas() {
    const dispatch = useAppDispatch();
    const mangas = useAppSelector(selectMangaInfoList);
    const page = useAppSelector(selectMangaInfoPage);
    const count = useAppSelector(selectMangaInfoCount);
    const perPage = useAppSelector(selectMangaInfoPerPage);
    const onPage = React.useCallback((page: number) => {
        dispatch(setMangaInfoPage(page - 1));
        dispatch(search(null));
    }, [dispatch]);
    const router = useRouter();
    return (
        <div className='flex flex-col items-center'>
            <div>
                { page >= 0 ? <PurePagination currentPage={page + 1} setCurrentPage={onPage} maxPage={Math.ceil(count / perPage)} /> : null }
            </div>
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
        </div>
    )
}