import { createContext } from 'react';

export interface Context {
    token: string;
}

export const AppContext = createContext<Context>( { token: '' } );
