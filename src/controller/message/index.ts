import {path, request, responsesAll, summary} from 'koa-swagger-decorator';
import {BaseContext} from 'koa';
import {addMessage, getMessages} from './methods/message';

@responsesAll({
	200: {description: 'success'},
	400: {description: 'bad request'},
	401: {description: 'unauthorized, missing/wrong jwt token'}
})
export default class MessageController {
	@request('get', '/message/{chatId}')
	@summary('Get messages from chat')
	@path({
		chatId: {type: 'number', required: true, description: 'id of chat'}
	})
	public static async getMessages(ctx: BaseContext): Promise<void> {
		const chatId = ctx.params.chatId;

		if (chatId) {
			ctx.body = await getMessages(chatId);
			ctx.status = 200;
			return;
		}

		ctx.status = 400;
		ctx.body = 'Invalid chat';
	}

	@request('put', '/message/{chatId}')
	@summary('Get messages from chat')
	@path({
		chatId: {type: 'number', required: true, description: 'id of chat'}
	})
	public static async sendMessage(ctx: BaseContext): Promise<void> {
		const userId = `${ctx.state.user.sub}`;
		const chatId = ctx.params.chatId;
		const {text} = ctx.request.body;

		if (userId && chatId && text) {
			try {
				await addMessage(userId, chatId, text);
				ctx.status = 201;
				return;
			} catch (e) {
				ctx.status = e.status;
				ctx.body = e.body;
				return;
			}
		}

		ctx.status = 400;
		ctx.body = 'Invalid user, chat or empty text';
	}
}
