import {Entity, Column, PrimaryGeneratedColumn, AfterLoad} from 'typeorm';
import {Length, IsEmail} from 'class-validator';

const config = {
	user: {
		name: {
			maxLength: 80,
			minLength: 10,
		},
		email: {
			maxLength: 100,
		}
	},
};

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		length: config.user.name.maxLength
	})
	@Length(config.user.name.minLength, config.user.name.maxLength)
	firstName: string;

	@Column({
		length: config.user.name.maxLength
	})
	@Length(config.user.name.minLength, config.user.name.maxLength)
	lastName: string;

	@Column({
		length: config.user.name.maxLength
	})
	@Length(config.user.name.minLength, config.user.name.maxLength)
	middleName: string;

	@Column({
		length: config.user.email.maxLength
	})
	@IsEmail()
	email: string;

	@Column()
	passwordHash: string;

	@Column({type: 'timestamp with time zone', default: new Date().toISOString()})
	lastSeen?: string;

	@Column({type: 'timestamp with time zone', default: new Date().toISOString()})
	registeredAt?: string;

	@Column({type: 'boolean', default: false})
	isBlocked?: boolean;

	@AfterLoad()
	name() {
		return `${this.lastName} ${this.lastName} ${this.middleName}`;
	}
}

export const userSchema = {
	id: {type: 'number', required: true, example: 1},
	name: {type: 'string', required: true, example: 'Javier'},
	email: {type: 'string', required: true, example: 'avileslopez.javier@gmail.com'}
};
