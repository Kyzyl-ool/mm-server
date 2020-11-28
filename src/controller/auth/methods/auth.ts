import {getManager, Repository} from 'typeorm';
import {User} from '../../../entity/user';
import {BaseContext} from 'koa';
import jwt from 'jsonwebtoken';
import * as centrifugeConfig from '../../../../centrifugo/config.json';
import {getNewToken} from '../../../utils/token';
import {config} from '../../../config';


interface AuthRequestBody {
	email: string;
	passwordHash: string;
}

function isAuthRequestBody(body: unknown): body is AuthRequestBody {
	const typedBody = body as AuthRequestBody;

	return typedBody && typeof typedBody === 'object' &&
		typedBody.email !== undefined && typeof typedBody.email === 'string' &&
		typedBody.passwordHash !== undefined && typeof typedBody.passwordHash === 'string';
}

/**
 * Обновляет при необходимости jwt-токен от центрифуги пользователя user
 * @param user
 */
function updateCentrifugeToken(user: User) {
	let centrifugoToken: string = user.centrifugoToken;

	if (!centrifugoToken) {
		centrifugoToken = getNewToken(user.id.toString());
	} else {
		jwt.verify(centrifugoToken, centrifugeConfig.token_hmac_secret_key, function (err) {
			if (err instanceof jwt.TokenExpiredError) {
				centrifugoToken = getNewToken(user.id.toString());
			}
		});
	}

	return centrifugoToken;
}

export async function auth(ctx: BaseContext) {
	const {body} = ctx.request;
	if (!isAuthRequestBody(body)) {
		ctx.status = 400;
		return;
	}

	const userRepository: Repository<User> = getManager().getRepository(User);
	const user = await userRepository.findOne({
		where: {
			email: body.email,
			passwordHash: body.passwordHash
		}
	});

	if (user) {
		await userRepository.update({
			email: body.email,
		}, {
			lastSeen: new Date().toISOString(),
			centrifugoToken: updateCentrifugeToken(user),
		});

		ctx.status = 200;
		ctx.body = {
			centrifugoToken: user.centrifugoToken,
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			middleName: user.middleName,
			email: user.email,
			isBlocked: user.isBlocked,
			token: jwt.sign({sub: user.id}, config.jwtSecret, {expiresIn: '1h'}),
		};
		return;
	}

	ctx.status = 401;
}

function isBearerToken(token: unknown): token is string {
	return token && typeof token === 'string' && token.startsWith('Bearer ');
}

export function checkAuth(ctx: BaseContext) {
	const bearerToken = ctx.header['Authorization'];
	if (isBearerToken(bearerToken)) {
		const token =	bearerToken.split(' ')[1];

		jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
			if (err) {
				ctx.status = 401;
				throw err;
			}
			console.log('decoded', decoded);
		});
	}

	ctx.status = 401;

	throw ctx;
}
