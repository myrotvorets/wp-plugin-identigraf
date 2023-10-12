import React, { Component, type ReactNode } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
// eslint-disable-next-line import/no-named-as-default
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import { __, sprintf } from '@wordpress/i18n';
import API, { type MatchedFace as FoundFace, type CapturedFace as RecognizedFace, decodeErrorResponse } from '../../api';
import CapturedFace from '../CapturedFace';
import MatchedFace from '../MatchedFace';
import WaitForm from '../WaitForm';
import { AppContext } from '../../context';

interface Props {
	guid: string;
}

type TheState = 'check' | 'done';

interface State {
	state: TheState;
	error: string;
	capturedFaces: RecognizedFace[];
	matchedFaces: ( FoundFace[] | null )[];
	lightbox: string | null;
}

export default class SearchResults extends Component<Props, State> {
	public override state: Readonly<State> = {
		state: 'check',
		error: '',
		capturedFaces: [],
		matchedFaces: [],
		lightbox: null,
	};

	public static override contextType = AppContext;
	declare public context: React.ContextType<typeof AppContext>;

	private _timerId = 0;

	public override componentDidMount(): void {
		this._timerId = self.setTimeout( this._checkStatus, 0 );
	}

	public override componentWillUnmount(): void {
		if ( this._timerId !== 0 ) {
			self.clearTimeout( this._timerId );
		}
	}

	private readonly _onFaceLinkClicked = ( link: string ): void => {
		this.setState( { lightbox: link } );
	};

	private readonly _onLightboxClose = (): void => {
		this.setState( { lightbox: null } );
	};

	private readonly _checkStatus = (): void => {
		this._timerId = 0;

		const { guid } = this.props;

		/* checkSearchStatus() cannot fail */
		void API.checkSearchStatus( guid, this.context.token ).then( ( r ) => {
			if ( r.success ) {
				if ( r.status === 'inprogress' ) {
					this._timerId = self.setTimeout( this._checkStatus, 2_000 );
				} else {
					this.setState( { capturedFaces: r.faces }, () => this._getMatchedFaces() );
				}
			} else {
				this.setState( { state: 'done', error: decodeErrorResponse( r ) } );
			}

			return null;
		} );
	};

	private _addMatches( matches: FoundFace[] | null ): void {
		this.setState( ( prevState ) => ( { matchedFaces: [ ...prevState.matchedFaces, matches ] } ) );
	}

	private _getMatchedFaces(): void {
		const { guid } = this.props;
		const { capturedFaces } = this.state;

		Promise.all( capturedFaces.map( ( { faceID } ) => API.getMatchedFaces( guid, faceID, this.context.token ) ) )
			.then( ( responses ) => {
				responses.forEach( ( response ) => this._addMatches( response.success ? response.matches : null ) );
				this.setState( { state: 'done' } );
			} )
			.catch( ( e ) => console.error( e ) );
	}

	private readonly _renderMatchedFace = ( face: FoundFace, index: number ): ReactNode => {
		return (
			<ListGroup.Item key={ index }>
				<MatchedFace { ...face } onClick={ this._onFaceLinkClicked } />
			</ListGroup.Item>
		);
	};

	private _renderMatchedFaces( faceID: number, index: number ): ReactNode {
		const { matchedFaces } = this.state;
		const faces = matchedFaces[ index ];

		if ( faces === undefined ) {
			return (
				<Card.Body>
					<Spinner animation="border" variant="primary">
						<span className="visually-hidden">{ __( 'Loading…', 'i8fjs' ) }</span>
					</Spinner>
				</Card.Body>
			);
		}

		if ( faces === null ) {
			return (
				<Card.Body>
					<Alert variant="danger">{ __( 'Error loading captured faces', 'i8fjs' ) }</Alert>;
				</Card.Body>
			);
		}

		return <ListGroup variant="flush">{ faces.map( this._renderMatchedFace ) }</ListGroup>;
	}

	private readonly _renderCapturedFace = ( face: RecognizedFace, index: number ): ReactNode => {
		return (
			<ListGroup.Item key={ face.faceID }>
				<Row>
					<Col>
						<strong className="fs-2">{ /* translators: 1: face number */ sprintf( __( 'Face %d', 'i8fjs' ), index + 1 ) }</strong>
					</Col>
				</Row>
				<Row>
					<Col md={ 2 } className="position-sticky bg-white" style={ { zIndex: 1000, top: 0 } }>
						<CapturedFace { ...face } />
					</Col>
					<Col>{ this._renderMatchedFaces( face.faceID, index ) }</Col>
				</Row>
			</ListGroup.Item>
		);
	};

	public override render(): ReactNode {
		const { capturedFaces, error, lightbox, state } = this.state;
		if ( state === 'check' ) {
			return <WaitForm />;
		}

		if ( error ) {
			return <Alert variant="danger">{ error }</Alert>;
		}

		return (
			<>
				<Card>
					<Card.Header className={ capturedFaces.length ? 'bg-primary text-white' : 'bg-danger text-white' }>
						{ __( 'Search Results', 'i8fjs' ) }
					</Card.Header>
					{ capturedFaces.length ? (
						<ListGroup variant="flush">{ capturedFaces.map( this._renderCapturedFace ) }</ListGroup>
					) : (
						<Card.Body>
							<Card.Text>{ __( 'Unfortunately, the system has failed to recognize any face on the photo.', 'i8fjs' ) }</Card.Text>
						</Card.Body>
					) }
				</Card>
				{ lightbox && <Lightbox open close={ this._onLightboxClose } slides={ [ { src: lightbox } ] } fullscreen={ { auto: false } } plugins={ [ Fullscreen ] } /> }
			</>
		);
	}
}
