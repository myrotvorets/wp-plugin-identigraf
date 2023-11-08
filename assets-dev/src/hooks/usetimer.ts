import { useEffect, useRef } from 'react';

export const useTimer = ( callback: () => void, delay: number | undefined, trigger: unknown ): void => {
	const savedCallback = useRef( callback );

	useEffect( () => {
		savedCallback.current = callback;
	}, [ callback ] );

	useEffect( () => {
		if ( delay === undefined ) {
			return undefined;
		}

		const timerId = self.setTimeout( savedCallback.current, delay );
		return () => {
			self.clearTimeout( timerId );
		};
	}, [ delay, trigger ] );
};
