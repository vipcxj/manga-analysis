import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import React from 'react';
import { EditorState } from '@codemirror/state';
import { drawSelection, dropCursor } from '@codemirror/view';
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

export interface PureSearchProps {
    value: string;
    onValueChange: (v: string) => void;
    className: string;
}

type OnChangeType = NonNullable<ReactCodeMirrorProps['onChange']>;
const oneLine = EditorState.transactionFilter.of(tr => (
    tr.newDoc.lines > 1 
    ? [tr, { 
        changes: { 
            from: 0, 
            to: tr.newDoc.length, 
            insert: tr.newDoc.sliceString(0, undefined, " "),
        },
        sequential: true,
    }]
    : [tr]
));

export default function ({ value, onValueChange, className }: PureSearchProps) {
    const onChange = React.useCallback<OnChangeType>((val, viewUpdate) => {
        onValueChange(val);
    }, []);
    return <CodeMirror
        value={value}
        onChange={onChange}
        className={className}
        basicSetup={{
            lineNumbers: false,
            foldGutter: false,
        }}
        extensions={[

            //oneLine,
        ]}
    />;
}