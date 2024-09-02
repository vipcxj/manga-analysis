export const searchMangas = async (expr: string, skip?: number, limit?: number) => {
    return fetch('/api/mangas', {
        body: JSON.stringify({
            code: expr,
            skip,
            limit,
        }),
    }).then(res => res.json());
}