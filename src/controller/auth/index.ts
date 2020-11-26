import {request, responsesAll, summary} from 'koa-swagger-decorator';
import {BaseContext} from 'koa';
import { auth } from './methods/auth';
import {register} from './methods/register';

@responsesAll({ 200: { description: 'success'}, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
export default class AuthController {

	@request('post', '/auth')
	@summary('Authorize')
	public static async auth(ctx: BaseContext): Promise<void> {
		await auth(ctx);
	}

	@request('put', '/register')
	@summary('register')
	public static async register(ctx: BaseContext): Promise<void> {
		await register(ctx);
	}
}
