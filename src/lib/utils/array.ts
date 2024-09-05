export function range(to: number, from: number = 0) {
    const out: number[] = [];
    for (let i = from; i < to; ++i) {
        out.push(i);
    }
    return out;
}