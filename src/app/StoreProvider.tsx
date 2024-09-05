'use client';

import { AppStore, Persistor, makeStore } from "@/lib/store";
import React, { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>();
    const persisterRef = useRef<Persistor>();
    if (!storeRef.current || !persisterRef.current) {
        const { store, persistor } = makeStore();
        storeRef.current = store;
        persisterRef.current = persistor;
    }

    return <Provider store={storeRef.current}>
        <PersistGate loading={null} persistor={persisterRef.current}>
            { children }
        </PersistGate>
    </Provider>;
}