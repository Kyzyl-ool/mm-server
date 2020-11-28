import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import {User} from './user';
import {Chat} from './chat';

enum MessageType {
	MESSAGE_TEXT = 'MESSAGE_TEXT',
	MESSAGE_IMAGE = 'MESSAGE_IMAGE',
	MESSAGE_ATTACH = 'MESSAGE_ATTACH',
}

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		length: 255
	})
	text: string;

	@ManyToOne(() => User)
	sender: User;

	@ManyToOne(() => Chat, chat => chat.id)
	chat: Chat;

	@Column({type: 'enum', enum: MessageType, default: 'MESSAGE_TEXT'})
	type: MessageType;

	@Column({type: 'timestamp with time zone', default: new Date().toISOString()})
	createdAt: string;

	@Column({type: 'timestamp with time zone', nullable: true})
	deletedAt: string;

	@Column({type:'boolean', default: false})
	isReadByAll: boolean;
}
