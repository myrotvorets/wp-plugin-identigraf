import React, { Component, ReactNode } from 'react';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { Route, HashRouter as Router, Switch } from 'react-router-dom';
import { AppContext, Context } from '../../context';
import SearchForm from '../SearchForm';
import SearchResults from '../SearchResults';
import API from '../../api/index';

interface State {
	ctx: Context;
	error: null | string;
}

export default class Application extends Component<unknown, State> {
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
			<Container className="p-3 my-3">
				<h1>{ self.i8f.title }</h1>
				{ error && <Alert variant="danger">{ error }</Alert> }
				{ ctx.token ? (
					<AppContext.Provider value={ ctx }>
						<Router>
							<Switch>
								<Route
									path="/search/:guid"
									render={ ( props ): ReactNode => <SearchResults guid={ props.match.params.guid } /> }
								/>
								<Route path="/" exact>
									<SearchForm />
								</Route>
							</Switch>
						</Router>
					</AppContext.Provider>
				) : (
					<Spinner animation="border" variant="primary" />
				) }
			</Container>
		);
	}
}
