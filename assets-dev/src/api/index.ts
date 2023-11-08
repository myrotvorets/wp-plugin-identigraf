import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import type { CompareStatusResponse, ErrorResponse, MatchedFacesResponse, SearchStatusResponse } from './types';
import { token } from '../signals';
export * from './errors';
export * from './types';

interface TokenResponse {
	token: string;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class API {
	public static async getApiToken(): Promise<void> {
		try {
			const data = await apiFetch<TokenResponse>( { path: '/identigraf/v2/token' } );
			token.value = data.token;
		} catch {
			throw new Error( __( 'Error getting the authentication token', 'i8fjs' ) );
		}
	}

	public static checkCompareStatus( guid: string ): Promise<CompareStatusResponse | ErrorResponse> {
		return API.get( `/compare/${ guid }`, token.value );
	}

	public static checkSearchStatus( guid: string ): Promise<SearchStatusResponse | ErrorResponse> {
		return API.get( `/search/${ guid }`, token.value );
	}

	public static getMatchedFaces( guid: string, faceID: number ): Promise<MatchedFacesResponse | ErrorResponse> {
		return API.get( `/search/${ guid }/matches/${ faceID }/0/20`, token.value );
	}

	private static get<R>( endpoint: string, auth: string ): Promise<R | ErrorResponse> {
		const headers: Record<string, string> = {
			Accept: 'application/json',
			Authorization: `Bearer ${ auth }`,
		};

		return API.fetch<R>( `${ self.i8f.iendpoint }${ endpoint }`, { headers } );
	}

	private static fetch<R>( endpoint: string, init: RequestInit ): Promise<R | ErrorResponse> {
		return fetch( endpoint, init )
			.then( ( response ) => response.json() as Promise<R> )
			.catch( API.error502 );
	}

	private static error502(): ErrorResponse {
		return {
			success: false,
			status: 502,
			code: 'COMM_ERROR',
			message: __( 'Error communicating with the server', 'i8fjs' ),
		};
	}
}
