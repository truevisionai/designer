/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MultiCmdsCommand } from 'app/commands/multi-cmds-command';
import { ICommand } from './command';
import { Log } from 'app/core/utils/log';

export class CommandHistory {

	private static undos: ICommand[] = [];
	private static redos: ICommand[] = [];

	static clear (): void {

		Log.info( 'clear history' );

		this.undos.splice( 0, this.undos.length );

		this.redos.splice( 0, this.redos.length );

	}

	static execute ( command: ICommand ): void {

		Log.info( 'execute ', command.toString() );

		this.undos.push( command );

		command.execute();

		// clear all redos on a new action
		this.redos.splice( 0, this.redos.length );

	}

	static executeMany ( ...cmds: ICommand[] ): void {

		this.execute( new MultiCmdsCommand( cmds ) );

	}

	static undo (): void {

		if ( this.undos.length > 0 ) {

			const command = this.undos.pop();

			Log.info( 'undo ', command.toString() );

			command.undo();

			this.redos.push( command );

		} else {

			Log.info( 'nothing to undo ' );

		}

	}

	static redo (): void {

		if ( this.redos.length > 0 ) {

			const command = this.redos.pop();

			Log.info( 'redo ', command.toString() );

			command.redo();

			this.undos.push( command );

		} else {

			Log.info( 'nothing to redo ' );

		}
	}

	static getUndosCount (): number {

		return this.undos.length;

	}

	static getRedosCount (): number {

		return this.redos.length;

	}

}
