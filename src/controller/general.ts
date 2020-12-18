import {BaseContext} from 'koa';
import {description, request, summary, tagsAll} from 'koa-swagger-decorator';
import {getManager, Repository} from 'typeorm';
import {User} from '../entity/user';
import {DateTime} from 'luxon';

@tagsAll(['General'])
export default class GeneralController {

	@request('get', '/')
	@summary('Welcome page')
	@description('A simple welcome message to verify the service is up and running.')
	public static async helloWorld(ctx: BaseContext): Promise<void> {
		ctx.body = 'Hello World!';
	}

	@request('get', '/online')
	@summary('Get online users')
	public static async getOnlineUsers(ctx: BaseContext): Promise<void> {
		const userRepository: Repository<User> = getManager().getRepository(User);

		const users = await userRepository.find();

		ctx.body = users.filter(value => DateTime.fromJSDate(new Date(value.lastSeen)).diffNow().as('minute') <= 5).length;
		ctx.status = 200;
	}
}
