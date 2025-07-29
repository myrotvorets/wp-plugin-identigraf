import React, { type ReactNode } from 'react';
import { Col, Image, ListGroup, Row } from 'react-bootstrap';
import { __, sprintf } from '@wordpress/i18n';
import { PhotoLink } from '../../PhotoLink';
import { MatchedFace as FoundFace } from '../../../../api';

type Props = FoundFace & {
	onClick: ( link: string ) => unknown;
};

export function Face( {
	country,
	face,
	link,
	matchedPhoto,
	name,
	onClick,
	primaryPhoto,
	similarity,
}: Readonly<Props> ): ReactNode {
	return (
		<ListGroup.Item>
			<Row>
				<Col>
					<a
						href={ link ?? '#' }
						target="_blank"
						rel="noopener noreferrer"
						className="text-danger fw-bold text-decoration-none fs-3"
					>
						{ name ?? __( 'Unknown person', 'i8fjs' ) }
					</a>
				</Col>
			</Row>
			<Row>
				<Col sm="auto">
					<Image
						fluid
						thumbnail
						src={ `data:image/jpeg;base64,${ face }` }
						className="d-block mb-2"
						alt={ __( 'Face', 'i8fjs' ) }
					/>
				</Col>
				<Col sm={ 4 }>
					{ country && <p className="mb-1">{ /* translators: %s: country name */ sprintf( __( 'Country: %s', 'i8fjs' ), country ) }</p> }
					<PhotoLink link={ matchedPhoto } text="Світлина, яка збіглась" onClick={ onClick } />
					<PhotoLink link={ primaryPhoto } text="Основна світлина" onClick={ onClick } />
					<p className="mb-1">{ /* translators: 1: similarity */ sprintf( __( 'Similarity: %1$d%%', 'i8fjs' ), similarity ) }</p>
				</Col>
			</Row>
		</ListGroup.Item>
	);
}
