import React from 'react';
import { createRoot } from 'react-dom/client';
import { VideoApp } from './components/VideoApp';

const container = document.querySelector( '.wrap' );
const root = createRoot( container ?? document.body );
root.render(
	<React.StrictMode>
		<VideoApp />
	</React.StrictMode>,
);
