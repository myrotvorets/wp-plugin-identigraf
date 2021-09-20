import React from 'react';

export interface Context {
    token: string;
}

export const AppContext = React.createContext<Context>( { token: '' } );
