import React from 'react';
import { render } from 'react-dom';
import VideoApp from './components/VideoApp';

render(
	<React.StrictMode>
		<VideoApp />
	</React.StrictMode>,
	document.querySelector( '.wrap' ),
);
