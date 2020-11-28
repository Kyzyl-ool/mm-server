import {path, request, responsesAll, summary} from 'koa-swagger-decorator';
import {BaseContext} from 'koa';
import {addMessage, getMessages} from './methods/message';

@responsesAll({ 200: { description: 'success'}, 400: { description: 'bad request'}, 401: { description: 'unauthorized, missing/wrong jwt token'}})
export default class MessageController {
	@request('get', '/message/{chatId}')
	@summary('Get messages from chat')
	@path({
		chatId: { type: 'number', required: true, description: 'id of chat' }
	})
	public static async getMessages(ctx: BaseContext): Promise<void> {
		const chatId = ctx.params.id;

		ctx.body = await getMessages(chatId);
		ctx.status = 200;
	}

	@request('put', '/message/{chatId}')
	@summary('Get messages from chat')
	@path({
		chatId: { type: 'number', required: true, description: 'id of chat' }
	})
	public static async sendMessage(ctx: BaseContext): Promise<void> {
		const userId = ctx.state.user.id;
		const chatId = ctx.params.id;
		const {text} = ctx.request.body;

		await addMessage(userId, chatId, text);
		ctx.status = 201;
	}
}
