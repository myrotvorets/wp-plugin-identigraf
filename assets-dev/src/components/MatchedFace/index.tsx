import React, { Component, MouseEvent, ReactNode } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { MatchedFace as FoundFace } from '../../api';

type Props = FoundFace & {
	onClick?: ( link: string ) => unknown;
};

export default class MatchedFace extends Component<Props, unknown> {
	private readonly _onLinkClicked = ( e: MouseEvent<HTMLAnchorElement> ): void => {
		const { onClick } = this.props;

		if ( onClick ) {
			e.preventDefault();
			onClick( e.currentTarget.href );
		}
	};

	public render(): ReactNode {
		const { country, face, link, matchedPhoto, name, primaryPhoto, similarity } = this.props;
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

				{ country && <p className="mb-1">{ /* translators: 1: country name */ sprintf( __( 'Country: %s', 'i8fjs' ), country ) }</p> }
				{ matchedPhoto && (
					<p className="mb-1">
						<a href={ matchedPhoto } target="_blank" rel="noopener noreferrer" onClick={ this._onLinkClicked }>
							{ __( 'Matched photo', 'i8fjs' ) }
						</a>
					</p>
				) }
				{ primaryPhoto && (
					<p className="mb-1">
						<a href={ primaryPhoto } target="_blank" rel="noopener noreferrer" onClick={ this._onLinkClicked }>
							{ __( 'Primary photo', 'i8fjs' ) }
						</a>
					</p>
				) }
				<p className="mb-1">{ /* translators: 1: similarity */ sprintf( __( 'Similarity: %1$d%%', 'i8fjs' ), similarity ) }</p>
			</>
		);
	}
}
