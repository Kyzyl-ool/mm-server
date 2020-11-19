import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import {Message} from './message';
import {IsUrl} from 'class-validator';

@Entity()
export class Attach {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Message, message => message.id)
	message: Message;

	@Column()
	@IsUrl()
	fileUrl: string;

	@Column({type: 'timestamp with time zone'})
	createdAt: string;

	@Column({type: 'timestamp with time zone'})
	deletedAt: string;
}

