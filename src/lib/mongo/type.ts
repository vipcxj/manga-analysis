export interface MangaInfo {
    _id: string;
    spider: string;
    id: number;
    title_english: string;
    title_japanese: string;
    title_pretty: string;
    artists: string[];
    categories: string[];
    groups: string[];
    languages: string[];
    characters: string[];
    tags: string[];
    parodies: string[];
    pages: number;
    num_favorites: number;
    upload_date: string;
    preview?: {
        path: string,
        width: number,
        height: number,
    };
}