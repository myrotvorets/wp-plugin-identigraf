import React, { type ChangeEvent, Component, type FormEvent, type ReactNode } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Navigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import UploadProgress from '../UploadProgress';
import { AppContext } from '../../context';
import {
	type CompareUploadResponse,
	type ErrorResponse,
	decodeErrorResponse,
} from '../../api';

interface State {
	error: string | null;
	uploadProgress: number | null;
	hasPhoto1: boolean;
	hasPhoto2: boolean;
	guid: string | null;
}

export default class CompareForm extends Component<unknown, State> {
	public override state: Readonly<State> = {
		error: null,
		uploadProgress: null,
		hasPhoto1: false,
		hasPhoto2: false,
		guid: null,
	};

	public static override contextType = AppContext;
	declare public context: React.ContextType<typeof AppContext>;

	private readonly _onFileChange = ( { currentTarget }: ChangeEvent<HTMLInputElement> ): void => {
		const { files, id } = currentTarget;
		const value = files !== null && files.length > 0;
		if ( id === 'photo1' ) {
			this.setState( { hasPhoto1: value } );
		} else {
			this.setState( { hasPhoto2: value } );
		}
	};

	private readonly _onFormSubmit = ( e: FormEvent<HTMLFormElement> ): void => {
		e.preventDefault();
		const data = new FormData( e.currentTarget );

		this.setState( { uploadProgress: 0, error: null } );
		const req = new XMLHttpRequest();
		req.upload.addEventListener( 'progress', this._onUploadProgress );
		req.addEventListener( 'error', this._onUploadFailed );
		req.addEventListener( 'abort', this._onUploadAborted );
		req.addEventListener( 'timeout', this._onUploadTimeout );
		req.addEventListener( 'load', this._onUploadSucceeded );
		req.open( 'POST', `${ self.i8f.iendpoint }/compare` );
		req.setRequestHeader( 'Authorization', `Bearer ${ this.context.token }` );
		req.send( data );
	};

	private readonly _onUploadProgress = ( e: ProgressEvent<XMLHttpRequestEventTarget> ): void => {
		let progress: number;
		if ( e.lengthComputable ) {
			progress = ( e.loaded / e.total ) * 100;
		} else {
			progress = -1;
		}

		this.setState( {
			uploadProgress: progress,
		} );
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
			const body = JSON.parse( req.responseText ) as CompareUploadResponse | ErrorResponse;
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
		const { error, guid, uploadProgress } = this.state;

		if ( guid !== null ) {
			return <Navigate to={ `/compare/${ guid }` } />;
		}

		return (
			<Form onSubmit={ this._onFormSubmit } encType="multipart/form-data">
				{ error && <Alert variant="danger">{ error }</Alert> }

				<Form.Group controlId="photo" className="mb-3">
					<Form.Label>{ __( 'Compared photo:', 'i8fjs' ) }</Form.Label>
					<Form.Control
						name="photos"
						type="file"
						required
						accept="image/png, image/jpeg"
						disabled={ uploadProgress !== null }
						onChange={ this._onFileChange }
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
						disabled={ uploadProgress !== null }
						onChange={ this._onFileChange }
						aria-describedby="uploadHelpBlock"
					/>
				</Form.Group>

				<UploadProgress progress={ uploadProgress } />

				<Button variant="primary" type="submit">
					{ __( 'Submit', 'i8fjs' ) }
				</Button>
			</Form>
		);
	}
}
