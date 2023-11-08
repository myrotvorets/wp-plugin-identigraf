interface Window {
	i8f: {
		aendpoint: string;
		iendpoint: string;
		uendpoint: string;
		vendpoint: string;
		title: string;
		baseurl: string;
	};
}

declare module '*.svg' {
	const content: string;
	export default content;
}
