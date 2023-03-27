import { type Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import path from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import commonConfig from './webpack.common';

export default function(): Configuration {
	const devConfig: Configuration = {
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
			} ),
		],
	};

	return merge( commonConfig, devConfig );
}
