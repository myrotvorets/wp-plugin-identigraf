import React, { type ReactNode } from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';
import { __, sprintf } from '@wordpress/i18n';
import { Face } from './Face';
import { MatchedFaces } from '../MatchedFaces';
import { CapturedFace as RecognizedFace } from '../../../api';

interface Props {
	face: RecognizedFace;
	guid: string;
	index: number;
}

export function CapturedFace( { face, guid, index }: Readonly<Props> ): ReactNode {
	return (
		<ListGroup.Item>
			<Row>
				<Col>
					<h3>{ /* translators: %d - face number */ sprintf( __( 'Face %d', 'i8fjs' ), index + 1 ) }</h3>
				</Col>
			</Row>
			<Row>
				<Col md={ 2 } className="position-sticky bg-white" style={ { zIndex: 1000, top: 0 } }>
					<Face { ...face } />
				</Col>
				<Col>
					<MatchedFaces faceID={ face.faceID } guid={ guid } />
				</Col>
			</Row>
		</ListGroup.Item>
	);
}
