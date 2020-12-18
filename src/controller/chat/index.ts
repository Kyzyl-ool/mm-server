import {request, responsesAll, summary} from 'koa-swagger-decorator';
import {BaseContext} from 'koa';
import {createChat, getChats, joinChat} from './methods/chat';

@responsesAll({ 200: { description: 'success'}, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
export default class ChatController {
	@request('get', '/chat')
	@summary('Get rooms info')
	public static async getChats(ctx: BaseContext): Promise<void> {
		ctx.status = 200;
		ctx.body = await getChats(ctx);
	}

	@request('put', '/chat')
	@summary('Create new chat')
	public static async createChat(ctx: BaseContext): Promise<void> {
		const userId = `${ctx.state.user.sub}`;
		const {title, participants = []} = ctx.request.body;
		const chatId = await createChat(userId, title, participants);
		await joinChat(userId, chatId);
		await Promise.all(participants.map(async (value: string) => {
			return joinChat(value, chatId);
		}));
		ctx.status = 201;
	}

	@request('post', '/chat/join')
	@summary('Join chat')
	public static async joinChat(ctx: BaseContext): Promise<void> {
		const userId = `${ctx.state.user.sub}`;
		const {chatId} = ctx.request.body;
		await joinChat(userId, chatId);
		ctx.status = 200;
	}
}
