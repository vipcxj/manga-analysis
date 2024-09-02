import CodeMirror, { ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { useMemo } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView  } from '@codemirror/view';
import { search as searchLanguage } from './lang';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { completedStateEffectType, extraState } from './langdata';
import { toAggregation } from '../../lib/ssearch/mongo';

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

const searchTheme = EditorView.theme({
    '&.cm-focused': {
        outline: 'none',
    },
}, { dark: false });

export default function PureSearch({ value, onValueChange, className }: PureSearchProps) {
    const onChange = React.useCallback<OnChangeType>((val, viewUpdate) => {
        onValueChange(val);
    }, [onValueChange]);
    const extensionList = useMemo(
        () => [
            syntaxHighlighting(defaultHighlightStyle),
            autocompletion({ activateOnTyping: true }),
            searchLanguage({
                properties: [
                    { name: 'var1' },
                    { name: 'var2' },
                    { name: 'var3' },
                    { name: 'p1' },
                    { name: 'p2' },
                    { name: 'p3' },
                ],
            }),
            closeBrackets(),
        ],
        [],
    );
    const cmRef = React.useRef<ReactCodeMirrorRef>(null);
    const onSearch = React.useCallback(async (evt: React.MouseEvent) => {
        if (cmRef.current && cmRef.current.state) {
            const data = cmRef.current.view?.state.field(extraState, false);
            if (data) {
                const { diagnostics } = data;
                if (diagnostics.length > 0) {
                    cmRef.current.view?.dispatch({ effects: [completedStateEffectType.of(true)] })
                } else {
                    console.log(toAggregation(data.pipeline));
                }
            }
        }
    }, [cmRef]);
    return <div className='pt-2 relative mx-auto text-gray-600 w-96'>
        <CodeMirror
            id='search'
            ref={cmRef}
            value={value}
            onChange={onChange}
            className={`${className} border-2 border-gray-300 bg-white h-8 px-1 pr-10 rounded-lg text-sm focus:outline-none`}
            basicSetup={false}
            theme={searchTheme}
            extensions={extensionList}
        />
        <button
            type="submit" className="absolute right-0 top-0 mt-4 mr-3"
            onClick={onSearch}
        >
          <svg className="text-gray-600 h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px"
            viewBox="0 0 56.966 56.966" xmlSpace="preserve"
            width="512px" height="512px">
            <path
              d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
          </svg>
        </button>
    </div>;
}