import React from 'react';
import { createRoot } from 'react-dom/client';
import { CompareApp } from './components/CompareApp';

const container = document.querySelector( '.wrap' );
const root = createRoot( container ?? document.body );
root.render(
	<React.StrictMode>
		<CompareApp />
	</React.StrictMode>,
);
