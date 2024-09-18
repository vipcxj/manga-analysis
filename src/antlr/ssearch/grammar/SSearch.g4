grammar SSearch;

pipeline: searchState (PIPE searchState)*;

searchState: matchState | useState;

useState: USE COLON userPipeline;

userPipeline: IDENTIFIER;

matchState: MATCH COLON matchCondition;

matchCondition:
    parMatchCondition
    | compareCondition
    | NOT target = matchCondition
    | left = matchCondition AND right = matchCondition
    | left = matchCondition OR right = matchCondition
;

compareCondition: compareCondition1 | compareCondition2 | compareCondition3;

compareCondition1: expression bop = (LT | LE | GT | GE | EQ | NE) expression;
compareCondition2: expression bop = (LT | LE | GT | GE | EQ | NE) OPEN_PAR logicalExpression CLOSE_PAR;
compareCondition3: OPEN_PAR logicalExpression CLOSE_PAR bop = (LT | LE | GT | GE | EQ | NE) expression;

parMatchCondition: OPEN_PAR matchCondition CLOSE_PAR;

logicalExpression:
    leftExpr = expression AND rightExpr = expression
    | leftExpr = expression AND rightLogExpr = logicalExpression
    | leftLogExpr = logicalExpression AND rightExpr = expression
    | leftLogExpr = logicalExpression AND rightLogExpr = logicalExpression
    | leftExpr = expression OR rightExpr = expression
    | leftExpr = expression OR rightLogExpr = logicalExpression
    | leftLogExpr = logicalExpression OR rightExpr = expression
    | leftLogExpr = logicalExpression OR rightLogExpr = logicalExpression;

expression:
	primary
    | prefix = (ADD | SUB | NT) expression
	| expression bop = (MUL | DIV | MOD) expression
    | expression bop = (ADD | SUB) expression;

primary: parExpression | literal | identifier;

parExpression: OPEN_PAR expression CLOSE_PAR;

identifier: IDENTIFIER;

literal:
	numberLiteral
	| stringLiteral
	| boolLiteral;

stringLiteral: STRING_LITERAL;

boolLiteral: BOOL_LITERAL;

numberLiteral:
	integerLiteral | floatLiteral;

integerLiteral:
	DECIMAL_LITERAL
	| HEX_LITERAL
	| OCT_LITERAL
	| BINARY_LITERAL;

floatLiteral: FLOAT_LITERAL;

MATCH: 'match';
USE: 'use';
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
EQ: '=';
NE: '!=';
NT: '!';
OPEN_PAR: '(';
CLOSE_PAR: ')';

WS: [ \n\r\t] -> channel(HIDDEN);

IDENTIFIER: Letter LetterOrDigit* ('.' Letter LetterOrDigit*) *;

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