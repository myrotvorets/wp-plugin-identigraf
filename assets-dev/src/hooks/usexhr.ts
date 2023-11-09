import { useCallback, useEffect, useState } from 'react';
import { token } from '../signals';

export interface XHRResponse {
	response: string;
	status: number;
	url: string;
	headers: Record<string, string>;
}

export interface UseXHRResult {
	progress: number;
	error: Error | null;
	response: XHRResponse | null;
	finished: boolean;
}

export const useXHR = ( url: string, data: FormData | undefined ): UseXHRResult => {
	const [ progress, setProgress ] = useState( NaN );
	const [ error, setError ] = useState<Error | null>( null );
	const [ response, setResponse ] = useState<XHRResponse | null>( null );
	const [ finished, setFinished ] = useState( false );

	const onProgress = useCallback( ( e: ProgressEvent<XMLHttpRequestEventTarget> ) => {
		const val = e.lengthComputable ? ( e.loaded / e.total ) * 100 : -1;
		setProgress( val );
	}, [] );

	const onError = useCallback( () => {
		setProgress( NaN );
		setFinished( true );
		setError( new Error() );
	}, [] );

	const onLoad = useCallback( ( e: ProgressEvent<XMLHttpRequestEventTarget> ) => {
		const req = e.currentTarget as XMLHttpRequest;
		const headers = req.getAllResponseHeaders();
		const arr = headers.trim().split( /[\r\n]+/u );
		const headerMap: Record<string, string> = {};
		arr.forEach( ( line ) => {
			const parts = line.split( ': ', 2 );
			const header = parts[ 0 ]!;
			const value = parts[ 1 ] ?? '';
			headerMap[ header ] = value;
		} );

		setProgress( NaN );
		setFinished( true );
		setResponse( {
			response: req.responseText,
			status: req.status,
			url: req.responseURL,
			headers: headerMap,
		} );
	}, [] );

	useEffect( () => {
		if ( url && data ) {
			const req = new XMLHttpRequest();
			req.upload.addEventListener( 'progress', onProgress );
			req.addEventListener( 'error', onError );
			req.addEventListener( 'load', onLoad );
			req.open( 'POST', url );
			req.setRequestHeader( 'Authorization', `Bearer ${ token.value }` );
			req.send( data );
		}
	}, [ data, onError, onLoad, onProgress, url ] );

	return { progress, error, response, finished };
};
