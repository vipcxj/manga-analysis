import { CompletionContext, CompletionResult, snippetCompletion as snip } from "@codemirror/autocomplete"
import { syntaxTree } from "@codemirror/language"
import { SyntaxNode } from '@lezer/common';

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

export function completionSource(context: CompletionContext): CompletionResult | null {
    const tree = syntaxTree(context.state);
    let inner = tree.resolveInner(context.pos, -1)
    if (dontComplete.indexOf(inner.name) > -1)
        return null
    console.log(`complete in node ${inner.name}`);
    if (inner.name == "Pipeline" || (directInPipeline(inner) && inner.name !== 'MatchState')) {
        return {
            options: [snip("match: ${condition}", {
                label: "match",
                type: "keyword",
            })],
            from: context.pos,
        };
    } else {
        return {
            options: [
                { label: 'test01', type: 'variable' },
                { label: 'test02', type: 'variable' },
                { label: 'test03', type: 'variable' },
                { label: 'apple', type: 'variable' },
                { label: 'match', type: 'keyword' },
                { label: 'or', type: 'keyword' },
                { label: 'and', type: 'keyword' },
            ],
            from: context.pos,
        };
    }
    // let isWord = inner.name == "VariableName" ||
    //   inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to))
    // if (!isWord && !context.explicit) return null
    // let options: Completion[] = []
    // for (let pos: SyntaxNode | null = inner; pos; pos = pos.parent) {
    //   if (ScopeNodes.has(pos.name)) options = options.concat(getScope(context.state.doc, pos))
    // }
    // return {
    //   options,
    //   from: isWord ? inner.from : context.pos,
    //   validFor: Identifier
    // }
  }