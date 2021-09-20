import React, { ReactElement } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { CapturedFace as RecognizedFace } from '../../api';

type Props = RecognizedFace;

export default function CapturedFace( { minSimilarity, maxSimilarity, face }: Props ): ReactElement {
	return (
		<div className="d-flex flex-column position-sticky bg-white" style={ { top: '2rem' } }>
			<h4 className="d-sm-none">{ __( 'Recognized face', 'i8fjs' ) }</h4>
			<img className="face img-fluid mt-3 rounded" src={ `data:image/jpeg;base64,${ face }` } alt="" />
			<p aria-label="Similarity" className="text-center">
				{ /* translators: 1: min similarity, 2: max similarity */ sprintf( __( '%1$d…%2$d%%', 'i8fjs' ), minSimilarity, maxSimilarity ) }
			</p>
		</div>
	);
}
