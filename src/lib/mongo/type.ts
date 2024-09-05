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

export interface ImageInfo {
    t: 'j' | 'p' | 'g',
    w: number;
    h: number;
}

export interface PageInfo {
    url: string;
    path: string;
    checksum: string;
    status: string;
}

export interface MangaDetail extends MangaInfo {
    images: {
        cover?: ImageInfo;
        thumbnail?: ImageInfo;
        pages: ImageInfo[];
    };
    download_pages: PageInfo[];
}