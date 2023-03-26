import React from 'react';

const Paragraph: React.FC = ( { children } ) => {
	return children ? <p className="mb-1">{ children }</p> : null;
};

export default Paragraph;
