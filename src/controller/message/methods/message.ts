import {Chat} from '../../../entity/chat';
import {Message} from '../../../entity/message';
import {getManager, InsertResult, Repository} from 'typeorm';
import {Participant} from '../../../entity/participants';
import {User} from '../../../entity/user';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IReader {
	timestamp: number;
	user: {
		id: number;
	};
	id: number;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IMessage {
	isReadByAll: number;
	timestamp: number;
	text: string;
	user: {
		id: number;
	};
	readers: IReader[];
	notifiedAt: string;
	id: number;
}

function participantToReader(participant: Participant): IReader {
	return {
		user: {
			id: participant.user.id,
		},
		timestamp: new Date(participant.createdAt).getTime(),
		id: participant.id
	};
}

function messageToFormattedMessage(message: Message, participants: Participant[]): IMessage {
	return {
		id: message.id,
		isReadByAll: message.isReadByAll ? 1 : 0,
		notifiedAt: message.createdAt,
		readers: participants.map(participantToReader),
		text: message.text,
		timestamp: new Date(message.createdAt).getTime(),
		user: {
			id: message.sender.id
		}
	};
}

export async function getMessages(chatId: number): Promise<IMessage[]> {
	const chatRepository: Repository<Chat> = getManager().getRepository(Chat);
	const participantRepository: Repository<Participant> = getManager().getRepository(Participant);

	const chat = await chatRepository.findOne(chatId, {
		relations: ['messages', 'messages.sender'],
	});

	if (!chat) {
		throw {
			response: {
				status: 400,
				body: 'Invalid chat',
			}
		};
	}

	const {messages} = chat;
	if (!messages) {
		return [];
	}
	const participants = await participantRepository.find({
		where: {
			chat
		},
		relations: ['user']
	});

	return messages.map(message => messageToFormattedMessage(message, participants));
}


async function _addMessage(sender: User, chat: Chat, text: string): Promise<InsertResult> {
	const messageRepository: Repository<Message> = getManager().getRepository(Message);

	return await messageRepository.insert({
		sender,
		text,
		chat,
	});
}

export async function addMessage(senderId: string, chatId: string, text: string): Promise<void> {
	const chatRepository: Repository<Chat> = getManager().getRepository(Chat);
	const userRepository: Repository<User> = getManager().getRepository(User);

	const chat = await chatRepository.findOne(chatId);
	const user = await userRepository.findOne(senderId);

	if (chat && user) {
		await _addMessage(user, chat, text);
	} else {
		throw {
			status: 400,
			body: 'Invalid user or chat'
		};
	}
}
