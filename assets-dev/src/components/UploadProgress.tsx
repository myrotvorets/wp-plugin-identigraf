import React, { type ReactNode } from 'react';
import { __ } from '@wordpress/i18n';

interface Props {
	progress: number;
}

export function UploadProgress( { progress }: Readonly<Props> ): ReactNode {
	if ( isNaN( progress ) ) {
		return null;
	}

	return (
		<div className="d-flex align-items-center mb-3">
			{ __( 'Upload:', 'i8fjs' ) }{ ' ' }
			<progress max={ 100 } value={ -1 === progress ? undefined : progress } className="flex-grow-1 ms-1" />{ ' ' }
			{ progress !== -1 ? <span className="ms-1">{ progress.toFixed( 2 ) }%</span> : undefined }
		</div>
	);
}
