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
    const { code, skip = 0, limit = 10, sort }: SearchReq = await req.json();
    const pipeline = parseSearchCode(code);
    let aggregation: Document[] = toAggregation(pipeline);
    aggregation = [
        ...aggregation,
        {
            $project: {
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
                                { $ne: [{ $type: '$download_pages' }, 'missing'] },
                                { $ne: [{ $size: '$download_pages' }, 0] },
                                { $ne: [{ $type: '$images.pages' }, 'missing'] },
                                { $ne: [{ $size: '$images.pages' }, 0] },
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
            },
        },
    ];
    if (sort) {
        aggregation.push({
            $sort: sort,
        });
    }
    aggregation.push({
        $facet: {
            paginatedResults: [{ $skip: skip }, { $limit: limit }],
            totalCount: [
                {
                    $count: 'total',
                },
            ],
        },
    });
    aggregation.push({
        $project: {
            paginatedResults: 1,
            total: { $arrayElemAt: ['$totalCount.total', 0] }
        }
    });
    const col = await colMangas();
    const results = await col.aggregate(aggregation).toArray();
    const result = results[0] as {
        paginatedResults: MangaInfo[],
        total: number,
    };
    return NextResponse.json(result);
}