
import { createAppSlice } from '@/lib/createAppSlice';
import { searchMangas } from './mangasAPI';
import { PayloadAction } from '@reduxjs/toolkit';
import type { MangaInfo } from '@/lib/mongo/type';

export interface MangaDetail {}

export interface MangasSliceState {
    searchExpr: string;
    searchStatus: 'idle' | 'loading' | 'failed';
    mangaInfoList: Array<MangaInfo>;
}

const initialState: MangasSliceState = {
    searchExpr: '',
    searchStatus: 'idle',
    mangaInfoList: [],
};

export const mangasSlice = createAppSlice({
    name: 'mangas',
    initialState,
    reducers: (create) => ({
        setSearchExpr: create.reducer((state, action: PayloadAction<string>) => {
            state.searchExpr = action.payload;
        }),
        search: create.asyncThunk(
            async (expr: string) => {
                return searchMangas(expr);
            },
            {
                pending: (state) => {
                    state.searchStatus = 'loading';
                },
                fulfilled: (state, action) => {
                    state.mangaInfoList = action.payload;
                },
                rejected: (state) => {
                    state.searchStatus = 'failed';
                }
            },
        ),
    }),
    selectors: {
        selectSearchExpr: (mangas) => mangas.searchExpr,
        selectSearchStatus: (mangas) => mangas.searchStatus,
        selectMangaInfoList: (mangas) => mangas.mangaInfoList,
    },
})

export const { setSearchExpr, search } = mangasSlice.actions;

export const {
    selectSearchExpr,
    selectSearchStatus,
    selectMangaInfoList
} = mangasSlice.selectors;