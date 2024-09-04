'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectMangaInfoList, selectSearchStatus } from '@/lib/features/mangas/mangasSlice';
import MangaCard from './card';

export interface MangasProps {

}

export default function Mangas() {
    const dispatch = useAppDispatch();
    const mangas = useAppSelector(selectMangaInfoList);
    return (
        <div className='flex flex-col items-center w-full'>
            { mangas.map(manga => (
                <MangaCard key={manga._id} info={manga} />
            )) }
        </div>
    )
}