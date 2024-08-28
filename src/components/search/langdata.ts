import { SSearchLexer } from "@/antlr/ssearch/parser/SSearchLexer";
import { SSearchParser } from "@/antlr/ssearch/parser/SSearchParser";
import { Diagnostic } from "@codemirror/lint";
import { EditorState, StateField } from "@codemirror/state";
import { CodeCompletionCore } from "antlr4-c3";
import { CommonTokenStream, CharStream, ANTLRErrorListener, ATNConfigSet, ATNSimulator, BitSet, DFA, Parser, RecognitionException, Recognizer, Token } from "antlr4ng";

export interface SSearchLangData {
    lexer: SSearchLexer;
    tokenStream: CommonTokenStream;
    parser: SSearchParser;
    c3: CodeCompletionCore;
    diagnostics: Diagnostic[];
}

class SimpleErrorListener implements ANTLRErrorListener {

    private state: EditorState
    private diagnostics: Diagnostic[];

    constructor(state: EditorState, diagnostics: Diagnostic[]) {
        this.state = state;
        this.diagnostics = diagnostics;
        this.syntaxError = this.syntaxError.bind(this);
    }

    syntaxError<S extends Token, T extends ATNSimulator>(recognizer: Recognizer<T>, offendingSymbol: S | null, line: number, charPositionInLine: number, msg: string, e: RecognitionException | null): void {
        let from: number = -1, to: number = -1;
        if (offendingSymbol) {
            from = offendingSymbol.start;
            to = offendingSymbol.stop;
        }
        if (from === -1) {
            from = this.state.doc.line(line).from + charPositionInLine;
        }
        if (to < from) {
            to = from;
        }
        this.diagnostics.push({
            from,
            to,
            message: msg,
            severity: 'error',
        });
    }
    reportAmbiguity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, exact: boolean, ambigAlts: BitSet | undefined, configs: ATNConfigSet): void {
    }
    reportAttemptingFullContext(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, conflictingAlts: BitSet | undefined, configs: ATNConfigSet): void {
    }
    reportContextSensitivity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, prediction: number, configs: ATNConfigSet): void {
    }

}

function createSSearchLangData(state: EditorState): SSearchLangData {
    const code = state.doc.toString();
    const diagnostics: Diagnostic[] = [];
    const lexer = new SSearchLexer(CharStream.fromString(code));
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new SSearchParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(new SimpleErrorListener(state, diagnostics));
    parser.pipeline();
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
    return {
        lexer,
        tokenStream,
        parser,
        c3,
        diagnostics,
    };
}

export const extraState = StateField.define<SSearchLangData>({
    create: (state): SSearchLangData => createSSearchLangData(state),
    update: (value, transaction): SSearchLangData => {
        if (transaction.docChanged) {
            return createSSearchLangData(transaction.state);
        } else {
            return value;
        }
    },
    compare: (a, b) => a === b,
})