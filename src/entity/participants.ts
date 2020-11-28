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

	@Column({type: 'timestamp with time zone', default: new Date().toISOString()})
	createdAt: string;

	@Column({type: 'timestamp with time zone', nullable: true})
	deletedAt: string;
}
