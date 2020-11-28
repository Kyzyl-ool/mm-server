import {BaseContext} from 'koa';
import {getManager, InsertResult, Repository} from 'typeorm';
import {User} from '../../../entity/user';
import {Participant} from '../../../entity/participants';
import {Chat} from '../../../entity/chat';
import {Message} from '../../../entity/message';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IUser {
	id: number;
	name: string;
	photo: string;
	url: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IChat {
	lastMessage: {
		isReadByAll: number;
		timestamp: number;
		text: string;
		id: number;
	};
	timestamp: number;
	users: IUser[];
	id: number;
}

async function chatParticipants(chat: Chat): Promise<User[]> {
	const participantRepository: Repository<Participant> = getManager().getRepository(Participant);
	const result = await participantRepository.find({
		where: {
			chat,
		}
	});

	return result.map(participant => participant.user);
}

export async function getChats(ctx: BaseContext): Promise<IChat[]> {
	const userRepository: Repository<User> = getManager().getRepository(User);
	const participantRepository: Repository<Participant> = getManager().getRepository(Participant);
	const messageRepository: Repository<Message> = getManager().getRepository(Message);

	const userId = `${ctx.state.user.sub}`;

	const user = await userRepository.findOne({
		id: +userId
	});

	const participantEntries = await participantRepository.find({
		where: {
			user
		}
	});


	const chats = participantEntries.map(value => ({
		...value.chat
	}));

	const message = await messageRepository.findOne({
		order: {
			createdAt: 'DESC'
		}
	});

	return Promise.all(chats.map(async chat => {
		const users = await chatParticipants(chat);

		return ({
			id: chat.id,
			lastMessage: {
				id: message.id,
				isReadByAll: message.isReadByAll ? 1 : 0,
				text: message.text,
				timestamp: new Date(message.createdAt).getTime()
			},
			timestamp: new Date(chat.createdAt).getTime(),
			users: users.map(user => ({
				id: user.id,
				name: `${user.lastName} ${user.firstName[0]}. ${user.middleName[0]}.`,
				photo: '-',
				url: '-',
			}))
		});
	}));
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
