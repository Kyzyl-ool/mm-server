import {getManager, Repository} from 'typeorm';
import {User} from '../../../entity/user';
import {BaseContext} from 'koa';

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
			email: body.email
		}, {
			lastSeen: new Date().toISOString()
		});

		ctx.status = 200;
		return;
	}

	ctx.status = 401;
}
