import { NextRequest, NextResponse } from "next/server";
import { localImageUrl } from '@/conf/manga';
import { streamFile } from '@/lib/utils/stream';
import fs from 'fs/promises';
import mime from 'mime-types';

export async function GET(req: NextRequest, { params }: { params: { slug: string[] }}) {
    try {
        const path = localImageUrl(params.slug.join('/'));
        const contentType = mime.lookup(path);
        const stats = await fs.stat(path);
        const stream =  streamFile(path);
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
    }
}