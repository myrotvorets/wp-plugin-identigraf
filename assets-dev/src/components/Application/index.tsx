import React, { ReactElement, ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import { Route, HashRouter as Router, Switch } from 'react-router-dom';
import SearchForm from '../SearchForm';
import SearchResults from '../SearchResults';

export default function Application(): ReactElement {
	return (
		<Container className="p-3 my-3">
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
		</Container>
	);
}
