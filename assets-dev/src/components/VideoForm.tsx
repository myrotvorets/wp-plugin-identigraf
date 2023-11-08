import React, { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import { Paragraph } from './Paragraph';
import { UploadProgress } from './UploadProgress';
import { VideoPreview } from './VideoPreview';
import { type ErrorResponse, type VideoUploadResponse, decodeErrorResponse } from '../api';
import { useXHR } from '../hooks/usexhr';

export function VideoForm(): ReactNode {
	const [ video, setVideo ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const [ guid, setGuid ] = useState( '' );
	const [ minSimilarity, setMinSimilarity ] = useState( 0 );
	const [ data, setData ] = useState<FormData | undefined>( undefined );

	const {
		progress: uploadProgress,
		error: xhrError,
		response,
		finished,
	} = useXHR( `${ self.i8f.vendpoint }/process`, data );

	const onFileChange = useCallback( ( { currentTarget }: FormEvent ): void => {
		setError( '' );
		setVideo( '' );
		const { files } = currentTarget as HTMLInputElement;
		const f = files?.[ 0 ];
		if ( f?.type.startsWith( 'video/' ) ) {
			const type = f.type;
			const reader = new FileReader();
			reader.addEventListener( 'load', ( { target }: ProgressEvent<FileReader> ): void => {
				const buffer = target!.result as ArrayBuffer | null;
				if ( buffer ) {
					const blob = new Blob( [ new Uint8Array( buffer ) ], { type } );
					setVideo( URL.createObjectURL( blob ) );
				}
			} );

			reader.readAsArrayBuffer( f );
		}
	}, [] );

	const onSimilarityChange = useCallback( ( { currentTarget }: FormEvent<HTMLInputElement | HTMLTextAreaElement> ): void => {
		const value = ( currentTarget as HTMLInputElement ).valueAsNumber;
		if ( value < 0 ) {
			setMinSimilarity( 0 );
		} else if ( value > 100 ) {
			setMinSimilarity( 100 );
		} else {
			setMinSimilarity( value );
		}
	}, [] );

	const onFormSubmit = useCallback(
		( e: FormEvent<HTMLFormElement> ): void => {
			e.preventDefault();
			if ( video.length !== 0 && isNaN( uploadProgress ) ) {
				const formData = new FormData( e.currentTarget );
				formData.delete( 'minsimilarity' );
				setData( formData );
				setError( '' );
			}
		},
		[ video, uploadProgress ],
	);

	useEffect( () => setError( xhrError ? __( 'Failed to upload the file', 'i8fjs' ) : '' ), [ xhrError ] );

	useEffect( () => {
		if ( finished && response ) {
			try {
				const body = JSON.parse( response.response ) as VideoUploadResponse | ErrorResponse;
				if ( body.success ) {
					apiFetch( {
						method: 'POST',
						path: '/identigraf/v2/video-check',
						data: { guid: body.guid, minSimilarity },
					} ).then( () => {
						setGuid( body.guid );
						setVideo( '' );
					} ).catch( () => {
						setError( __( 'Unexpected error', 'i8fjs' ) );
					} );
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
	}, [ finished, minSimilarity, response ] );

	return (
		<section className="d-flex flex-column w-100">
			<Card as="form" onSubmit={ onFormSubmit }>
				<Card.Body>
					{ error && <Alert variant="danger">{ error }</Alert> }
					{ guid && <Alert variant="success">
						<Paragraph>{ __( 'Video has been successfully uploaded.', 'i8fjs' ) }</Paragraph>
						<Paragraph>{ /* translators: %s = Video GUID */ sprintf( __( 'Video ID: %s', 'i8fjs' ), guid ) }</Paragraph>
						<Paragraph>{ __( 'Results will be sent to your email address.', 'i8fjs' ) }</Paragraph>
					</Alert> }

					<Form.Group controlId="video" className="mb-3">
						<Form.Label>{ __( 'Video:', 'i8fjs' ) }</Form.Label>
						<Form.Control
							name="video"
							type="file"
							required
							accept="video/*"
							disabled={ ! isNaN( uploadProgress ) }
							onChange={ onFileChange }
						/>
					</Form.Group>

					<Form.Group controlId="minsimilarity" className="mb-3">
						<Form.Label>{ __( 'Minimum similarity:', 'i8fj' ) }</Form.Label>
						<InputGroup>
							<Form.Control
								name="minsimilarity"
								type="number"
								min={ 0 }
								max={ 100 }
								required
								value={ minSimilarity }
								onChange={ onSimilarityChange }
							/>
							<InputGroup.Text>%</InputGroup.Text>
						</InputGroup>
					</Form.Group>

					<Row>
						<Col>
							<VideoPreview video={ video } />
						</Col>
					</Row>

					<UploadProgress progress={ uploadProgress } />

					<Paragraph>
						<Button variant="primary" type="submit" disabled={ video.length === 0 || ! isNaN( uploadProgress ) }>
							{ __( 'Submit', 'i8fjs' ) }
						</Button>
					</Paragraph>
				</Card.Body>
			</Card>
		</section>
	);
}
