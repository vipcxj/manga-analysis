import { parser } from '@/lezer/search.lang';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { CompletionContext } from '@codemirror/autocomplete';
import { Extension, StateField } from '@codemirror/state';
import { styleTags, tags as t } from '@lezer/highlight';
import { completionSource, CompletionDataProvider } from './autocomplete';
import { extraState, SSearchLangData } from './langdata';
import { linter } from '@codemirror/lint';
import { lintSource } from './linter';

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
});

export function search(dataProvider: CompletionDataProvider = { properties: [] }): [StateField<SSearchLangData>, LanguageSupport, Extension] {
    return [
        extraState,
        new LanguageSupport(searchLanguage, [
            searchLanguage.data.of({
                autocomplete: (ctx: CompletionContext) => completionSource(ctx, dataProvider),
            })
        ]),
        linter(lintSource),
    ];
}