import React, { ReactElement } from 'react';
import { Image } from 'react-bootstrap';
import { __ } from '@wordpress/i18n';

export interface PhotoPreviewProps {
	image: string | null;
}

export default function PhotoPreview( { image }: PhotoPreviewProps ): ReactElement | null {
	return image && image.length > 0 ? <Image src={ image } alt={ __( 'Face to search', 'i8fjs' ) } fluid className="mb-3" /> : null;
}
