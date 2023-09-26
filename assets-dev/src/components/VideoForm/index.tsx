import React, { type ChangeEvent, Component, type FormEvent, type ReactNode } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import { type ErrorResponse, type VideoUploadResponse, decodeErrorResponse } from '../../api';
import { AppContext } from '../../context';
import UploadProgress from '../UploadProgress';
import VideoPreview from '../VideoPreview';
import Paragraph from '../Paragraph';

interface State {
	video: string;
	uploadProgress: number | null;
	error: string | null;
	guid: string | null;
	minSimilarity: number;
}

export default class VideoForm extends Component<unknown, State> {
	public state: Readonly<State> = {
		video: '',
		uploadProgress: null,
		error: null,
		guid: null,
		minSimilarity: 0,
	};

	public static contextType = AppContext;
	declare public context: React.ContextType<typeof AppContext>;

	private readonly _onFileChange = ( { currentTarget }: ChangeEvent<HTMLInputElement> ): void => {
		this.setState( { error: null, guid: null, video: '' } );
		const { files } = currentTarget;
		const f = files?.[ 0 ];
		if ( f?.type.startsWith( 'video/' ) ) {
			const type = f.type;
			const reader = new FileReader();
			reader.addEventListener( 'load', ( { target }: ProgressEvent<FileReader> ): void => {
				const buffer = ( target as FileReader ).result as ArrayBuffer | null;
				if ( buffer ) {
					const blob = new Blob( [ new Uint8Array( buffer ) ], { type } );
					this.setState( { video: URL.createObjectURL( blob ) } );
				}
			} );

			reader.readAsArrayBuffer( f );
		}
	};

	private readonly _onFormSubmit = ( event: FormEvent<HTMLFormElement> ): void => {
		event.preventDefault();
		const data = new FormData( event.currentTarget );
		data.delete( 'minsimilarity' );
		this.setState( { uploadProgress: 0, error: null } );

		const token = this.context.token;
		const req = new XMLHttpRequest();
		req.upload.addEventListener( 'progress', this._onUploadProgress );
		req.addEventListener( 'error', this._onUploadFailed );
		req.addEventListener( 'abort', this._onUploadAborted );
		req.addEventListener( 'timeout', this._onUploadTimeout );
		req.addEventListener( 'load', this._onUploadSucceeded );
		req.open( 'POST', `${ self.i8f.vendpoint }/process` );
		req.setRequestHeader( 'Authorization', `Bearer ${ token }` );
		req.send( data );
	};

	private readonly _onUploadProgress = ( e: ProgressEvent<XMLHttpRequestEventTarget> ): void => {
		const progress = e.lengthComputable ? ( e.loaded / e.total ) * 100 : -1;
		this.setState( { uploadProgress: progress } );
	};

	private readonly _onUploadFailed = (): void => {
		this._setError( __( 'Failed to upload the file', 'i8fjs' ) );
	};

	private readonly _onUploadTimeout = (): void => {
		this._setError( __( 'Request has timed out', 'i8fjs' ) );
	};

	private readonly _onUploadAborted = (): void => {
		this._setError( __( 'Upload aborted', 'i8fjs' ) );
	};

	private readonly _onUploadSucceeded = ( e: ProgressEvent<XMLHttpRequestEventTarget> ): void => {
		this.setState( { uploadProgress: 100 } );
		const req = e.currentTarget as XMLHttpRequest;
		try {
			const body = JSON.parse( req.responseText ) as VideoUploadResponse | ErrorResponse;
			if ( body.success ) {
				apiFetch( {
					method: 'POST',
					path: '/identigraf/v2/video-check',
					data: { guid: body.guid, minSimilarity: this.state.minSimilarity },
				} ).then( () => {
					this.setState( { guid: body.guid, video: '', uploadProgress: null } );
				} ).catch( () => {
					this._setError( __( 'Unexpected error', 'i8fjs' ) );
				} );
			} else if ( req.status === 401 ) {
				this._setError( __( 'Unexpected authentication error', 'i8fjs' ) );
			} else {
				this._setError( decodeErrorResponse( body ) );
			}
		} catch ( err ) {
			this._setError( __( 'Unknown error while analyzing the server response', 'i8fjs' ) );
		}
	};

	private readonly _onMinSimilarityChange = ( e: ChangeEvent<HTMLInputElement> ): void => {
		this.setState( {
			minSimilarity: e.target.valueAsNumber,
		} );
	};

	private _setError( error: string ): void {
		this.setState( { uploadProgress: null, error } );
	}

	public render(): ReactNode {
		const { error, guid, minSimilarity, uploadProgress, video } = this.state;

		return (
			<Form encType="multipart/form-data" onSubmit={ this._onFormSubmit }>
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
						disabled={ uploadProgress !== null }
						onChange={ this._onFileChange }
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
							onChange={ this._onMinSimilarityChange }
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

				<Button variant="primary" type="submit">
					{ __( 'Submit', 'i8fjs' ) }
				</Button>
			</Form>
		);
	}
}
