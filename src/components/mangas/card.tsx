import type { MangaInfo } from '@/lib/mongo/type';
import Image from 'next/image';

export interface MangaInfoCardProps {
    info: MangaInfo;
}

export default function MangaInfoCard({ info }: MangaInfoCardProps) {
    const preview = info.preview!;
    return (
        <div className='w-48 h-48 m-3 rounded-xl bg-white ring-4'>
            <Image src={`/api/mangas/images/${preview.path}`} width={preview.width} height={preview.height} alt='' />
        </div>
    );
}