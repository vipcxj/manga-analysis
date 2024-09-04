import path from "path";
import { exit } from "process";

export interface MangaConfig {
    imageRoot: string;
}

let imageRoot: string;
if (process.env.MANGA_IMAGE_ROOT) {
    imageRoot = process.env.MANGA_IMAGE_ROOT;
} else {
    console.error('env MANGA_IMAGE_ROOT is required.');
    exit(1);
}
if (!path.isAbsolute(imageRoot)) {
    console.error(`env MANGA_IMAGE_ROOT must be a absolute path, but got ${imageRoot}.`);
}

const config: MangaConfig = {
    imageRoot,
};

export function localImageUrl(p: string, browser: boolean) {
    let ap = path.resolve(imageRoot, p);
    if (path.sep === '\\') {
        ap = ap.replaceAll('\\', '/');
    }
    return browser ? `file:/${ap}` : ap;
}

export default config;