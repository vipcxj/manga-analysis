import type { MangaInfo } from '@/lib/mongo/type';
import Image from 'next/image';

export interface MangaInfoCardProps {
    info: MangaInfo;
}

export default function MangaInfoCard({ info }: MangaInfoCardProps) {
    const preview = info.preview!;
    return (
        <div className='relative w-48 h-48 p-2 m-3 rounded-xl bg-slate-50 ring-4'>
            <div className='w-full h-full bg-contain bg-center bg-no-repeat' style={{ backgroundImage: `url(/api/mangas/images/${preview.path})` }}></div>
            <div className='absolute w-full h-12 left-0 bottom-0 z-30 bg-black bg-opacity-50 flex items-center text-slate-50 text-xs'>
                <div className='grow text-center'>{info.title_pretty}</div>
            </div>
        </div>
    );
}