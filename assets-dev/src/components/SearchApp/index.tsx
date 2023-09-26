import React, { Component, type ReactElement, type ReactNode } from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import { Link, Route, HashRouter as Router, Routes, useParams } from 'react-router-dom';
import { AppContext, type Context } from '../../context';
import SearchForm from '../SearchForm';
import SearchResults from '../SearchResults';
import API from '../../api';

interface State {
	ctx: Context;
	error: null | string;
}

function SearchResultsRoute(): ReactElement {
	const { guid } = useParams();
	return <SearchResults guid={ guid as string } />;
}

export default class SearchApp extends Component<unknown, State> {
	public state: Readonly<State> = {
		error: null,
		ctx: {
			token: '',
		},
	};

	private _timerId = 0;

	public componentDidMount(): void {
		this.refreshToken();
	}

	public componentWillUnmount(): void {
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

	public render(): ReactNode {
		const { ctx, error } = this.state;
		return (
			<Container>
				<Router>
					<h1 className="h2"><Link to="/" className="text-decoration-none">{ self.i8f.title }</Link></h1>
					{ error && <Alert variant="danger">{ error }</Alert> }
					{ ctx.token ? (
						<AppContext.Provider value={ ctx }>
							<Routes>
								<Route path="/search/:guid" element={ <SearchResultsRoute /> } />
								<Route path="/" element={ <SearchForm /> } />
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
