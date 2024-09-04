import fs from 'fs';

export async function* nodeStreamToIterator(stream: fs.ReadStream) {
    try {
        for await (const chunk of stream) {
            yield new Uint8Array(chunk);
        }
    } finally {
        stream.close();
    }
}

export function iteratorToStream(iterator: AsyncGenerator<Uint8Array, void, unknown>) {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
    });
}

export function streamFile(path: string): ReadableStream {
    const nodeStream = fs.createReadStream(path);
    const data: ReadableStream = iteratorToStream(
        nodeStreamToIterator(
            nodeStream
        )
    )
    return data
}