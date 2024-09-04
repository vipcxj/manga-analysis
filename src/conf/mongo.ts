export interface MongoConfigure {
    connectString: string;
    user?: string;
    pass?: string;
    db: string;
    colManga: string;
}

let uri: string;
if (process.env.MONGODB_URI) {
    uri = process.env.MONGODB_URI;
} else {
    uri = 'mongodb://127.0.0.1:27017';
}
let user: string | undefined;
if (process.env.MONGODB_USER) {
    user = process.env.MONGODB_USER;
}
let pass: string | undefined;
if (process.env.MONGODB_PASS) {
    pass = process.env.MONGODB_PASS;
}
let mangasDbName: string;
if (process.env.MONGODB_DB) {
    mangasDbName = process.env.MONGODB_DB;
} else {
    mangasDbName = 'mangas';
}
let mangaColName: string;
if (process.env.MONGODB_COL_MANGA) {
    mangaColName = process.env.MONGODB_COL_MANGA;
} else {
    mangaColName = 'manga';
}

const config: MongoConfigure = {
    connectString: uri,
    user,
    pass,
    db: mangasDbName,
    colManga: mangaColName,
};

export default config;