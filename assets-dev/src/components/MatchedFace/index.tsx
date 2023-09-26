import React, { Component, type ReactNode } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import type { MatchedFace as FoundFace } from '../../api';
import PhotoLink from '../PhotoLink';
import Paragraph from '../Paragraph';

type Props = FoundFace & {
	onClick: ( link: string ) => unknown;
};

export default class MatchedFace extends Component<Props, unknown> {
	public render(): ReactNode {
		const { country, face, link, matchedPhoto, name, onClick, primaryPhoto, similarity } = this.props;
		return (
			<>
				<a
					href={ link ? link.replace( 'https://myrotvorets.center', self.i8f.baseurl ) : '#' }
					target="_blank"
					rel="noopener noreferrer"
					className="text-danger fw-bold text-decoration-none fs-3"
				>
					{ name || __( 'Unknown person', 'i8fjs' ) }
				</a>
				<img
					src={ `data:image/jpeg;base64,${ face }` }
					className="img-fluid img-thumbnail d-block mb-2"
					alt={ __( 'Face', 'i8fjs' ) }
				/>

				{ country && <Paragraph>{ /* translators: 1: country name */ sprintf( __( 'Country: %s', 'i8fjs' ), country ) }</Paragraph> }
				<PhotoLink link={ matchedPhoto } text={ __( 'Matched photo', 'i8fjs' ) } onClick={ onClick } />
				<PhotoLink link={ primaryPhoto } text={ __( 'Primary photo', 'i8fjs' ) } onClick={ onClick } />
				<Paragraph>{ /* translators: 1: similarity */ sprintf( __( 'Similarity: %1$d%%', 'i8fjs' ), similarity ) }</Paragraph>
			</>
		);
	}
}
