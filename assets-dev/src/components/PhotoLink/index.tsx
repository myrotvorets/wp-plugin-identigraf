import React, { type FunctionComponent, type MouseEvent, type ReactElement } from 'react';
import Paragraph from '../Paragraph';

interface Props {
	link: string | null;
	text: string;
	onClick: ( link: string ) => unknown;
}

const PhotoLink: FunctionComponent<Props> = ( { link, text, onClick } ): ReactElement | null => {
	if ( link ) {
		const onLinkClicked = ( e: MouseEvent<HTMLAnchorElement> ): void => {
			e.preventDefault();
			onClick( e.currentTarget.href );
		};

		return (
			<Paragraph>
				<a href={ link } target="_blank" rel="noopener noreferrer" onClick={ onLinkClicked }>
					{ text }
				</a>
			</Paragraph>
		);
	}

	return null;
};

export default PhotoLink;
