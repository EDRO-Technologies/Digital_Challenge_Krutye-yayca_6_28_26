import React, { createContext, useContext, useState } from "react";
import type { ModeSearchingType } from "../../type/ModeSearchingTypes.ts";

const ModeSearchingContext = createContext(null);

export function ModeSearchingProvider({ children }: { children: React.ReactNode}) {
    const [modeSearching, setModeSearching] =
        useState<ModeSearchingType>("group");

    const value = {
        modeSearching,
        setModeSearching,
    };

    return (
        <ModeSearchingContext.Provider value={value}>
            {children}
        </ModeSearchingContext.Provider>
    );
}

export function useModeSearching() {
    return useContext(ModeSearchingContext);
}
