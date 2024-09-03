import { type NextRequest } from 'next/server'
import { parseSearchCode } from '@/lib/ssearch/lang';
import { toAggregation } from '@/lib/ssearch/mongo';
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
    let op = col.aggregate(aggregation).skip(skip).limit(limit);
    if (sort) {
        op = op.sort(sort);
    }
    const docs: Document[] = [];
    for await (const doc of op) {
        docs.push(doc);
    }
    return docs;
}