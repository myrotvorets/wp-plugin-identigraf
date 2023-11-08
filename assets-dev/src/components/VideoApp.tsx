import React, { type ReactNode, useState } from 'react';
import { Alert, Container } from 'react-bootstrap';
import { Link, Route, HashRouter as Router, Routes } from 'react-router-dom';
import { SmallLoader } from './SmallLoader';
import { VideoForm } from './VideoForm';
import { hasToken } from '../signals';
import { useTimer } from '../hooks/usetimer';
import API from '../api';

export function VideoApp(): ReactNode {
	const [ error, setError ] = useState( '' );
	const [ checkInterval, setCheckInterval ] = useState<number>( 0 );
	const [ trigger, setTrigger ] = useState( 0 );

	const refreshToken = (): void => {
		API.getApiToken().then( () => {
			setError( '' );
			setTrigger( Date.now() );
			setCheckInterval( 300_000 );
		} ).catch( ( e: Error ) => {
			setError( e.message );
			setCheckInterval( 5_000 );
			console.error( e );
		} );
	};

	useTimer( refreshToken, checkInterval, trigger );

	return (
		<Container>
			<Router>
				<h1 className="h2"><Link to="/" className="text-decoration-none">{ self.i8f.title }</Link></h1>
				{ error && <Alert variant="danger">{ error }</Alert> }
				{ hasToken.value ? (
					<Routes>
						<Route path="/" element={ <VideoForm /> } />
					</Routes>
				) : (
					<SmallLoader justifyContent="left" width={ 300 } />
				) }
			</Router>
		</Container>
	);
}
