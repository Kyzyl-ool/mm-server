import jwt from 'jsonwebtoken';
import * as centrifugeConfig from '../../centrifugo/config.json';

export function getNewToken(userId: string) {
	return jwt.sign({}, centrifugeConfig.token_hmac_secret_key, {
		subject: userId,
		expiresIn: '1h'
	});
}
