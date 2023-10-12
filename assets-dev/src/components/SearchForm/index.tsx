import React, { type ChangeEvent, Component, type FormEvent, type ReactNode } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import { Navigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { ErrorResponse, SearchUploadResponse, decodeErrorResponse } from '../../api';
import PhotoPreview from '../PhotoPreview';
import UploadProgress from '../UploadProgress';
import { AppContext } from '../../context';

interface State {
	image: string;
	uploadProgress: number | null;
	error: string | null;
	guid: string | null;
	minSimilarity: number;
}

export default class SearchForm extends Component<unknown, State> {
	public override state: Readonly<State> = {
		image: '',
		uploadProgress: null,
		error: null,
		guid: null,
		minSimilarity: 30,
	};

	public static override contextType = AppContext;
	declare public context: React.ContextType<typeof AppContext>;

	private readonly _onFileChange = ( { currentTarget }: ChangeEvent<HTMLInputElement> ): void => {
		this.setState( { error: null } );
		const { files } = currentTarget;
		const f = files?.[ 0 ];
		if ( f?.type.startsWith( 'image/' ) ) {
			const reader = new FileReader();
			reader.addEventListener( 'load', ( { target }: ProgressEvent<FileReader> ): void => {
				this.setState( { image: target!.result as string } );
			} );

			reader.readAsDataURL( f );
		} else {
			this.setState( { image: '' } );
		}
	};

	private readonly _onFormSubmit = ( event: FormEvent<HTMLFormElement> ): void => {
		event.preventDefault();
		const data = new FormData( event.currentTarget );
		this.setState( { uploadProgress: 0, error: null } );

		const token = this.context.token;
		const req = new XMLHttpRequest();
		req.upload.addEventListener( 'progress', this._onUploadProgress );
		req.addEventListener( 'error', this._onUploadFailed );
		req.addEventListener( 'abort', this._onUploadAborted );
		req.addEventListener( 'timeout', this._onUploadTimeout );
		req.addEventListener( 'load', this._onUploadSucceeded );
		req.open( 'POST', `${ self.i8f.iendpoint }/search` );
		req.setRequestHeader( 'Authorization', `Bearer ${ token }` );
		req.send( data );
	};

	private readonly _onSimilarityChange = ( { currentTarget }: FormEvent<HTMLInputElement> ): void => {
		this.setState( { minSimilarity: currentTarget.valueAsNumber } );
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
			const body = JSON.parse( req.responseText ) as SearchUploadResponse | ErrorResponse;
			if ( body.success ) {
				this.setState( { guid: body.guid } );
			} else if ( req.status === 401 ) {
				this._setError( __( 'Unexpected authentication error', 'i8fjs' ) );
			} else {
				this._setError( decodeErrorResponse( body ) );
			}
		} catch ( err ) {
			this._setError( __( 'Unknown error while analyzing the server response', 'i8fjs' ) );
		}
	};

	private _setError( error: string ): void {
		this.setState( { uploadProgress: null, error } );
	}

	public override render(): ReactNode {
		const { error, guid, image, minSimilarity, uploadProgress } = this.state;

		if ( guid !== null ) {
			return <Navigate to={ `/search/${ guid }` } />;
		}

		return (
			<Form encType="multipart/form-data" onSubmit={ this._onFormSubmit }>
				{ error && <Alert variant="danger">{ error }</Alert> }

				<Form.Group controlId="photo" className="mb-3">
					<Form.Label>{ __( 'Photo:', 'i8fjs' ) }</Form.Label>
					<Form.Control
						name="photo"
						type="file"
						required
						accept="image/png, image/jpeg"
						disabled={ uploadProgress !== null }
						onChange={ this._onFileChange }
					/>
				</Form.Group>

				<Form.Group controlId="minSimilarity" className="mb-3">
					<Form.Label>{ __( 'Minimum similarity', 'i8fjs' ) }</Form.Label>
					<InputGroup>
						<Form.Control name="minSimilarity" type="number" min="10" max="100" step="1" value={ minSimilarity } onInput={ this._onSimilarityChange } required />
						<InputGroup.Text>%</InputGroup.Text>
					</InputGroup>
				</Form.Group>

				<Row>
					<Col>
						<PhotoPreview image={ image } />
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
