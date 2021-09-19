import React, { ReactElement } from 'react';
import { ProgressBar } from 'react-bootstrap';

export interface UploadProgressProps {
	progress: number | null | undefined;
}

export default function UploadProgress( { progress }: UploadProgressProps ): ReactElement | null {
	if ( progress === null || progress === undefined ) {
		return null;
	}

	return (
		<div className="d-flex align-items-center mb-3">
			Upload:
			<ProgressBar
				now={ -1 === progress ? 100 : progress }
				striped={ -1 === progress }
				animated
				className="flex-fill mx-1"
			/>
			{ progress !== -1 ? <span>{ progress.toFixed( 2 ) }%</span> : undefined }
		</div>
	);
}
