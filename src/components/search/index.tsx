'use client';
import PureSearch, { PureSearchProps } from './pure';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setSearchExpr, search, selectSearchExpr, selectSearchStatus } from '@/lib/features/mangas/mangasSlice';
import React from 'react';

type SearchProps = Omit<PureSearchProps, 'value' | 'onValueChange'>;

export default function Search(props: SearchProps) {
    const dispatch = useAppDispatch();
    const searchExpr = useAppSelector(selectSearchExpr);
    const searchStatus = useAppSelector(selectSearchStatus);
    const handleSearchExprChange = React.useCallback((expr: string) => {
        dispatch(setSearchExpr(expr));
    }, [dispatch]);
    const onSearch = React.useCallback((code: string) => {
        dispatch(search(code));
    }, [dispatch, search]);
    return (
        <div>
            <PureSearch 
                value={searchExpr} 
                onValueChange={handleSearchExprChange} 
                onSearch={onSearch}
                loading={searchStatus === 'loading'}
                {...props}
             />
        </div>
    )
}