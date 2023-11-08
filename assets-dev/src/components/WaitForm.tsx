import React, { type ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { __ } from '@wordpress/i18n';
import { CardHeader } from './CardHeader';
import { SmallLoader } from './SmallLoader';

export function WaitForm(): ReactNode {
	return (
		<Card className="w-100">
			<CardHeader>{ __( 'Processing the request', 'i8fjs' ) }</CardHeader>
			<Card.Body>
				<SmallLoader width={ 200 } text={ __( 'Please wait…', 'i8fjs' ) } justifyContent="start" />
			</Card.Body>
		</Card>
	);
}
