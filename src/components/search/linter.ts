import { Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { extraState } from "./langdata";

export const lintSource = (view: EditorView): Diagnostic[] => {
    const { diagnostics } = view.state.field(extraState);
    return diagnostics;
}