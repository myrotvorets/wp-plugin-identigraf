import webpack from 'webpack';
import { merge } from 'webpack-merge';
import path from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import commonConfig from './webpack.common';

export default function(): webpack.Configuration {
	const devConfig: webpack.Configuration = {
		mode: 'development',
		module: {
			rules: [
				{
					test: /\.s?css$/u,
					use: [ 'style-loader', 'css-loader', 'sass-loader' ],
				},
			],
		},
		plugins: [
			new ForkTsCheckerWebpackPlugin( {
				typescript: {
					configFile: path.resolve( `${ __dirname }'/../../tsconfig.json` ),
				},
				eslint: {
					enabled: true,
					files: [ 'src/**/*.{ts,tsx}' ],
				},
			} ),
		],
	};

	return merge( commonConfig, devConfig );
}
