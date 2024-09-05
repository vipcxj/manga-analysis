import { colMangas } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const col = await colMangas();
    const manga = await col.findOne({
        _id: new ObjectId(params.id),
    });
    return NextResponse.json(manga);
}