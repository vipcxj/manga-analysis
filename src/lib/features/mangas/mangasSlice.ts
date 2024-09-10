
import { createAppSlice } from '@/lib/createAppSlice';
import { searchMangas, getMangaDetail } from './mangasAPI';
import { PayloadAction } from '@reduxjs/toolkit';
import type { MangaInfo, MangaDetail } from '@/lib/mongo/type';

export type MangaLayout = 'fit-width' | 'fit-height' | 'original';

export interface MangasSliceState {
    searchExpr: string;
    searchStatus: 'idle' | 'loading' | 'failed';
    mangaInfoList: Array<MangaInfo>;
    currentMangaInfo: MangaInfo | null;
    currentMangaDetail: MangaDetail | null;
    currentMangaStatus: 'idle' | 'loading' | 'failed';
    currentMangaPage: number;
    currentMangaLayout: MangaLayout;
}

const initialState: MangasSliceState = {
    searchExpr: '',
    searchStatus: 'idle',
    mangaInfoList: [],
    currentMangaInfo: null,
    currentMangaDetail: null,
    currentMangaStatus: 'idle',
    currentMangaPage: -1,
    currentMangaLayout: 'fit-width',
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
                    state.searchStatus = 'idle';
                    state.mangaInfoList = action.payload;
                },
                rejected: (state) => {
                    state.searchStatus = 'failed';
                }
            },
        ),
        setCurrentMangaInfo: create.reducer((state, action: PayloadAction<string>) => {
            const info = state.mangaInfoList.find(info => info._id === action.payload);
            if (info) {
                state.currentMangaInfo = info;
            }
        }),
        setCurrentManga: create.asyncThunk(
            async (id: string, api) => {
                api.dispatch(mangasSlice.actions.setCurrentMangaPage(-1));
                api.dispatch(mangasSlice.actions.setCurrentMangaInfo(id));
                return getMangaDetail(id);
            },
            {
                pending: (state) => {
                    state.currentMangaStatus = 'loading';
                },
                fulfilled: (state, action) => {
                    state.currentMangaStatus = 'idle';
                    state.currentMangaDetail = action.payload;
                },
                rejected: (state) => {
                    state.currentMangaStatus = 'failed';
                },
            }
        ),
        setCurrentMangaPage: create.reducer((state, action: PayloadAction<number>) => {
            state.currentMangaPage = action.payload;
        }),
        nextCurrentMangaPage: create.reducer((state) => {
            if (state.currentMangaInfo) {
                if (state.currentMangaPage < state.currentMangaInfo.pages - 1) {
                    state.currentMangaPage ++;
                }
            }
        }),
        prevCurrentMangaPage: create.reducer((state) => {
            if (state.currentMangaInfo) {
                if (state.currentMangaPage > 0) {
                    state.currentMangaPage --;
                }
            }
        }),
        setCurrentMangaLayout: create.reducer((state, action: PayloadAction<MangaLayout>) => {
            state.currentMangaLayout = action.payload;
        })
    }),
    selectors: {
        selectSearchExpr: (mangas) => mangas.searchExpr,
        selectSearchStatus: (mangas) => mangas.searchStatus,
        selectMangaInfoList: (mangas) => mangas.mangaInfoList,
        selectCurrentMangaStatus: (mangas) => mangas.currentMangaStatus,
        selectCurrentMangaInfo: (mangas) => mangas.currentMangaInfo,
        selectCurrentMangaDetail: (mangas) => mangas.currentMangaDetail,
        selectCurrentMangaPage: (mangas) => mangas.currentMangaPage,
        selectCurrentMangaLayout: (mangas) => mangas.currentMangaLayout,
    },
})

export const {
    setSearchExpr, 
    search, 
    setCurrentManga, 
    setCurrentMangaPage,
    nextCurrentMangaPage,
    prevCurrentMangaPage,
    setCurrentMangaLayout
} = mangasSlice.actions;

export const {
    selectSearchExpr,
    selectSearchStatus,
    selectMangaInfoList,
    selectCurrentMangaStatus,
    selectCurrentMangaInfo,
    selectCurrentMangaDetail,
    selectCurrentMangaPage,
    selectCurrentMangaLayout,
} = mangasSlice.selectors;