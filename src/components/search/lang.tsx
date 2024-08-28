import { parser } from '@/lezer/search.lang';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { CompletionContext } from '@codemirror/autocomplete';
import { styleTags, tags as t } from '@lezer/highlight';
import { completionSource, CompletionDataProvider } from './autocomplete';

export const searchLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Identifier: t.variableName,
                String: t.string,
                Number: t.number,
                match: t.keyword,
                OpAnd: t.keyword,
                OpOr: t.keyword,
                "true false": t.bool,
                CmpOp: t.compareOperator,
                ArithOp: t.arithmeticOperator,
                "( )": t.paren,
            }),
        ],
    }),
    languageData: {
        closeBrackets: {
            brackets: ["(", "[", "'", '"'],
        },
    },
})

export const searchCompletion = searchLanguage.data.of({
    autocomplete: completionSource,
    // autocomplete: completeFromList([
    //     { label: 'test01', type: 'variable' },
    //     { label: 'test02', type: 'variable' },
    //     { label: 'test03', type: 'variable' },
    //     { label: 'match', type: 'keyword' },
    //     { label: 'or', type: 'keyword' },
    //     { label: 'and', type: 'keyword' },
    // ]),
});

export function search(dataProvider: CompletionDataProvider = { properties: [] }) {
    return new LanguageSupport(searchLanguage, [
        searchLanguage.data.of({
            autocomplete: (ctx: CompletionContext) => completionSource(ctx, dataProvider),
        })
    ]);
}