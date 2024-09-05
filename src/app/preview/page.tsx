'use client';
import { useAppSelector } from '@/lib/hooks';
import { selectCurrentMangaStatus, selectCurrentMangaInfo, selectCurrentMangaDetail } from '@/lib/features/mangas/mangasSlice';
import MangaCard, { LoadingSkeleton as MangaCardSkeleton } from '@/components/mangas/card';
import { MangaDetail } from '@/lib/mongo/type';
import { range } from '@/lib/utils/array';

function isValidManga(manga: MangaDetail | null) {
    return manga && manga.download_pages && manga.images && manga.images.pages 
        && manga.download_pages.length === manga.pages && manga.images.pages.length === manga.pages;
}

export default function Preview() {
    const mangaInfo = useAppSelector(selectCurrentMangaInfo);
    const mangaDetail = useAppSelector(selectCurrentMangaDetail);
    const detailStatus = useAppSelector(selectCurrentMangaStatus);
    if (detailStatus === 'failed' || !mangaInfo?.pages) {
        return null;
    }
    if (detailStatus === 'loading') {
        return (
            <div className='flex flex-wrap'>
                { range(mangaInfo.pages).map(i => (<MangaCardSkeleton />)) }
            </div>
        )
    }
    if (!isValidManga(mangaDetail)) {
        return null;
    }
    return (
        <div className='flex flex-wrap'>
            { mangaDetail?.download_pages.map((page, i) => (
                <MangaCard
                    key={i}
                    path={page.path}
                />
            )) }
        </div>
    )
}