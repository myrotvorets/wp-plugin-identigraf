import React, { type HTMLAttributes, type ReactNode } from 'react';
import { Card } from 'react-bootstrap';

interface Props extends HTMLAttributes<HTMLElement> {
	children?: ReactNode[] | ReactNode;
}

export function CardHeader( { children, className, ...attrs }: Readonly<Props> ): ReactNode {
	className = typeof className !== 'object' ? `text-bg-primary ${ className ?? '' }` : className;
	return (
		<Card.Header as="header" className={ className } { ...attrs }>
			<h2 className="my-0 h5">{ children }</h2>
		</Card.Header>
	);
}
