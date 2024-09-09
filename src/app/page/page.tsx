'use client';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectCurrentMangaDetail, selectCurrentMangaPage, nextCurrentMangaPage, prevCurrentMangaPage } from '@/lib/features/mangas/mangasSlice';
import Manga from './manga';
import { MangaDetail } from '@/lib/mongo/type';
import React from 'react';

function getMangaInfo(detail: MangaDetail | null, page: number) {
    if (page >= 0 && detail?.images.pages && detail.images.pages.length > page && detail?.download_pages && detail.download_pages.length > page) {
        const { w, h } = detail.images.pages[page];
        const { path } = detail.download_pages[page];
        return {
            width: w,
            height: h,
            path,
        }
    } else {
        return null;
    }
}

export default function Page() {
    const mangaDetail = useAppSelector(selectCurrentMangaDetail);
    const mangaPage = useAppSelector(selectCurrentMangaPage);
    const mangaInfo = getMangaInfo(mangaDetail, mangaPage);
    const dispatch = useAppDispatch();
    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = React.useCallback((evt) => {
        if (evt.key === 'a' || evt.key === 'ArrowLeft') {
            dispatch(prevCurrentMangaPage());
        } else if (evt.key === 'd' || evt.key === 'ArrowRight') {
            dispatch(nextCurrentMangaPage());
        }
    }, [dispatch]);
    if (!mangaInfo) {
        return null;
    }
    return (
        <div className="w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
            <Manga width={mangaInfo.width} height={mangaInfo.height} path={mangaInfo.path} mode='fit-width' />
        </div>
    );
}