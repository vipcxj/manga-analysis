import { NextResponse, type NextRequest } from 'next/server'
import { parseSearchCode } from '@/lib/ssearch/lang';
import { toAggregation } from '@/lib/ssearch/mongo';
import type { MangaInfo } from '@/lib/mongo/type';
import { colMangas } from '@/lib/mongo';
import { Document, Sort } from 'mongodb';

export interface SearchReq {
    code: string;
    skip?: number;
    limit?: number;
    sort?: Sort
}

export async function POST(req: NextRequest) {
    const {code, skip = 0, limit = 10, sort }: SearchReq = await req.json();
    const pipeline = parseSearchCode(code);
    const aggregation = toAggregation(pipeline);
    const col = await colMangas();
    let op = col.aggregate(aggregation).project<MangaInfo>({
        spider: true,
        id: true,
        title_english: true,
        title_japanese: true,
        title_pretty: true,
        artists: true,
        categories: true,
        groups: true,
        languages: true,
        characters: true,
        tags: true,
        parodies: true,
        pages: true,
        num_favorites: true,
        upload_date: true,
        preview: {
            $cond: {
                if: {
                    $and: [
                        { $ne: [ { $type: '$download_pages' }, 'missing'] },
                        { $ne: [ { $size: '$download_pages' }, 0]},
                        { $ne: [ { $type: '$images.pages' }, 'missing'] },
                        { $ne: [ { $size: '$images.pages' }, 0]},
                    ],
                },
                then: {
                    path: {
                        $getField: {
                            field: 'path',
                            input: {
                                $first: '$download_pages',
                            }
                        }
                    },
                    width: {
                        $getField: {
                            field: 'w',
                            input: {
                                $first: '$images.pages',
                            },
                        }
                    },
                    height: {
                        $getField: {
                            field: 'h',
                            input: {
                                $first: '$images.pages',
                            },
                        }
                    },
                },
                else: 0,
            },
        },
    }).skip(skip).limit(limit);
    if (sort) {
        op = op.sort(sort);
    }
    const docs: Document[] = [];
    for await (const doc of op) {
        docs.push(doc);
    }
    return NextResponse.json(docs);
}