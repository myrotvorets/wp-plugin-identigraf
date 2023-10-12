import React, { Component, type ReactElement, type ReactNode } from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import { Link, Route, HashRouter as Router, Routes, useParams } from 'react-router-dom';
import { AppContext, type Context } from '../../context';
import CompareForm from '../CompareForm';
import CompareResults from '../CompareResults';
import API from '../../api';

interface State {
	ctx: Context;
	error: null | string;
}

function CompareResultsRoute(): ReactElement {
	const { guid } = useParams();
	return <CompareResults guid={ guid! } />;
}

export default class CompareApp extends Component<unknown, State> {
	public override state: Readonly<State> = {
		error: null,
		ctx: {
			token: '',
		},
	};

	private _timerId = 0;

	public override componentDidMount(): void {
		this.refreshToken();
	}

	public override componentWillUnmount(): void {
		if ( this._timerId > 0 ) {
			self.clearTimeout( this._timerId );
		}
	}

	private readonly refreshToken = (): void => {
		API.getApiToken().then( ( token ) => {
			this.setState( { ctx: { token }, error: null } );
			this._timerId = self.setTimeout( this.refreshToken, 300_000 );
		} ).catch( ( e: Error ) => {
			this.setState( { error: e.message } );
			this._timerId = self.setTimeout( this.refreshToken, 300_000 );
		} );
	};

	public override render(): ReactNode {
		const { ctx, error } = this.state;
		return (
			<Container>
				<Router>
					<h1 className="h2"><Link to="/" className="text-decoration-none">{ self.i8f.title }</Link></h1>
					{ error && <Alert variant="danger">{ error }</Alert> }
					{ ctx.token ? (
						<AppContext.Provider value={ ctx }>
							<Routes>
								<Route path="/compare/:guid" element={ <CompareResultsRoute /> } />
								<Route path="/" element={ <CompareForm /> } />
							</Routes>
						</AppContext.Provider>
					) : (
						<Spinner animation="border" variant="primary" />
					) }
				</Router>
			</Container>
		);
	}
}
