import React from 'react';
import { render } from 'react-dom';
import Application from './components/CompareApp';

render(
	<React.StrictMode>
		<Application />
	</React.StrictMode>,
	document.querySelector( '.wrap' ),
);
