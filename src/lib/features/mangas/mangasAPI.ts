import { MangaInfo, MangaDetail } from '@/lib/mongo/type';

export const searchMangas = async (expr: string, skip?: number, limit?: number) => {
    return fetch('/api/mangas/search', {
        method: 'POST',
        body: JSON.stringify({
            code: expr,
            skip,
            limit,
        }),
    }).then(res => res.json() as Promise<{
        paginatedResults: MangaInfo[],
        total: number,
    }>);
}

export const getMangaDetail = async (id: string) => {
    return fetch(`/api/mangas/${id}`).then(res => res.json() as Promise<MangaDetail | null>)
}