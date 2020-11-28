import {BaseContext} from 'koa';
import {getManager, InsertResult, Repository} from 'typeorm';
import {User} from '../../../entity/user';
import {Participant} from '../../../entity/participants';
import {Chat} from '../../../entity/chat';

export async function getChats(ctx: BaseContext): Promise<void> {
	const userRepository: Repository<User> = getManager().getRepository(User);
	const participantRepository: Repository<Participant> = getManager().getRepository(Participant);

	const userId = ctx.state.user.sub;

	const user = await userRepository.findOne({
		id: userId
	});

	const participantEntries = await participantRepository.find({
		where: {
			user
		}
	});

	const chats = participantEntries.map(value => ({
		...value.chat
	}));

	console.log(chats);
}

async function _joinChat(user: User, chat: Chat): Promise<Participant> {
	const participantRepository: Repository<Participant> = getManager().getRepository(Participant);
	return await participantRepository.save({
		chat,
		user,
	});
}

export async function joinChat(userId: string, chatId: string): Promise<void> {
	const userRepository: Repository<User> = getManager().getRepository(User);
	const chatRepository: Repository<Chat> = getManager().getRepository(Chat);
	const user = await userRepository.findOne(userId);
	const chat = await chatRepository.findOne(chatId);
	await _joinChat(user, chat);
}

async function _createChat(creator: User, title: string): Promise<InsertResult> {
	const chatRepository: Repository<Chat> = getManager().getRepository(Chat);
	return await chatRepository.insert({
		creator,
		title,
	});
}

/**
 * @param creatorId
 * @param title
 * @return - chat ID
 */
export async function createChat(creatorId: string, title: string): Promise<string> {
	const userRepository: Repository<User> = getManager().getRepository(User);
	const user = await userRepository.findOne(creatorId);
	const result = await _createChat(user, title);
	return `${result.identifiers[0].id}`;
}
