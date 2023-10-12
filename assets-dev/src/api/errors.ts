import { __ } from '@wordpress/i18n';
import type { ErrorResponse } from './types';

const errors: Record<string, string> = {
	AUTHORIZATION_FAILED: __( 'Authorization failed.', 'i8fjs' ),
	AUTHORIZATION_REQUIRED: __( 'Not authorized to perform this action.', 'i8fjs' ),
	BAD_GATEWAY: __( 'Error communicating with the server.', 'i8fjs' ),
	COMM_ERROR: __( 'Error communicating with the server.', 'i8fjs' ),
	UNKNOWN_ERROR: __( 'Unknown error.', 'i8fjs' ),
};

export function decodeErrorCode( code: string ): string {
	return errors[ code ] ?? errors[ 'UNKNOWN_ERROR' ]!;
}

export function decodeErrorResponse( r: ErrorResponse ): string {
	const error = errors[ r.code ];
	return error ?? r.message;
}
