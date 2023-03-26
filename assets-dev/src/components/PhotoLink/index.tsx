import React from 'react';
import Paragraph from '../Paragraph';

interface Props {
	link: string | null;
	text: string;
	onClick: ( link: string ) => unknown;
}

const PhotoLink: React.FC<Props> = ( { link, text, onClick } ): React.ReactElement | null => {
	if ( link ) {
		const onLinkClicked = ( e: React.MouseEvent<HTMLAnchorElement> ): void => {
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
