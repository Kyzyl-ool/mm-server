import {request, responsesAll, summary} from 'koa-swagger-decorator';
import {BaseContext} from 'koa';
import {createChat, getChats, joinChat} from '../auth/methods/chat';

@responsesAll({ 200: { description: 'success'}, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
export default class AuthController {
	@request('get', '/chat')
	@summary('Get rooms info')
	public static async getChats(ctx: BaseContext): Promise<void> {
		await getChats(ctx);
		ctx.status = 200;
	}

	@request('put', '/chat')
	@summary('Create new chat')
	public static async createChat(ctx: BaseContext): Promise<void> {
		const userId = ctx.state.user.id;
		const {title} = ctx.request.body;
		const chatId = await createChat(userId, title);
		await joinChat(userId, chatId);
		ctx.status = 201;
	}

	@request('post', '/chat/join')
	@summary('Join chat')
	public static async joinChat(ctx: BaseContext): Promise<void> {
		const userId = ctx.state.user.id;
		const {chatId} = ctx.request.body;
		await joinChat(userId, chatId);
		ctx.status = 200;
	}
}
