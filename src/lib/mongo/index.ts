import { MongoClient, MongoClientOptions } from 'mongodb';
import mongoConf from '@/conf/mongo';

let uri: string;
if (process.env.MONGODB_URI) {
    uri = process.env.MONGODB_URI;
} else {
    uri = mongoConf.connectString;
}
let user: string | undefined;
if (process.env.MONGODB_USER) {
    user = process.env.MONGODB_USER;
} else {
    user = mongoConf.user;
}
let pass: string | undefined;
if (process.env.MONGODB_PASS) {
    pass = process.env.MONGODB_PASS;
} else {
    pass = mongoConf.pass;
}
let mangasDbName: string;
if (process.env.MONGODB_DB) {
    mangasDbName = process.env.MONGODB_DB;
} else {
    mangasDbName = mongoConf.db;
}
let mangasColName: string;
if (process.env.MONGODB_COL) {
    mangasColName = process.env.MONGODB_COL;
} else {
    mangasColName = mongoConf.db;
}

const opts: MongoClientOptions = {
    auth: {
        username: user,
        password: pass,
    },
};

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient;
    };

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(uri, opts);
    }
    client = globalWithMongo._mongoClient;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, opts);
}

export default client;

export async function dbMangas() {
    const conn = await client.connect();
    return conn.db(mangasDbName);
}

export async function colMangas() {
    const db = await dbMangas();
    return db.collection(mangasColName);
}