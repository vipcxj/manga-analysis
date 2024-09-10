'use client';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectCurrentMangaStatus, selectCurrentMangaInfo, selectCurrentMangaDetail, setCurrentMangaPage } from '@/lib/features/mangas/mangasSlice';
import MangaCard, { LoadingSkeleton as MangaCardSkeleton } from '@/components/mangas/card';
import { MangaDetail } from '@/lib/mongo/type';
import { range } from '@/lib/utils/array';
import React from 'react';
import { useRouter } from 'next/navigation';

function isValidManga(manga: MangaDetail | null) {
    return manga && manga.download_pages && manga.images && manga.images.pages 
        && manga.download_pages.length === manga.pages && manga.images.pages.length === manga.pages;
}

export default function Preview() {
    const mangaInfo = useAppSelector(selectCurrentMangaInfo);
    const mangaDetail = useAppSelector(selectCurrentMangaDetail);
    const detailStatus = useAppSelector(selectCurrentMangaStatus);
    const dispatch = useAppDispatch();
    const router = useRouter();
    if (detailStatus === 'failed' || !mangaInfo?.pages) {
        return null;
    }
    if (detailStatus === 'loading') {
        return (
            <div className='flex flex-wrap'>
                { range(mangaInfo.pages).map(i => (<MangaCardSkeleton key={i} />)) }
            </div>
        )
    }
    if (!isValidManga(mangaDetail)) {
        return null;
    }
    return (
        <div className='flex flex-wrap justify-center mt-3'>
            { mangaDetail?.download_pages.map((page, i) => (
                <MangaCard
                    key={i}
                    path={page.path}
                    onClick={() => {
                        dispatch(setCurrentMangaPage(i));
                        router.push('/page');
                    }}
                />
            )) }
        </div>
    )
}