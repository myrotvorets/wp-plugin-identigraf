import React, { type ReactNode } from 'react';
import { __ } from '@wordpress/i18n';

import logo from '../img/identigraf-logo.svg';

interface Props {
	width?: number;
	text?: string;
	justifyContent?: string;
	alignItems?: string;
}

export function SmallLoader( {
	text,
	width = 100,
	justifyContent = 'center',
	alignItems = 'center',
}: Readonly<Props> ): ReactNode {
	return (
		<div className={ `d-flex justify-content-${ justifyContent } align-items-${ alignItems }` }>
			<img src={ logo } alt={ text ? '' : __( 'Please wait…', 'i8fjs' ) } width={ width } className="SmallLoader" />
			{ text && <span className="px-2">{ text }</span> }
		</div>
	);
}
