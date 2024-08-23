import { parser } from '@/lezer/search.lang';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { autocompletion, closeBrackets, completeFromList } from '@codemirror/autocomplete';
import { styleTags, tags as t } from '@lezer/highlight';

export const searchLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Identifier: t.variableName,
                String: t.string,
                Number: t.number,
                match: t.keyword,
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
    autocompletion: completeFromList([
        { label: 'test01', type: 'Identifier' },
        { label: 'test02', type: 'Identifier' },
        { label: 'test03', type: 'Identifier' },
        { label: 'match', type: 'match' },
    ]),
});

export function search() {
    return new LanguageSupport(searchLanguage, [searchCompletion]);
}