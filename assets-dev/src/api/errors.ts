import type { ErrorResponse } from './types';

const errors: Record<string, string> = {
	AUTHORIZATION_FAILED: 'Прикра помилка авторизації.',
	AUTHORIZATION_REQUIRED: 'Для виконання цієї дії потрібна авторизація.',
	BAD_GATEWAY: 'Помилка спілкування з сервером',
	COMM_ERROR: 'Помилка спілкування з сервером',
	UNKNOWN_ERROR: 'Несподівана помилка.',
};

export function decodeErrorCode( code: string ): string {
	return errors[ code ] || 'Несподівана помилка.';
}

export function decodeErrorResponse( r: ErrorResponse ): string {
	const error = errors[ r.code ];
	return error ?? r.message;
}
