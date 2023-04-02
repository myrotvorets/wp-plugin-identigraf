import { type Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import commonConfig from './webpack.common';

export default function(): Configuration {
	return merge( commonConfig, {
		mode: 'production',
		output: {
			pathinfo: false,
			crossOriginLoading: 'anonymous',
		},
		optimization: {
			moduleIds: 'deterministic',
			minimizer: [
				new TerserPlugin( {
					terserOptions: {
						output: {
							comments: false,
							ecma: 2017,
							safari10: true,
						},
						sourceMap: true,
						mangle: true,
						compress: {
							ecma: 2017,
							module: true,
							keep_fargs: false,
							pure_getters: true,
							hoist_funs: true,
							pure_funcs: [
								'classCallCheck',
								'_classCallCheck',
								'_possibleConstructorReturn',
								'Object.freeze',
								'invariant',
								'warning',
							],
						},
					},
					extractComments: false,
				} ),
			],
			minimize: true,
		},
	} as Configuration );
}
