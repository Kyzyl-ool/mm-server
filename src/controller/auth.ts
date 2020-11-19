import {request, responsesAll, summary} from 'koa-swagger-decorator';
import {BaseContext} from 'koa';
import {getManager, Repository} from 'typeorm';
import {User} from '../entity/user';

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


@responsesAll({ 200: { description: 'success'}, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
export default class AuthController {

	@request('post', '/auth')
	@summary('Authorize')
	public static async auth(ctx: BaseContext): Promise<void> {
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

			ctx.body = 200;
			return;
		}

		ctx.body = 401;
	}
}
