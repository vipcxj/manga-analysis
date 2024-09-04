import { NextRequest, NextResponse } from "next/server";
import { localImageUrl } from '@/conf/manga';
import fs from 'fs/promises';
import mime from 'mime-types';

function isLocalhost(host: string | null) {
    if (!host) {
        return false;
    }
    return host === 'localhost' || host.startsWith('localhost:') || host === '127.0.0.1' || host.startsWith('127.0.0.1:');
}

export async function GET(req: NextRequest, { params }: { params: { slug: string[] }}) {
    const host = req.headers.get('x-my-host');
    if (isLocalhost(host)) {
        return NextResponse.redirect(localImageUrl(params.slug.join('/'), true));
    } else {
        let fileHandle: fs.FileHandle | null = null;
        try {
            const path = localImageUrl(params.slug.join('/'), false);
            const contentType = mime.lookup(path);
            const stats = await fs.stat(path);
            fileHandle = await fs.open(path);
            const stream = fileHandle.readableWebStream({ type: 'bytes' });
            return new Response(stream as any, {
                status: 200,
                headers: new Headers({
                    'content-type': contentType || 'application/octet-stream',
                    // 'content-length': `${stats.size}`,
                }),
            });
        } catch (err: any) {
            if ('code' in err && err.code === 'ENOENT') {
                return new Response(null, {
                    status: 404,
                });
            } else {
                return new Response(`${err}`, {
                    status: 500,
                });
            }
        } finally {
            if (fileHandle) {
                await fileHandle.close();
            }
        }
    }
}