export interface MongoConfigure {
    connectString: string;
    user?: string;
    pass?: string;
    db: string;
}

const config: MongoConfigure = {
    connectString: 'mongodb://127.0.0.1',
    db: 'mangas',
};

export default config;