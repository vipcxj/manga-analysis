import { SSearchVisitor } from "@/antlr/ssearch/parser/SSearchVisitor";
import {
    BoolLiteralContext,
    CompareCondition1Context,
    CompareCondition2Context,
    CompareCondition3Context,
    ExpressionContext,
    FloatLiteralContext,
    IdentifierContext,
    IntegerLiteralContext,
    LogicalExpressionContext,
    MatchConditionContext,
    MatchStateContext,
    ParExpressionContext,
    PipelineContext,
    SearchStateContext,
    SSearchParser,
    StringLiteralContext,
    UseStateContext
} from "@/antlr/ssearch/parser/SSearchParser";
import { SSearchLexer } from "@/antlr/ssearch/parser/SSearchLexer";
import { getPipeline } from '@/conf/ssearch';

interface NewField {
    name: string;
    value: BOpNode | UOpNode;
}

type VarType = string | number | boolean | VariableNode;

function isVariableNode(v: VarType): v is VariableNode {
    return typeof v === 'object';
}

function isGoodVariableName(name: string) {
    return !name.startsWith('$') && name.indexOf('.') === -1;
}

function isGoodVariableNode(v: VarType): v is VariableNode {
    return isVariableNode(v) && isGoodVariableName(v.name);
}

interface BOpNode {
    op: typeof SSearchLexer.ADD | typeof SSearchLexer.SUB | typeof SSearchLexer.DIV | typeof SSearchLexer.MUL | typeof SSearchLexer.MOD;
    left: VarType;
    right: VarType;
}

function isBopNodeDepOn(n: BOpNode, v: string): boolean {
    if (isVariableNode(n.left)) {
        return n.left.name === v;
    }
    if (isVariableNode(n.right)) {
        return n.right.name === v;
    }
    return false;
}

interface UOpNode {
    op: typeof SSearchLexer.NT;
    target: VarType;
}

function isUopNodeDepOn(n: UOpNode, v: string): boolean {
    return isVariableNode(n.target) && n.target.name === v;
}

function isBOpNode(n: BOpNode | UOpNode): n is BOpNode {
    return 'left' in n;
}

function isOpNodeDepOn(n: BOpNode | UOpNode, v: string): boolean {
    if (isBOpNode(n)) {
        return isBopNodeDepOn(n, v);
    } else {
        return isUopNodeDepOn(n, v);
    }
}

interface VariableNode {
    name: string;
}

type ParseInt<T extends string> 
  = T extends `${infer Digit extends number}`
  //                         ^^^^^^^^^^^^^^
  //                         key element                       
  ? Digit
  : never;

type Neg<N extends number> = ParseInt<`-${N}`>;

function neg<N extends number>(n: N): Neg<N> {
    return -n as Neg<N>;
}

interface UseState {
    type: Neg<typeof SSearchParser.RULE_useState>;
    userPipeline: string;
}

type MatchState = AndMatchState | OrMatchState | SimpleMatchState | NotMatchState;

type PipelineState = UseState | MatchState;

function isUseState(state: PipelineState): state is UseState {
    return state.type === neg(SSearchParser.RULE_useState);
}

function isMatchState(state: PipelineState): state is MatchState {
    return !isUseState(state);
}

type Pipeline = PipelineState[];

interface AndMatchState {
    type: typeof SSearchLexer.AND;
    left: MatchState;
    right: MatchState;
}

interface OrMatchState {
    type: typeof SSearchLexer.OR;
    left: MatchState;
    right: MatchState;
}

interface NotMatchState {
    type: typeof SSearchLexer.NOT;
    target: MatchState;
}

interface SimpleMatchState {
    type: typeof SSearchLexer.MATCH;
    op: typeof SSearchLexer.EQ
    | typeof SSearchLexer.LT
    | typeof SSearchLexer.LE
    | typeof SSearchLexer.GT
    | typeof SSearchLexer.GE
    | typeof SSearchLexer.NE;
    left: VarType;
    right: VarType;
}

type MatchOp = SimpleMatchState['op'];

interface LogicalExpression {
    type: typeof SSearchLexer.AND | typeof SSearchLexer.OR;
    left: VarType | LogicalExpression;
    right: VarType | LogicalExpression;
}

function isLogicalExpression(v: VarType | LogicalExpression): v is LogicalExpression {
    return typeof v === 'object' && 'type' in v;
}

function expandExprAndLogicalExpr(op: MatchOp, left: VarType, right: LogicalExpression): MatchState {
    const { left: subLeft, right: subRight } = right;
    let newLeft: MatchState, newRight: MatchState;
    if (isLogicalExpression(subLeft)) {
        newLeft = expandExprAndLogicalExpr(op, left, subLeft);
    } else {
        newLeft = {
            type: SSearchLexer.MATCH,
            op,
            left,
            right: subLeft,
        };
    }
    if (isLogicalExpression(subRight)) {
        newRight = expandExprAndLogicalExpr(op, left, subRight);
    } else {
        newRight = {
            type: SSearchLexer.MATCH,
            op,
            left,
            right: subRight,
        };
    }
    return {
        type: right.type,
        left: newLeft,
        right: newRight,
    };
}

type MongoPrim = string | number | boolean | { $getField: string };

function var2Mongo(v: VarType, asKey: boolean = false): MongoPrim {
    if (isVariableNode(v)) {
        if (isGoodVariableName(v.name)) {
            return asKey ? v.name : `\$${v.name}`;
        } else {
            return {
                $getField: v.name,
            };
        }
    } else {
        return v;
    }
}

type MongoBOp = '$add' | '$subtract' | '$multiply' | '$divide' | '$mod';

function bop2Mongo(n: BOpNode) {
    let op: MongoBOp;
    switch (n.op) {
        case SSearchLexer.ADD:
            op = '$add';
            break;
        case SSearchLexer.SUB:
            op = '$subtract';
            break;
        case SSearchLexer.MUL:
            op = '$multiply';
            break;
        case SSearchLexer.DIV:
            op = '$divide';
            break;
        case SSearchLexer.MOD:
            op = '$mod';
            break;
    }
    return {
        [op]: [var2Mongo(n.left), var2Mongo(n.right)],
    };
}

function uop2Mongo(n: UOpNode) {
    let op: '$not';
    switch (n.op) {
        case SSearchLexer.NT:
            op = '$not';
            break;
    }
    return {
        [op]: [var2Mongo(n.target)],
    };
}

function op2Mongo(n: BOpNode | UOpNode) {
    if (isBOpNode(n)) {
        return bop2Mongo(n);
    } else {
        return uop2Mongo(n);
    }
}

function newFields2Mongo(fields: NewField[]) {
    const layers: NewField[][] = [];
    let layer: NewField[] = [];
    for (let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        let dep = false;
        for (let j = 0; j < i; ++j) {
            const other = fields[j];
            if (isOpNodeDepOn(field.value, other.name)) {
                dep = true;
                break;
            }
        }
        if (dep) {
            layers.push(layer);
            layer = [];
        }
        layer.push(fields[i]);
    }
    if (layer.length > 0) {
        layers.push(layer);
    }
    return layers.map(layer => {
        const result: { $addFields: Record<string, any> } = {
            $addFields: {},
        };
        for (const field of layer) {
            result.$addFields[field.name] = op2Mongo(field.value);
        }
        return result;
    });
}

function matchState2Mongo(state: MatchState): Record<string, any> {
    switch (state.type) {
        case SSearchLexer.AND:
            return {
                $and: [matchState2Mongo(state.left), matchState2Mongo(state.right)],
            };
        case SSearchLexer.OR:
            return {
                $or: [matchState2Mongo(state.left), matchState2Mongo(state.right)],
            };
        case SSearchLexer.NOT:
            return {
                $not: matchState2Mongo(state.target),
            };
        default:
            if (isGoodVariableNode(state.left) || isGoodVariableNode(state.right)) {
                let mop: string, rmop: string;
                switch (state.op) {
                    case SSearchLexer.EQ:
                        mop = rmop = '$eq';
                        break;
                    case SSearchLexer.GT:
                        mop = '$gt';
                        rmop = '$lte';
                        break;
                    case SSearchLexer.GE:
                        mop = '$gte';
                        rmop = '$lt';
                        break;
                    case SSearchLexer.LT:
                        mop = '$lt';
                        rmop = '$gte';
                        break;
                    case SSearchLexer.LE:
                        mop = '$lte';
                        rmop = '$gt';
                        break;
                    case SSearchLexer.NE:
                        mop = rmop = '$ne';
                        break;
                }
                if (isGoodVariableNode(state.left)) {
                    return {
                        [var2Mongo(state.left, true) as string]: { [mop]: var2Mongo(state.right) },
                    };
                } else {
                    return {
                        [var2Mongo(state.right, true) as string]: { [rmop]: var2Mongo(state.left) },
                    };
                }
            } else {
                let op: string;
                switch (state.op) {
                    case SSearchLexer.EQ:
                        op = '$eq';
                        break;
                    case SSearchLexer.GT:
                        op = '$gt';
                        break;
                    case SSearchLexer.GE:
                        op = '$gte';
                        break;
                    case SSearchLexer.LT:
                        op = '$lt';
                        break;
                    case SSearchLexer.LE:
                        op = '$lte';
                        break;
                    case SSearchLexer.NE:
                        op = '$ne';
                        break;
                }
                return {
                    $expr: {
                        [op]: [var2Mongo(state.left), var2Mongo(state.right)],
                    },
                }
            }
    }
}

function expandLogicalExprAndExpr(op: MatchOp, left: LogicalExpression, right: VarType): MatchState {
    const { left: subLeft, right: subRight } = left;
    let newLeft: MatchState, newRight: MatchState;
    if (isLogicalExpression(subLeft)) {
        newLeft = expandLogicalExprAndExpr(op, subLeft, right);
    } else {
        newLeft = {
            type: SSearchLexer.MATCH,
            op,
            left: subLeft,
            right,
        };
    }
    if (isLogicalExpression(subRight)) {
        newRight = expandLogicalExprAndExpr(op, subRight, right);
    } else {
        newRight = {
            type: SSearchLexer.MATCH,
            op,
            left: subRight,
            right,
        };
    }
    return {
        type: left.type,
        left: newLeft,
        right: newRight,
    };
}

class AggregationVisitor extends SSearchVisitor<any> {

    public newFields: NewField[] = [];
    private newFieldNameBase: number = 0;

    nextTempVar = (): string => {
        return `_tmp${this.newFieldNameBase++}`
    }

    visitPipeline = (ctx: PipelineContext): Pipeline => {
        return ctx.searchState().map(s => this.visitSearchState(s));
    };

    visitSearchState = (ctx: SearchStateContext): PipelineState => {
        const useState = ctx.useState();
        if (useState) {
            return this.visitUseState(useState);
        }
        const matchState = ctx.matchState();
        if (matchState) {
            return this.visitMatchState(matchState);
        }
        if (ctx.start) {
            throw new Error(`Invalid search state ${ctx.getText()} at ${ctx.start.line}:${ctx.start.column}`);
        } else {
            throw new Error(`Invalid search state ${ctx.getText()}`);
        }
    };

    visitUseState = (ctx: UseStateContext): UseState => {
        return {
            type: neg(SSearchParser.RULE_useState),
            userPipeline: ctx.userPipeline().getText(),
        };
    };

    visitMatchState = (ctx: MatchStateContext): MatchState => {
        return this.visitMatchCondition(ctx.matchCondition());
    };

    visitMatchCondition = (ctx: MatchConditionContext): MatchState => {
        const par = ctx.parMatchCondition();
        if (par) {
            return this.visitMatchCondition(par.matchCondition());
        }
        const and = ctx.AND();
        if (and) {
            return {
                type: SSearchLexer.AND,
                left: this.visitMatchCondition(ctx._left!),
                right: this.visitMatchCondition(ctx._right!),
            };
        }
        const or = ctx.OR();
        if (or) {
            return {
                type: SSearchLexer.OR,
                left: this.visitMatchCondition(ctx._left!),
                right: this.visitMatchCondition(ctx._right!),
            };
        }
        const not = ctx.NOT();
        if (not) {
            return {
                type: SSearchLexer.NOT,
                target: this.visitMatchCondition(ctx._target!),
            };
        }
        const compare = ctx.compareCondition();
        if (compare) {
            return this.visitChildren(compare);
        }
        if (ctx.start) {
            throw new Error(`Invalid match condition ${ctx.getText()} at ${ctx.start.line}:${ctx.start.column}`);
        } else {
            throw new Error(`Invalid match condition ${ctx.getText()}`);
        }
    };

    visitCompareCondition1 = (ctx: CompareCondition1Context): SimpleMatchState => {
        const left = this.visitExpression(ctx.expression(0)!);
        const right = this.visitExpression(ctx.expression(1)!);
        return {
            type: SSearchLexer.MATCH,
            op: ctx._bop?.type as SimpleMatchState['op'],
            left,
            right,
        };
    };

    visitCompareCondition2 = (ctx: CompareCondition2Context): MatchState => {
        const left = this.visitExpression(ctx.expression());
        const rights = this.visitLogicalExpression(ctx.logicalExpression());
        const op = ctx._bop?.type as MatchOp;
        return expandExprAndLogicalExpr(op, left, rights);
    };

    visitCompareCondition3 = (ctx: CompareCondition3Context): MatchState => {
        const right = this.visitExpression(ctx.expression());
        const lefts = this.visitLogicalExpression(ctx.logicalExpression());
        const op = ctx._bop?.type as MatchOp;
        return expandLogicalExprAndExpr(op, lefts, right);
    };

    visitLogicalExpression = (ctx: LogicalExpressionContext): LogicalExpression => {
        const left = ctx._leftExpr ? this.visitExpression(ctx._leftExpr) : this.visitLogicalExpression(ctx._leftLogExpr!);
        const right = ctx._rightExpr ? this.visitExpression(ctx._rightExpr) : this.visitLogicalExpression(ctx._rightLogExpr!);
        const type = ctx.AND() ? SSearchLexer.AND : SSearchLexer.OR;
        return {
            type,
            left,
            right,
        };
    };

    visitExpression = (ctx: ExpressionContext): number | string | boolean | VariableNode => {
        const primary = ctx.primary();
        if (primary) {
            return this.visitChildren(primary);
        }
        if (ctx._prefix) {
            if (ctx._prefix.type === SSearchLexer.ADD) {
                return this.visitExpression(ctx.expression(0)!);
            } else if (ctx._prefix.type === SSearchLexer.SUB) {
                const varName = this.nextTempVar();
                this.newFields.push({
                    name: varName,
                    value: {
                        op: SSearchLexer.MUL,
                        left: this.visitExpression(ctx.expression(0)!),
                        right: -1,
                    },
                });
                return {
                    name: varName,
                };
            } else if (ctx._prefix.type === SSearchLexer.NT) {
                const varName = this.nextTempVar();
                this.newFields.push({
                    name: varName,
                    value: {
                        op: SSearchLexer.NT,
                        target: this.visitExpression(ctx.expression(0)!),
                    },
                });
                return {
                    name: varName,
                }
            } else {
                throw new Error('this is impossible!');
            }
        }
        if (ctx._bop) {
            const varName = this.nextTempVar();
            this.newFields.push({
                name: varName,
                value: {
                    op: ctx._bop.type as BOpNode['op'],
                    left: this.visitExpression(ctx.expression(0)!),
                    right: this.visitExpression(ctx.expression(1)!),
                },
            });
            return {
                name: varName,
            };
        }
        throw new Error('this is impossible.');
    };

    visitParExpression = (ctx: ParExpressionContext) => {
        return this.visitExpression(ctx.expression());
    };

    visitIdentifier = (ctx: IdentifierContext): VariableNode => {
        return {
            name: ctx.IDENTIFIER().getText(),
        };
    };

    visitStringLiteral = (ctx: StringLiteralContext): string => {
        const text = ctx.getText();
        if (text.startsWith('"')) {
            return JSON.parse(text);
        } else if (text.startsWith("'")) {
            const content = text.substring(1, text.length - 1).replaceAll('"', '\\"');
            return JSON.parse(`"${content}"`);
        } else {
            if (ctx.start) {
                throw new Error(`Invalid string ${ctx.getText()} at ${ctx.start.line}:${ctx.start.column}`);
            } else {
                throw new Error(`Invalid string ${ctx.getText()}`);
            }
        }
    };

    visitBoolLiteral = (ctx: BoolLiteralContext): boolean => {
        return ctx.getText() === 'true' ? true : false;
    };

    visitIntegerLiteral = (ctx: IntegerLiteralContext): number => {
        const decimal = ctx.DECIMAL_LITERAL();
        if (decimal) {
            return Number.parseInt(decimal.getText(), 10);
        }
        const binary = ctx.BINARY_LITERAL();
        if (binary) {
            return Number.parseInt(binary.getText().substring(2), 2);
        }
        const oct = ctx.OCT_LITERAL();
        if (oct) {
            return Number.parseInt(oct.getText().substring(2), 8);
        }
        const hex = ctx.HEX_LITERAL();
        if (hex) {
            return Number.parseInt(hex.getText().substring(2), 16)
        }
        if (ctx.start) {
            throw new Error(`Invalid integer number ${ctx.getText()} at ${ctx.start.line}:${ctx.start.column}`);
        } else {
            throw new Error(`Invalid integer number ${ctx.getText()}`);
        }
    };

    visitFloatLiteral = (ctx: FloatLiteralContext): number => {
        return Number.parseFloat(ctx.FLOAT_LITERAL().getText());
    };
}

export function toAggregation(pipelineCtx: PipelineContext) {
    const visitor = new AggregationVisitor();
    const pipeline = pipelineCtx.accept(visitor) as Pipeline;
    return pipeline.flatMap(state => {
        if (isUseState(state)) {
            return getPipeline(state.userPipeline);
        } else {
            if (visitor.newFields.length > 0) {
                return [
                    ...newFields2Mongo(visitor.newFields),
                    {
                        $match: matchState2Mongo(state),
                    },
                    {
                        $unset: visitor.newFields.map(f => f.name),
                    },
                ];
            } else {
                return [
                    {
                        $match: matchState2Mongo(state),
                    },
                ];
            }
        }
    })
}