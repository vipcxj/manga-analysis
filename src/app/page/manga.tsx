import { CSSProperties } from 'react';

export interface MangaProps {
    width: number;
    height: number;
    path: string;
    mode: 'original' | 'fit-width' | 'fit-height';
}

export default function Manga(props: MangaProps) {
    const { width, height, path, mode = 'fit-width' } = props;
    const style: CSSProperties = {
        backgroundImage: `url(/api/mangas/images/${path})`,
    };
    if (mode === 'original') {
        style.width = width;
        style.height = height;
    } else if (mode === 'fit-width') {
        style.width = '100%';
        style.aspectRatio = `${width / height}`;
    } else {
        style.height = '100%';
        style.aspectRatio = `${width / height}`;
    }
    return (
        <div
            className='bg-cover bg-no-repeat'
            style={style}
        ></div>
    );
}