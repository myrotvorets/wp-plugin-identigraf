import apiFetch from '@wordpress/api-fetch';
import { __, _nx } from '@wordpress/i18n';
import type { CompareStatusResponse, ErrorResponse, MatchedFacesResponse, SearchStatusResponse } from './types';
export * from './errors';
export * from './types';

interface TokenResponse {
	token: string;
}

export default class API {
	public static getApiToken(): Promise<string> {
		return apiFetch<TokenResponse>( { path: '/identigraf/v2/token' } )
			.then( ( data: TokenResponse ) => data.token )
			.catch( () => {
				throw new Error( __( 'Error getting the authentication token', 'i8fjs' ) );
			} );
	}

	public static checkCompareStatus( guid: string ): Promise<CompareStatusResponse | ErrorResponse> {
		return API.get( `/compare/${ guid }` );
	}

	public static checkSearchStatus( guid: string ): Promise<SearchStatusResponse | ErrorResponse> {
		return API.get( `/search/${ guid }` );
	}

	public static getMatchedFaces( guid: string, faceID: number ): Promise<MatchedFacesResponse | ErrorResponse> {
		return API.get( `/search/${ guid }/matches/${ faceID }/0/20` );
	}

	private static get<R>( endpoint: string, auth?: string ): Promise<R | ErrorResponse> {
		const headers: Record<string, string> = {
			Accept: 'application/json',
		};

		if ( auth ) {
			headers.Authorization = `Bearer ${ auth }`;
		}

		return API.fetch<R>( `${ self.i8f.endpoint }${ endpoint }`, { headers } );
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
