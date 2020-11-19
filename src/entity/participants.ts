import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import {User} from './user';
import {Chat} from './chat';

@Entity()
export class Participant {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Chat, chat => chat.id)
	chat: Chat;

	@ManyToOne(() => User, user => user.id)
	user: User;

	@Column({type: 'timestamp with time zone'})
	createdAt: string;

	@Column({type: 'timestamp with time zone'})
	deletedAt: string;
}
