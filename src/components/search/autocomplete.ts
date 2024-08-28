import { Completion, CompletionContext, CompletionResult, snippetCompletion as snip } from "@codemirror/autocomplete"
import { SyntaxNode } from '@lezer/common';
import { CharStream, CommonTokenStream, Parser, TokenStream } from 'antlr4ng';
import { SSearchLexer } from '@/antlr/ssearch/parser/SSearchLexer';
import { SSearchParser } from '@/antlr/ssearch/parser/SSearchParser';
import { CodeCompletionCore, TokenList } from 'antlr4-c3';

const dontComplete = ["String", "Number"];

function getNearestNotErrorAncestor(node: SyntaxNode) {
    if (!node.parent) {
        return node.parent;
    }
    if (node.parent.type.isError) {
        return getNearestNotErrorAncestor(node.parent);
    } else {
        return node.parent;
    }
}

function directInPipeline(node: SyntaxNode) {
    const ancestor = getNearestNotErrorAncestor(node);
    return ancestor && ancestor.name == "Pipeline";
}

function calcCaretTokenIndex(ts: CommonTokenStream, pos: number): [number, number] {
    const tokens = ts.getTokens()
    let cti = -1;
    let i = 0
    for (const token of tokens) {
        if (token.start !== -1 && pos >= token.start && token.stop !== -1 && pos <= token.stop) {
            return [i, -1];
        } else if (token.start === pos && token.type === SSearchLexer.EOF) {
            if (i > 0) {
                const before = tokens[i - 1];
                if (before.type !== SSearchLexer.WS && before.stop !== -1 && before.stop === pos - 1) {
                    return [i, i - 1];
                } else {
                    return [i, -1];
                }
            } else {
                return [0, -1];
            }
        }
        ++i;
    }
    if (cti === -1) {
        if (tokens && tokens.length > 0) {
            const lastToken = tokens[tokens.length - 1];
            if (lastToken.stop !== -1 && pos <= lastToken.stop) {
                cti = tokens.length - 1;
            } else if (lastToken.type === SSearchLexer.EOF) {
                cti = tokens.length - 1;
            } else {
                cti = tokens.length;
            }
        } else {
            cti = 0;
        }
    }
    return [-1, -1];
}

export interface CompletionPropertyInfo {
    name: string;
    desc?: string;
}

export interface CompletionDataProvider {
    properties: CompletionPropertyInfo[];
}

interface CompletionData {
    completion: Completion;
}

type CompletionCreator = (provider: CompletionDataProvider) => CompletionData[];

function createStaticCompletions(completions: Completion[]): CompletionCreator {
    return () => completions.map(completion => ({ completion }));
}

function createKeywordCompletion(word: string): Completion {
    return {
        label: word,
        type: 'keyword',
    };
}

function createVariableCompletion(info: CompletionPropertyInfo): Completion {
    return {
        label: info.name,
        type: 'variable',
        detail: info.desc,
    };
}

function createOpCompletion(op: string): Completion {
    return {
        label: op,
        type: 'op',
    };
}

function createOtherCompletion(other: string): Completion {
    return {
        label: other,
        type: 'other',
    };
}

function createPropertiesCompletions(provider: CompletionDataProvider): CompletionData[] {
    return provider.properties.map(p => ({ completion: createVariableCompletion(p) }));
}

interface Token2Completions {
    [key: number]: CompletionCreator;
}

const TOKEN_TO_CANDS: Token2Completions = {
    [SSearchLexer.ADD]: createStaticCompletions([createOpCompletion('+')]),
    [SSearchLexer.AND]: createStaticCompletions([createKeywordCompletion('and')]),
    [SSearchLexer.CLOSE_PAR]: createStaticCompletions([createOtherCompletion(')')]),
    [SSearchLexer.COLON]: createStaticCompletions([createOtherCompletion(':')]),
    [SSearchLexer.DIV]: createStaticCompletions([createOpCompletion('/')]),
    [SSearchLexer.EQUAL]: createStaticCompletions([createOpCompletion('=')]),
    [SSearchLexer.GE]: createStaticCompletions([createOpCompletion('>=')]),
    [SSearchLexer.GT]: createStaticCompletions([createOpCompletion('>')]),
    [SSearchLexer.IDENTIFIER]: createPropertiesCompletions,
    [SSearchLexer.LE]: createStaticCompletions([createOpCompletion('<=')]),
    [SSearchLexer.LT]: createStaticCompletions([createOpCompletion('<')]),
    [SSearchLexer.MATCH]: createStaticCompletions([createKeywordCompletion('match')]),
    [SSearchLexer.MOD]: createStaticCompletions([createOpCompletion('%')]),
    [SSearchLexer.MUL]: createStaticCompletions([createOpCompletion('*')]),
    [SSearchLexer.NOT]: createStaticCompletions([createKeywordCompletion('not')]),
    [SSearchLexer.OPEN_PAR]: createStaticCompletions([createOtherCompletion('(')]),
    [SSearchLexer.OR]: createStaticCompletions([createKeywordCompletion('or')]),
    [SSearchLexer.PIPE]: createStaticCompletions([createKeywordCompletion('|')]),
    [SSearchLexer.SUB]: createStaticCompletions([createOpCompletion('-')]),
};

function combineCompletionDatas(data: CompletionData, others: TokenList, dataProvider: CompletionDataProvider) {
    if (!others) {
        return data;
    }
    const combined: CompletionData = { ...data };
    for (const other of others) {
        const creator = TOKEN_TO_CANDS[other];
        if (!creator) {
            return data;
        }
        const datas = creator(dataProvider);
        if (datas.length === 0) {
            return data;
        }
        if (combined.completion.type !== datas[0].completion.type) {
            return data;
        }
        combined.completion = {
            ...combined.completion,
            label: `${combined.completion.label} ${datas[0].completion.label}`,
        };
    }
    return combined;
}

export function completionSource(context: CompletionContext, dataProvider: CompletionDataProvider = { properties: [] }): CompletionResult | null {
    const code = context.state.doc.toString();
    const lexer = new SSearchLexer(CharStream.fromString(code));
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new SSearchParser(tokenStream);
    parser.removeErrorListeners();
    parser.pipeline();
    const [cti, cti1] = calcCaretTokenIndex(tokenStream, context.pos);
    if (cti === -1) {
        return null;
    }
    const c3 = new CodeCompletionCore(parser);
    c3.showResult = true;
    c3.ignoredTokens = new Set([
        SSearchLexer.STRING_LITERAL,
        SSearchLexer.DECIMAL_LITERAL,
        SSearchLexer.HEX_LITERAL,
        SSearchLexer.OCT_LITERAL,
        SSearchLexer.BINARY_LITERAL,
        SSearchLexer.FLOAT_LITERAL,
        SSearchLexer.HEX_FLOAT_LITERAL,
    ]);
    const completions: Completion[] = [];
    let from = context.pos;
    let found = false;
    if (cti1 !== -1) {
        const token1 = tokenStream.getTokens(cti1, cti1)[0];
        const token1Text = tokenStream.getTextFromRange(token1, token1);
        if (token1Text) {
            const cands1 = c3.collectCandidates(cti1);
            cands1.tokens.forEach((others, token) => {
                const creator = TOKEN_TO_CANDS[token]
                if (!!creator) {
                    const datas = creator(dataProvider);
                    datas.forEach(data => {
                        if (data.completion.label && data.completion.label.startsWith(token1Text)) {
                            found = true;
                            const combined = combineCompletionDatas(data, others, dataProvider);
                            completions.push(combined.completion);
                        }
                    });
                }
            });
        }
        if (found) {
            from = token1.start;
        }
    }
    if (!found) {
        const cands = c3.collectCandidates(cti);
        const token = tokenStream.getTokens(cti, cti)[0];
        const tokenText = tokenStream.getTextFromRange(token, token);
        cands.tokens.forEach((others, token) => {
            const creator = TOKEN_TO_CANDS[token]
            if (!!creator) {
                const datas = creator(dataProvider);
                datas.forEach(data => {
                    if (data.completion.label && (!tokenText || tokenText.startsWith(data.completion.label))) {
                        const combined = combineCompletionDatas(data, others, dataProvider);
                        completions.push(combined.completion);
                    }
                });
            }
        });
    }
    return {
        options: completions,
        from,
    };
}