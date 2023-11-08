import React from 'react';
import { createRoot } from 'react-dom/client';
import { SearchApp } from './components/SearchApp';

const container = document.querySelector( '.wrap' );
const root = createRoot( container ?? document.body );
root.render(
	<React.StrictMode>
		<SearchApp />
	</React.StrictMode>,
);
