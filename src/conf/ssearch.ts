export interface CompletionPropertyInfo {
    name: string;
    friend?: string;
    friendNoSkip?: boolean;
    desc?: string;
    snippet?: string;
}

export const properties: CompletionPropertyInfo[] = [
    {
        name: 'artists',
    },
    {
        name: 'categories',
    },
    {
        name: 'characters',
    },
    {
        name: 'groups',
    },
    {
        name: 'languages',
    },
    {
        name: 'tags',
    },
    {
        name: 'title_english',
    },
    {
        name: 'title_japanese',
    },
    {
        name: 'title_pretty',
    },
];