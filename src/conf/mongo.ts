export interface MongoConfigure {
    connectString: string;
    user?: string;
    pass?: string;
    db: string;
    colManga: string;
}

const config: MongoConfigure = {
    connectString: 'mongodb://127.0.0.1',
    db: 'mangas',
    colManga: 'manga',
};

export default config;