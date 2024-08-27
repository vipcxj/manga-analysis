grammar SSearch;

pipeline: searchState (PIPE searchState)*;

searchState: matchState;

matchState: MATCH COLON matchCondition;

matchCondition:
    parMatchCondition
    | expression bop = (LT | LE | GT | GE) expression
    | expression bop = (LT | LE | GT | GE) OPEN_PAR logicalExpression CLOSE_PAR
    | OPEN_PAR logicalExpression CLOSE_PAR bop = (LT | LE | GT | GE) expression
    | NOT matchCondition
    | matchCondition AND matchCondition
    | matchCondition OR matchCondition
;

parMatchCondition: OPEN_PAR matchCondition CLOSE_PAR;

logicalExpression:
    expression AND expression
    | expression AND logicalExpression
    | logicalExpression AND expression
    | logicalExpression AND logicalExpression
    | expression OR expression
    | expression OR logicalExpression
    | logicalExpression OR expression
    | logicalExpression OR logicalExpression;

expression:
	primary
    | prefix = ('+' | '-' | '!') expression
	| expression bop = (MUL | DIV | MOD) expression
    | expression bop = (ADD | SUB) expression;

primary: parExpression | literal | identifier;

parExpression: OPEN_PAR expression CLOSE_PAR;

identifier: IDENTIFIER;

literal:
	integerLiteral
	| floatLiteral
	| STRING_LITERAL
	| BOOL_LITERAL;

integerLiteral:
	DECIMAL_LITERAL
	| HEX_LITERAL
	| OCT_LITERAL
	| BINARY_LITERAL;

floatLiteral: FLOAT_LITERAL | HEX_FLOAT_LITERAL;

MATCH: 'match';
PIPE: '|';

AND: 'and';
OR: 'or';
NOT: 'not';

COLON: ':';

DECIMAL_LITERAL: ('0' | [1-9] (Digits? | '_'+ Digits));
HEX_LITERAL: '0' [xX] [0-9a-fA-F] ([0-9a-fA-F_]* [0-9a-fA-F])?;
OCT_LITERAL: '0' '_'* [0-7] ([0-7_]* [0-7])?;
BINARY_LITERAL: '0' [bB] [01] ([01_]* [01])?;

FLOAT_LITERAL:
	(Digits '.' Digits? | '.' Digits) ExponentPart?
	| Digits (ExponentPart);

HEX_FLOAT_LITERAL:
	'0' [xX] (HexDigits '.'? | HexDigits? '.' HexDigits) [pP] [+-]? Digits;

BOOL_LITERAL: 'true' | 'false';

STRING_LITERAL:
	'"' (~["\\\r\n] | EscapeSequence)* '"'
	| '\'' (~['\\\r\n] | EscapeSequence)* '\'';

ADD: '+';
SUB: '-';
MUL: '*';
DIV: '/';
MOD: '%';
LT: '<';
LE: '<=';
GT: '>';
GE: '>=';
EQUAL: '=';
OPEN_PAR: '(';
CLOSE_PAR: ')';

WS: [ \n\r\t] -> channel(HIDDEN);

IDENTIFIER: Letter LetterOrDigit*;

fragment ExponentPart: [eE] [+-]? Digits;

fragment EscapeSequence:
	'\\' 'u005c'? [btnfr"'\\]
	| '\\' 'u005c'? ([0-3]? [0-7])? [0-7]
	| '\\' 'u'+ HexDigit HexDigit HexDigit HexDigit;

fragment HexDigits: HexDigit ((HexDigit | '_')* HexDigit)?;

fragment HexDigit: [0-9a-fA-F];

fragment Digits: [0-9] ([0-9_]* [0-9])?;

fragment LetterOrDigit: Letter | [0-9];

fragment Letter:
	[a-zA-Z$_] // these are the "letters" below 0x7F
	| ~[\u0000-\u007F\uD800-\uDBFF] // covers all characters above 0x7F which are not a surrogate
	| [\uD800-\uDBFF] [\uDC00-\uDFFF];
	// covers UTF-16 surrogate pairs encodings for U+10000 to U+10FFFF