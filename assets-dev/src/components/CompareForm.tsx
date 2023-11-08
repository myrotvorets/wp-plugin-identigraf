import React, { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { __ } from '@wordpress/i18n';
import { CardHeader } from './CardHeader';
import { Paragraph } from './Paragraph';
import { UploadProgress } from './UploadProgress';
import { type CompareUploadResponse, type ErrorResponse, decodeErrorResponse } from '../api';
import { useXHR } from '../hooks/usexhr';

export function CompareForm(): ReactNode {
	const [ error, setError ] = useState( '' );
	const [ data, setData ] = useState<FormData | undefined>( undefined );
	const [ hasPhoto1, setHasPhoto1 ] = useState( false );
	const [ hasPhoto2, setHasPhoto2 ] = useState( false );
	const [ guid, setGuid ] = useState( '' );

	const {
		progress: uploadProgress,
		error: xhrError,
		response,
		finished,
	} = useXHR( `${ self.i8f.iendpoint }/compare`, data );

	const onFileChange = useCallback( ( { currentTarget }: FormEvent ): void => {
		const { files, id } = currentTarget as HTMLInputElement;
		const value = files !== null && files.length > 0;
		if ( id === 'photo1' ) {
			setHasPhoto1( value );
		} else if ( id === 'photo2' ) {
			setHasPhoto2( value );
		}
	}, [] );

	const onFormSubmit = useCallback(
		( e: FormEvent<HTMLFormElement> ): void => {
			e.preventDefault();
			if ( hasPhoto1 && hasPhoto2 && isNaN( uploadProgress ) ) {
				setData( new FormData( e.currentTarget ) );
			}
		},
		[ hasPhoto1, hasPhoto2, uploadProgress ],
	);

	useEffect( () => setError( xhrError ? __( 'Failed to upload the file', 'i8fjs' ) : '' ), [ xhrError ] );

	useEffect( () => {
		if ( finished && response ) {
			try {
				const body = JSON.parse( response.response ) as CompareUploadResponse | ErrorResponse;
				if ( body.success ) {
					setGuid( body.guid );
				} else if ( response.status === 401 ) {
					setError( __( 'Unexpected authentication error', 'i8fjs' ) );
				} else {
					setError( decodeErrorResponse( body ) );
				}
			} catch ( err ) {
				setError( __( 'Unknown error while analyzing the server response', 'i8fjs' ) );
				console.error( err );
			}
		}
	}, [ finished, response ] );

	if ( guid !== '' ) {
		return <Navigate to={ `/compare/${ guid }` } />;
	}

	return (
		<section className="d-flex flex-column w-100">
			<Card as="form" onSubmit={ onFormSubmit }>
				<CardHeader>{ __( 'Compare', 'i8fjs' ) }</CardHeader>
				<Card.Body>
					{ error && <Alert variant="danger">{ error }</Alert> }

					<Form.Group controlId="photo1" className="mb-3">
						<Form.Label>{ __( 'Compared photo:', 'i8fjs' ) }</Form.Label>
						<Form.Control
							name="photos"
							type="file"
							required
							accept="image/png, image/jpeg"
							disabled={ ! isNaN( uploadProgress ) }
							onChange={ onFileChange }
						/>
					</Form.Group>

					<Form.Group controlId="photo2" className="mb-3">
						<Form.Label>{ __( 'Reference photos (up to 10 files):', 'i8fjs' ) }</Form.Label>
						<Form.Control
							name="photos"
							type="file"
							required
							multiple
							accept="image/png, image/jpeg"
							disabled={ ! isNaN( uploadProgress ) }
							onChange={ onFileChange }
						/>
					</Form.Group>

					<UploadProgress progress={ uploadProgress } />

					<Paragraph>
						<Button variant="primary" type="submit" disabled={ ! hasPhoto1 || ! hasPhoto2 || ! isNaN( uploadProgress ) }>
							{ __( 'Submit', 'i8fjs' ) }
						</Button>
					</Paragraph>
				</Card.Body>
			</Card>
		</section>
	);
}
