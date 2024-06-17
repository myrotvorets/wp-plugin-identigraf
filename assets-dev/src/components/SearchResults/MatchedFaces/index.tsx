import React, { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Alert, Card, ListGroup } from 'react-bootstrap';
import { __, sprintf } from '@wordpress/i18n';
// eslint-disable-next-line import/no-named-as-default
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import API, { type MatchedFace as FoundFace, decodeErrorResponse } from '../../../api';
import { SmallLoader } from '../../SmallLoader';
import { Face } from './Face';

import 'yet-another-react-lightbox/styles.css';

interface Props {
	faceID: number;
	guid: string;
}

export function MatchedFaces( { faceID, guid }: Readonly<Props> ): ReactNode {
	const [ matchedFaces, setMatchedFaces ] = useState<FoundFace[]>( [] );
	const [ error, setError ] = useState( '' );
	const [ done, setDone ] = useState( false );
	const [ lightbox, setLightbox ] = useState( '' );

	const onFaceLinkClicked = useCallback( ( link: string ): void => {
		setLightbox( link );
	}, [] );

	const onLightboxClose = useCallback( (): void => {
		setLightbox( '' );
	}, [] );

	useEffect( () => {
		const getMatchedFaces = async (): Promise<void> => {
			const response = await API.getMatchedFaces( guid, faceID );
			if ( response.success ) {
				setMatchedFaces( response.matches );
			} else {
				setError( decodeErrorResponse( response ) );
			}

			setDone( true );
		};

		void getMatchedFaces();
	}, [ faceID, guid ] );

	if ( ! done ) {
		return (
			<Card.Body>
				<SmallLoader text={ __( 'Loading…', 'i8fjs' ) } justifyContent="start" />
			</Card.Body>
		);
	}

	if ( error ) {
		return (
			<Card.Body>
				<Alert variant="danger">{ /* translators: 1 - error message */ sprintf( __( 'Error loading faces: %s', 'i8fjs' ), error ) }</Alert>;
			</Card.Body>
		);
	}

	if ( ! matchedFaces.length ) {
		return <Card.Body><strong>{ __( 'No matches', 'i8fjs' ) }</strong></Card.Body>;
	}

	return (
		<>
			<ListGroup variant="flush">
				{ matchedFaces.map( ( face, index ) => (
					// eslint-disable-next-line sonarjs/no-array-index-key
					<Face { ...face } key={ index /* NOSONAR */ } onClick={ onFaceLinkClicked } />
				) ) }
			</ListGroup>
			{ lightbox && (
				<Lightbox
					open
					close={ onLightboxClose }
					slides={ [ { src: lightbox } ] }
					fullscreen={ { auto: false } }
					plugins={ [ Fullscreen ] }
				/>
			) }
		</>
	);
}
