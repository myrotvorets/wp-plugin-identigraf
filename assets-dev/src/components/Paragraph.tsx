import React, { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children?: ReactNode[] | ReactNode;
}

export function Paragraph( { children, className, ...props }: Readonly<Props> ): ReactNode {
	className = typeof className !== 'object' ? `mb-3 ${ className ?? '' }` : className;
	return (
		<p className={ className } { ...props }>
			{ children }
		</p>
	);
}
