import React, { type ReactNode } from 'react';
import { Button, Card } from 'react-bootstrap';
import { __ } from '@wordpress/i18n';

export function NoResults(): ReactNode {
	return (
		<Card className="w-100">
			<Card.Header as="header" className="text-bg-danger">
				<h2 className="my-0 h5">{ __( 'Comparison Results', 'i8fjs' ) }</h2>
			</Card.Header>
			<Card.Body>
				<Card.Text className="text-danger">
					{ __( 'Unfortunately, the system has failed to recognize any face, or the photo contains multiple faces', 'i8fjs' ) }
				</Card.Text>
				<Button variant="primary" href="#/">
					{ __( 'Back to comparison', 'i8fjs' ) }
				</Button>
			</Card.Body>
		</Card>
	);
}
