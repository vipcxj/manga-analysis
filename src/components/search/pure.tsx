import CodeMirror, { ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import React, { useMemo } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { search as searchLanguage } from './lang';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { completedStateEffectType, extraState } from './langdata';
import { properties, userPipelines } from '@/conf/ssearch';

export interface PureSearchProps {
    value: string;
    onValueChange: (v: string) => void;
    className: string;
    onSearch?: (code: string) => any;
    loading?: boolean;
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
    '.cm-scroller': {
        overflow: 'hidden',
    }
}, { dark: false });

export default function PureSearch({ value, onValueChange, className, onSearch, loading = false }: PureSearchProps) {
    const onChange = React.useCallback<OnChangeType>((val, viewUpdate) => {
        onValueChange(val);
    }, [onValueChange]);
    const cmRef = React.useRef<ReactCodeMirrorRef>(null);
    const search = React.useCallback((view: EditorView) => {
        const data = view.state.field(extraState, false);
        if (data) {
            const { diagnostics } = data;
            if (diagnostics.length > 0) {
                view.dispatch({ effects: [completedStateEffectType.of(true)] })
            } else {
                if (onSearch) {
                    const code = view.state.doc.toString();
                    if (code) {
                        onSearch(code);
                    }
                }
            }
        }
    }, [onSearch]);
    const onClick = React.useCallback(async () => {
        if (cmRef.current && cmRef.current.view) {
            search(cmRef.current.view);
        }
    }, [cmRef, search]);
    const extensionList = useMemo(
        () => [
            syntaxHighlighting(defaultHighlightStyle),
            autocompletion({ activateOnTyping: true }),
            searchLanguage({
                properties,
                userPipelines,
            }),
            closeBrackets(),
            keymap.of([
                {
                    key: 'Enter',
                    run: (view) => {
                        search(view);
                        return true;
                    }
                }
            ])
        ],
        [search],
    );
    const icon = loading ? (
        <svg aria-hidden="true" className="inline w-4 h-4 mt-[-0.5rem] text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
    ) : (
        <svg className="text-gray-400 hover:text-gray-600 h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px"
            viewBox="0 0 56.966 56.966" xmlSpace="preserve"
            width="512px" height="512px">
            <path
                d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
            />
        </svg>
    );
    return <div className='relative mx-auto text-gray-600 w-96 h-9'>
        <CodeMirror
            id='search'
            ref={cmRef}
            value={value}
            onChange={onChange}
            className={`${className} border-2 border-gray-300 bg-white h-8 px-1 pr-10 rounded-lg text-sm focus-within:ring-1`}
            basicSetup={false}
            theme={searchTheme}
            extensions={extensionList}
        />
        <button
            type="submit" className="absolute right-0 top-0 mt-3 mr-3"
            onClick={onClick}
        >
          { icon }
        </button>
    </div>;
}