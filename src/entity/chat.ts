import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToMany, JoinTable} from 'typeorm';
import {Message} from './message';
import {User} from './user';

@Entity()
export class Chat {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({length: 255})
	title: string;

	@OneToOne(() => User, user => user.id)
	creator: User;

	@OneToMany(() => Message, message => message.id)
	messages: Message[];

	@Column({type: 'timestamp with time zone', default: new Date().toISOString()})
	createdAt: string;

	@Column({type: 'timestamp with time zone', nullable: true})
	deletedAt: string;
}

