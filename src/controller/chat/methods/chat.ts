import {BaseContext} from 'koa';
import {getManager, InsertResult, Repository} from 'typeorm';
import {User} from '../../../entity/user';
import {Participant} from '../../../entity/participants';
import {Chat} from '../../../entity/chat';
import {Message} from '../../../entity/message';

const avatarURL = 'https://api-private.atlassian.com/users/557058:ee55b07c-9710-4861-aeaf-d4c19d3326cb/avatar?initials=public';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IUser {
	id: number;
	name: string;
	photo: string;
	url: string;
}

interface LastMessage {
	isReadByAll: number;
	timestamp: number;
	text: string;
	id: number;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IChat {
	lastMessage: LastMessage | null;
	timestamp: number;
	users: IUser[];
	id: number;
}

async function chatParticipants(chat: Chat): Promise<User[]> {
	const participantRepository: Repository<Participant> = getManager().getRepository(Participant);
	const result = await participantRepository.find({
		where: {
			chat
		},
		relations: ['user']
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
		},
		relations: ['chat']
	});


	const chats = participantEntries.map(value => ({
		...value.chat
	}));

	return Promise.all(chats.map(async chat => {
		const users = await chatParticipants(chat);

		const message = await messageRepository.findOne({
			where: {
				chat
			},
			order: {
				createdAt: 'DESC'
			}
		});

		return ({
			id: chat.id,
			lastMessage: message ? ({
				id: message.id,
				isReadByAll: message.isReadByAll ? 1 : 0,
				text: message.text,
				timestamp: new Date(message.createdAt).getTime()
			}) : null,
			timestamp: new Date(chat.createdAt).getTime(),
			users: users.map(user => ({
				id: user.id,
				// todo: should use all names
				name: `${user.firstName}`,
				photo: avatarURL,
				url: '-',
			})),
			channel: chat.channel,
		});
	}));
}

async function _joinChat(user: User, chat: Chat): Promise<Participant> {
	const participantRepository: Repository<Participant> = getManager().getRepository(Participant);
	const result = await participantRepository.findOne({
		where: {
			chat,
			user
		}
	});

	if (!result) {
		return await participantRepository.save({
			chat,
			user,
		});
	} else {
		return result;
	}
}

export async function joinChat(userId: string, chatId: string): Promise<void> {
	const userRepository: Repository<User> = getManager().getRepository(User);
	const chatRepository: Repository<Chat> = getManager().getRepository(Chat);
	const user = await userRepository.findOne(userId);
	const chat = await chatRepository.findOne(chatId);
	await _joinChat(user, chat);
}

async function _createChat(creator: User, title: string, channel: string): Promise<InsertResult> {
	const chatRepository: Repository<Chat> = getManager().getRepository(Chat);
	return await chatRepository.insert({
		creator,
		title,
		channel
	});
}

/**
 * @param creatorId
 * @param title
 * @param participants
 * @return - chat ID
 */
export async function createChat(creatorId: string, title: string, participants: string[]): Promise<string> {
	const userRepository: Repository<User> = getManager().getRepository(User);
	const user = await userRepository.findOne(creatorId);
	const result = await _createChat(user, title, `messages#${[creatorId, ...participants].join(',')}`);
	return `${result.identifiers[0].id}`;
}
