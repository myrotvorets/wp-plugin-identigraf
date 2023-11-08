import React, { type ReactNode } from 'react';
import { Image } from 'react-bootstrap';
import { __, sprintf } from '@wordpress/i18n';
import { Paragraph } from '../../../Paragraph';
import { CapturedFace as RecognizedFace } from '../../../../api';

type Props = RecognizedFace;

export function Face( { minSimilarity, maxSimilarity, face }: Readonly<Props> ): ReactNode {
	return (
		<div className="d-flex flex-column position-sticky bg-white" style={ { top: '2rem' } }>
			<Image fluid rounded className="mt-3" src={ `data:image/jpeg;base64,${ face }` } alt="" />
			<Paragraph aria-label={ __( 'Similarity', 'i8fjs' ) } className="text-center">
				{ /* translators: 1: min similarity, 2: max similarity */ sprintf( __( '%1$d…%2$d%%', 'i8fjs' ), minSimilarity, maxSimilarity ) }
			</Paragraph>
		</div>
	);
}
