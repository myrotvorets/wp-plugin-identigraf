export interface ErrorResponse {
	success: false;
	status: number;
	code: string;
	message: string;
}

export interface CheckPhoneResponse {
	success: true;
	user: {
		phone: string;
		admin: number;
		whitelisted: number;
		credits: number;
	} | null;
}

export interface LoginResponse {
	success: true;
	user: {
		phone: string;
		admin: number;
		whitelisted: number;
		credits: number;
	};
}

export interface CompareUploadResponse {
	success: true;
	guid: string;
}

interface CompareInProgressResponse {
	success: true;
	status: 'inprogress';
}

interface CompareCompletedResponse {
	success: true;
	status: 'complete' | 'nofaces';
	matches: Record<string, number>;
	numFiles: number;
}

export type CompareStatusResponse = CompareInProgressResponse | CompareCompletedResponse;

export interface SearchUploadResponse {
	success: true;
	guid: string;
}

interface SearchInProgressResponse {
	success: true;
	status: 'inprogress';
}

export interface CapturedFace {
	faceID: number;
	minSimilarity: number;
	maxSimilarity: number;
	face: string;
}

interface SearchCompletedResponse {
	success: true;
	status: 'complete';
	faces: CapturedFace[];
}

export type SearchStatusResponse = SearchInProgressResponse | SearchCompletedResponse;

export interface MatchedFace {
	similarity: number;
	objname: string;
	face: string;
	name: string | null;
	country: string | null;
	link: string | null;
	primaryPhoto: string | null;
	matchedPhoto: string | null;
}

export interface MatchedFacesResponse {
	success: true;
	matches: MatchedFace[];
}
