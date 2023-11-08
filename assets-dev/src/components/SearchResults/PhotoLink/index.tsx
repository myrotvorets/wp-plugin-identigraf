import React, { type MouseEvent, type ReactNode, useCallback } from 'react';

interface Props {
	link: string | null;
	text: string;
	onClick: ( link: string ) => unknown;
}

export function PhotoLink( { link, text, onClick }: Readonly<Props> ): ReactNode {
	const onLinkClicked = useCallback(
		( e: MouseEvent<HTMLAnchorElement> ): void => {
			e.preventDefault();
			onClick( e.currentTarget.href );
		},
		[ onClick ],
	);

	if ( link ) {
		return (
			<p className="mb-1">
				<a href={ link } target="_blank" rel="noopener noreferrer" onClick={ onLinkClicked }>
					{ text }
				</a>
			</p>
		);
	}

	return null;
}
