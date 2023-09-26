import React, { type FunctionComponent, type ReactNode } from 'react';

interface Props {
	children?: ReactNode;
}

const Paragraph: FunctionComponent<Props> = ( { children } ) => {
	return children ? <p className="mb-1">{ children }</p> : null;
};

export default Paragraph;
