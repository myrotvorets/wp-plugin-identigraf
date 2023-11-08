import React, { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Image, InputGroup } from 'react-bootstrap';
import { __ } from '@wordpress/i18n';
import { Paragraph } from './Paragraph';
import { UploadProgress } from './UploadProgress';
import { type ErrorResponse, type SearchUploadResponse, decodeErrorResponse } from '../api';
import { useXHR } from '../hooks/usexhr';

export function SearchForm(): ReactNode {
	const [ image, setImage ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const [ guid, setGuid ] = useState( '' );
	const [ minSimilarity, setMinSimilarity ] = useState( 30 );
	const [ data, setData ] = useState<FormData | undefined>( undefined );

	const {
		progress: uploadProgress,
		error: xhrError,
		response,
		finished,
	} = useXHR( `${ self.i8f.iendpoint }/search`, data );

	const onFileChange = useCallback( ( { currentTarget }: FormEvent ): void => {
		setError( '' );
		const { files } = currentTarget as HTMLInputElement;
		const f = files?.[ 0 ];
		if ( f?.type.startsWith( 'image/' ) ) {
			const reader = new FileReader();
			reader.addEventListener( 'load', ( { target }: ProgressEvent<FileReader> ): void => {
				setImage( target!.result as string );
			} );

			reader.readAsDataURL( f );
		} else {
			setImage( '' );
		}
	}, [] );

	const onSimilarityChange = useCallback( ( { currentTarget }: FormEvent<HTMLInputElement | HTMLTextAreaElement> ): void => {
		const value = ( currentTarget as HTMLInputElement ).valueAsNumber;
		if ( value < 5 ) {
			setMinSimilarity( 5 );
		} else if ( value > 100 ) {
			setMinSimilarity( 100 );
		} else {
			setMinSimilarity( value );
		}
	}, [] );

	const onFormSubmit = useCallback(
		( e: FormEvent<HTMLFormElement> ): void => {
			e.preventDefault();
			if ( image.length !== 0 && isNaN( uploadProgress ) ) {
				setData( new FormData( e.currentTarget ) );
			}
		},
		[ image, uploadProgress ],
	);

	useEffect( () => setError( xhrError ? __( 'Failed to upload the file', 'i8fjs' ) : '' ), [ xhrError ] );

	useEffect( () => {
		if ( finished && response ) {
			try {
				const body = JSON.parse( response.response ) as SearchUploadResponse | ErrorResponse;
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
		return <Navigate to={ `/search/${ guid }` } />;
	}

	return (
		<section className="d-flex flex-column w-100">
			<Card as="form" onSubmit={ onFormSubmit }>
				<Card.Body>
					{ error && <Alert variant="danger">{ error }</Alert> }

					<Form.Group controlId="photo" className="mb-3">
						<Form.Label>{ __( 'Photo:', 'i8fjs' ) }</Form.Label>
						<Form.Control
							type="file"
							required
							accept="image/png, image/jpeg"
							disabled={ ! isNaN( uploadProgress ) }
							onChange={ onFileChange }
							name="photo"
						/>
					</Form.Group>

					<Form.Group controlId="minSimilarity" className="mb-3">
						<Form.Label>{ __( 'Minimum similarity:', 'i8fjs' ) }</Form.Label>
						<InputGroup>
							<Form.Control
								type="number"
								value={ minSimilarity }
								required
								name="minSimilarity"
								min={ 5 }
								max={ 80 }
								onInput={ onSimilarityChange }
							/>
							<InputGroup.Text>%</InputGroup.Text>
						</InputGroup>
					</Form.Group>

					{ image.length > 0 ? (
						<Image src={ image } alt={ __( 'Face to search', 'i8fjs' ) } className="img-fluid mb-3" />
					) : null }

					<UploadProgress progress={ uploadProgress } />

					<Paragraph>
						<Button variant="primary" type="submit" disabled={ image.length === 0 || ! isNaN( uploadProgress ) }>
							{ __( 'Submit', 'i8fjs' ) }
						</Button>
					</Paragraph>
				</Card.Body>
			</Card>
		</section>
	);
}
