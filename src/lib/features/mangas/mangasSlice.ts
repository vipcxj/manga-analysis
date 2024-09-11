
import { createAppSlice } from '@/lib/createAppSlice';
import { searchMangas, getMangaDetail } from './mangasAPI';
import { PayloadAction } from '@reduxjs/toolkit';
import type { MangaInfo, MangaDetail } from '@/lib/mongo/type';

export type MangaLayout = 'fit-width' | 'fit-height' | 'original';

export interface MangasSliceState {
    searchExpr: string;
    searchStatus: 'idle' | 'loading' | 'failed';
    mangaInfoList: Array<MangaInfo>;
    mangaInfoPage: number;
    mangaInfoCount: number;
    mangaInfoPerPage: number;
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
    mangaInfoPage: -1,
    mangaInfoCount: 0,
    mangaInfoPerPage: 10,
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
            async (payload: string | null | undefined, api) => {
                const perPage: number = mangasSlice.selectors.selectMangaInfoPerPage(api.getState() as any);
                const page: number = mangasSlice.selectors.selectMangaInfoPage(api.getState() as any);
                let searchExpr: string;
                if (payload) {
                    searchExpr = payload;
                    api.dispatch(mangasSlice.actions.setSearchExpr(payload));
                } else {
                    searchExpr = mangasSlice.selectors.selectSearchExpr(api.getState() as any);
                }
                return searchMangas(searchExpr, page === -1 ? 0 : page * perPage, perPage);
            },
            {
                pending: (state) => {
                    state.searchStatus = 'loading';
                },
                fulfilled: (state, action) => {
                    state.searchStatus = 'idle';
                    const { paginatedResults, total } = action.payload;
                    state.mangaInfoList = paginatedResults;
                    state.mangaInfoCount = total;
                    if (state.mangaInfoPage === -1 && state.mangaInfoCount > 0) {
                        state.mangaInfoPage = 0;
                    }
                },
                rejected: (state) => {
                    state.searchStatus = 'failed';
                }
            },
        ),
        setMangaInfoPage: create.reducer((state, action: PayloadAction<number>) => {
            state.mangaInfoPage = action.payload;
        }),
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
        selectMangaInfoPage: (mangas) => mangas.mangaInfoPage,
        selectMangaInfoCount: (mangas) => mangas.mangaInfoCount,
        selectMangaInfoPerPage: (mangas) => mangas.mangaInfoPerPage,
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
    setMangaInfoPage,
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
    selectMangaInfoPage,
    selectMangaInfoCount,
    selectMangaInfoPerPage,
    selectCurrentMangaStatus,
    selectCurrentMangaInfo,
    selectCurrentMangaDetail,
    selectCurrentMangaPage,
    selectCurrentMangaLayout,
} = mangasSlice.selectors;