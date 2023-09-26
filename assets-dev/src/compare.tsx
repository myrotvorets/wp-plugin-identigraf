import React from 'react';
import { createRoot } from 'react-dom/client';
import Application from './components/CompareApp';

const container = document.querySelector( '.wrap' );
const root = createRoot( container ?? document.body );
root.render(
	<React.StrictMode>
		<Application />
	</React.StrictMode>,
);
