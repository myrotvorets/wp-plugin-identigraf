import React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';

render(
	<React.StrictMode>
		<Application />
	</React.StrictMode>,
	document.querySelector( '.wrap' ),
);
