import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { mangasSlice } from '@/lib/features/mangas/mangasSlice';

const persistConfig = {
    key: 'root',
    storage,
}

const rootReducer = persistReducer(persistConfig, combineSlices(mangasSlice));

export const makeStore = () => {
    const store = configureStore({
        reducer: rootReducer,
    });
    const persistor = persistStore(store);
    return { store, persistor }
};

export type AppStore = ReturnType<typeof makeStore>['store'];
export type Persistor = ReturnType<typeof makeStore>['persistor'];
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>;