import React, { ReactElement } from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { __ } from '@wordpress/i18n';

export default function WaitForm(): ReactElement {
	return (
		<Card>
			<Card.Header>{ __( 'Processing the request', 'i8fjs' ) }</Card.Header>
			<Card.Body>
				<Card.Title>{ __( 'Please wait…', 'i8fjs' ) }</Card.Title>
				<ProgressBar now={ 100 } striped animated />
			</Card.Body>
		</Card>
	);
}
