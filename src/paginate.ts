export async function* paginate<R>(
    requestFunc: (page: number) => Promise<R[]>,
    searchLimit: number
): AsyncGenerator<R> {
    let page = 1;
    let i = 0;
    while (true) {
        const data = await requestFunc(page);
        if (data.length === 0) {
            return;
        }
        for (const item of data) {
            yield item;
            ++i;
            if (i >= searchLimit) {
                return;
            }
        }
        ++page;
    }
}

export async function findInItems<R>(
    generator: AsyncGenerator<R>,
    predicate: (release: R) => Promise<boolean>
): Promise<R|undefined> {
    for await (const item of generator) {
        const predicateResult = await predicate(item);
        if (predicateResult) {
            return item;
        }
    }
    return undefined;
}