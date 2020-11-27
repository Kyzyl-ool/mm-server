import jwt from 'jsonwebtoken';
import * as centrifugeConfig from '../../centrifugo/config.json';

export function getNewToken(userId: string) {
	return jwt.sign({sub: userId}, centrifugeConfig.token_hmac_secret_key, {
		expiresIn: '1h'
	});
}
