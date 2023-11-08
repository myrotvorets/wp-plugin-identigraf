import React, { type ReactNode } from 'react';
import { Button, Card, Carousel, Image } from 'react-bootstrap';
import { __, sprintf } from '@wordpress/i18n';

interface Props {
	guid: string;
	results: Record<string, number>;
}

export function Results( { guid, results }: Readonly<Props> ): ReactNode {
	const similarities = Object.values( results );

	return (
		<Card className="w-100">
			<Card.Header className="text-bg-primary">{ __( 'Comparison Results', 'i8fjs' ) }</Card.Header>

			<Card.Body>
				<Image
					fluid
					className="d-block mx-auto mb-3"
					src={ `${ self.i8f.uendpoint }/get/${ guid }/0` }
					alt={ __( 'Compared photo', 'i8fjs' ) }
					style={ { maxHeight: '35vh' } }
				/>

				<Carousel interval={ null } fade style={ { height: '40vh' } } className="mb-3">
					{ similarities.map( ( similarity, index ) => (
						<Carousel.Item key={ index /* NOSONAR */ }>
							<Image
								fluid
								className="d-block mx-auto"
								src={ `${ self.i8f.uendpoint }/get/${ guid }/${ index + 1 }` }
								alt={ /* translators: 1: photo number */ sprintf( __( 'Photo %1$d', 'i8fjs' ), index + 1 ) }
								style={ { maxHeight: '35vh' } }
							/>
							<Carousel.Caption><strong>{ __( 'Similarity:', 'i8fjs' ) }</strong> { similarity }%</Carousel.Caption>
						</Carousel.Item>
					) ) }
				</Carousel>
				<Button variant="primary" href="#/">
					{ __( 'New comparison', 'i8fjs' ) }
				</Button>
			</Card.Body>
		</Card>
	);
}
