import crypto from 'crypto';

export function SHA256(value: string): string {
	return crypto.createHash('sha256').update(value).digest('base64');
}
