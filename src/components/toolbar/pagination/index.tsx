'use client';
import PurePagination from './pure';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectCurrentMangaInfo, selectCurrentMangaPage, setCurrentMangaPage } from '@/lib/features/mangas/mangasSlice';
import React from 'react';

export default function Pagination() {
    const dispatch = useAppDispatch();
    const currentPage = useAppSelector(selectCurrentMangaPage);
    const onCurrentPageSet = React.useCallback((page: number) => {
        dispatch(setCurrentMangaPage(page - 1));
    }, [dispatch]);
    const mangInfo = useAppSelector(selectCurrentMangaInfo);
    if (!mangInfo || currentPage === -1) {
        return null;
    }
    return (
        <PurePagination
            currentPage={currentPage + 1}
            setCurrentPage={onCurrentPageSet}
            maxPage={mangInfo.pages}
        />
    );
}