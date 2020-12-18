import {BaseContext} from 'koa';
import {User} from '../../../entity/user';
import {getManager, Repository} from 'typeorm';
import {user} from '../../index';

type RegisterRequestBody = Omit<User, 'id' | 'lastSeen' | 'registeredAt' | 'isBlocked' | 'name'>;

function checkType(value: unknown, type: string) {
	return value !== undefined && typeof value === type;
}

function isRegisterRequestBody(body: unknown): body is RegisterRequestBody {
	const typedBody = body as User;

	return typedBody && typeof typedBody === 'object' &&
		checkType(typedBody.email, 'string') &&
		checkType(typedBody.passwordHash, 'string') &&
		checkType(typedBody.middleName, 'string') &&
		checkType(typedBody.lastName, 'string') &&
		checkType(typedBody.firstName, 'string');
}

export async function register(ctx: BaseContext) {
	const {body} = ctx.request;
	if (!isRegisterRequestBody(body)) {
		ctx.status = 400;
		return;
	}

	if (body.email.length === 0 || body.firstName.length === 0 || body.lastName.length === 0 || body.middleName.length === 0) {
		ctx.status = 400;
		return;
	}

	const userRepository: Repository<User> = getManager().getRepository(User);

	const foundUser = await userRepository.findOne({
		where: {
			email: body.email,
		}
	});
	if (foundUser) {
		ctx.status = 200;
		return;
	}

	await userRepository.insert({
		...body
	});

	ctx.status = 201;
}
