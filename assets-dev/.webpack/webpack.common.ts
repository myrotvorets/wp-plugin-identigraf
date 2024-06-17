import path from 'node:path';
import { type Configuration, DefinePlugin } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';
import type { Config as SVGOConfig } from 'svgo';

const isProd = process.env[ 'NODE_ENV' ] === 'production';

const config: Configuration & { devServer: DevServerConfiguration } = {
	context: path.resolve( __dirname, '..' ),
	entry: {
		search: path.resolve( __dirname, '../src/search.tsx' ),
		compare: path.resolve( __dirname, '../src/compare.tsx' ),
		video: path.resolve( __dirname, '../src/video.tsx' ),
		bootstrap: path.resolve( __dirname, '../src/bootstrap.scss' ),
		lightbox: require.resolve( 'yet-another-react-lightbox/styles.css' ),
	},
	output: {
		path: path.resolve( __dirname, '../../assets' ),
		filename: '[name].min.js',
		chunkFilename: '[name].[chunkhash:5].min.js',
		assetModuleFilename: '[name].[contenthash:5][ext]',
		pathinfo: ! isProd,
		globalObject: 'self',
		scriptType: 'module',
		crossOriginLoading: 'anonymous',
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'@wordpress/api-fetch': 'wp.apiFetch',
		'@wordpress/i18n': 'wp.i18n',
	},
	node: {
		global: true,
	},
	devtool: isProd ? false : 'eval-cheap-source-map',
	mode: ( process.env[ 'NODE_ENV' ] ?? 'development' ) as 'development' | 'production' | 'none',
	resolve: {
		extensions: [ '.mjs', '.js', '.jsx', '.ts', '.tsx' ],
	},
	devServer: {
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		compress: true,
		port: 8081,
		historyApiFallback: true,
		hot: true,
		static: path.resolve( __dirname, '../../assets' ),
		devMiddleware: {
			publicPath: '/wp-content/plugins/wp-identigraf/assets',
			writeToDisk: true,
		},
	},
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.tsx?$/u,
				exclude: /node_modules/u,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.(png|jpe?g|webp)$/u,
				type: 'asset/resource',
			},
			{
				test: /\.svg$/u,
				type: 'asset',
				parser: {
					dataUrlCondition: {
						maxSize: 1024,
					},
				},
				use: [
					{
						loader: 'svgo-loader',
						options: {
							multipass: true,
							plugins: [
								{
									name: 'preset-default',
									params: {
										overrides: {
											removeEmptyContainers: false,
										},
									},
								},
							],
						} as SVGOConfig,
					},
				],
			},
			{
				test: /\.s?css$/u,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: false,
							importLoaders: 1,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: false,
							postcssOptions: {
								config: path.resolve( path.join( __dirname, '..' ) ),
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: false,
						},
					},
				],
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new DefinePlugin( {
			'process.env.NODE_ENV': JSON.stringify( isProd ? 'production' : 'development' ),
		} ),
		new MiniCssExtractPlugin( {
			filename: '[name].min.css',
			chunkFilename: '[name].[contenthash:5].min.css',
		} ),
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		new RemoveEmptyScriptsPlugin(),
	],
	optimization: {
		removeEmptyChunks: true,
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/u,
					name: 'rtl',
					chunks: 'all',
				},
			},
		},
		// runtimeChunk: 'single',
	},
};

export default config;
