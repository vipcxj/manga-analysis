import { SSearchLexer } from "@/antlr/ssearch/parser/SSearchLexer";
import { PipelineContext, SSearchParser } from "@/antlr/ssearch/parser/SSearchParser";
import { ANTLRErrorListener, ATNConfigSet, ATNSimulator, BitSet, CharStream, CommonTokenStream, DFA, Parser, RecognitionException, Recognizer, Token } from "antlr4ng";

class SSearchSyntaxError extends Error {

    constructor(public message: string) {
        super(message);
    }
}

class SimpleErrorListener implements ANTLRErrorListener {

    syntaxError<S extends Token, T extends ATNSimulator>(recognizer: Recognizer<T>, offendingSymbol: S | null, line: number, charPositionInLine: number, msg: string, e: RecognitionException | null): void {
        throw new SSearchSyntaxError(`[${line}:${charPositionInLine}] syntax error: ${msg}`);
    }
    reportAmbiguity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, exact: boolean, ambigAlts: BitSet | undefined, configs: ATNConfigSet): void {
        throw new SSearchSyntaxError('ambiguity.');
    }
    reportAttemptingFullContext(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, conflictingAlts: BitSet | undefined, configs: ATNConfigSet): void {
        throw new SSearchSyntaxError('ambiguity.');
    }
    reportContextSensitivity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, prediction: number, configs: ATNConfigSet): void {
        throw new SSearchSyntaxError('ambiguity.');
    }
    
}

export function parseSearchCode(code: string): PipelineContext {
    const lexer = new SSearchLexer(CharStream.fromString(code));
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new SSearchParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(new SimpleErrorListener());
    return parser.pipeline();
}