import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    let host: string | null = req.headers.get('x-forwarded-host');
    if (!host) {
        host = req.headers.get('host');
    }
    req.headers.set('x-my-host', host || '');
    return NextResponse.next({
        request: {
            headers: req.headers,
        },
    });
}