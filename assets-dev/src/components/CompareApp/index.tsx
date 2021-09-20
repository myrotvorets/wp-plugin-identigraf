import React, { Component, ReactNode } from 'react';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { Link, Route, HashRouter as Router, Switch } from 'react-router-dom';
import { AppContext, Context } from '../../context';
import CompareForm from '../CompareForm';
import CompareResults from '../CompareResults';
import API from '../../api';

interface State {
	ctx: Context;
	error: null | string;
}

export default class CompareApp extends Component<unknown, State> {
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
							<Switch>
								<Route
									path="/compare/:guid"
									render={ ( props ): ReactNode => <CompareResults guid={ props.match.params.guid } /> }
								/>
								<Route path="/" exact>
									<CompareForm />
								</Route>
							</Switch>
						</AppContext.Provider>
					) : (
						<Spinner animation="border" variant="primary" />
					) }
				</Router>
			</Container>
		);
	}
}
