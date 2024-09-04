import { MongoClient, MongoClientOptions } from 'mongodb';
import mongoConf from '@/conf/mongo';

const opts: MongoClientOptions = {
    auth: {
        username: mongoConf.user,
        password: mongoConf.pass,
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
        globalWithMongo._mongoClient = new MongoClient(mongoConf.connectString, opts);
    }
    client = globalWithMongo._mongoClient;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(mongoConf.connectString, opts);
}

export default client;

export async function dbMangas() {
    const conn = await client.connect();
    return conn.db(mongoConf.db);
}

export async function colMangas() {
    const db = await dbMangas();
    return db.collection(mongoConf.colManga);
}