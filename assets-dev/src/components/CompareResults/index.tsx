import React, { Component, type ReactNode } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import { __, sprintf } from '@wordpress/i18n';
import API, { decodeErrorResponse } from '../../api';
import WaitForm from '../WaitForm';
import { AppContext } from '../../context';

interface Props {
	guid: string;
}

type TheState = 'check' | 'done' | 'nofaces';

interface State {
	state: TheState;
	error: string;
	results: Record<string, number>;
	numFiles: number;
}

export default class CompareResults extends Component<Props, State> {
	public override state: Readonly<State> = {
		state: 'check',
		error: '',
		results: {},
		numFiles: 0,
	};

	public static override contextType = AppContext;
	declare public context: React.ContextType<typeof AppContext>;

	private _timerId: number | null = null;

	public override componentDidMount(): void {
		this._timerId = self.setTimeout( this._checkStatus, 0 );
	}

	public override componentWillUnmount(): void {
		if ( this._timerId !== null ) {
			self.clearTimeout( this._timerId );
		}
	}

	private readonly _checkStatus = (): void => {
		this._timerId = null;

		const { guid } = this.props;

		/* checkCompareStatus() cannot fail */
		void API.checkCompareStatus( guid, this.context.token ).then( ( r ) => {
			if ( r.success ) {
				if ( r.status === 'inprogress' ) {
					this._timerId = self.setTimeout( this._checkStatus, 1_000 );
				} else {
					this.setState( {
						state: r.status === 'complete' ? 'done' : 'nofaces',
						results: r.matches,
						numFiles: r.numFiles,
					} );
				}
			} else {
				this.setState( { state: 'done', error: decodeErrorResponse( r ) } );
			}

			return null;
		} );
	};

	private readonly _renderPhoto = ( similarity: number, index: number ): ReactNode => {
		const { guid } = this.props;
		return (
			<Carousel.Item key={ index }>
				<img
					className="img-fluid d-block mx-auto"
					src={ `https://api2.myrotvorets.center/identigraf-upload/v1/get/${ guid }/${ index + 1 }` }
					alt={ /* translators: 1: photo number */ sprintf( __( 'Photo %1$d', 'i8fjs' ), index + 1 ) }
					style={ { maxHeight: '40vh' } }
				/>
				<Carousel.Caption><strong>{ __( 'Similarity:', 'i8fjs' ) }</strong> { similarity }%</Carousel.Caption>
			</Carousel.Item>
		);
	};

	private _renderResults(): ReactNode {
		const { guid } = this.props;
		const results = Object.values( this.state.results );
		return (
			<Card>
				<Card.Header className="block__header">{ __( 'Comparison Results', 'i8fjs' ) }</Card.Header>

				<Card.Body>
					{ this.state.state === 'nofaces' && (
						<Card.Text className="text-danger">{ __( 'Unfortunately, the system has failed to recognize any face, or the photo contains multiple faces', 'i8fjs' ) }</Card.Text>
					) }

					<img
						className="img-fluid d-block mx-auto mb-3"
						src={ `https://api2.myrotvorets.center/identigraf-upload/v1/get/${ guid }/0` }
						alt={ __( 'Compared photo', 'i8fjs' ) }
						style={ { maxHeight: '40vh' } }
					/>

					<Carousel interval={ null } fade style={ { height: '45vh' } }>
						{ results.map( this._renderPhoto ) }
					</Carousel>
				</Card.Body>
			</Card>
		);
	}

	public override render(): ReactNode {
		const { error, state } = this.state;
		if ( state === 'check' ) {
			return <WaitForm />;
		}

		if ( error ) {
			return <Alert variant="danger">{ error }</Alert>;
		}

		return this._renderResults();
	}
}
