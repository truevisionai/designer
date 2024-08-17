/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MultiCmdsCommand } from 'app/commands/multi-cmds-command';
import { Environment } from 'app/core/utils/environment';
import { ICommand } from './command';

export class CommandHistory {

	private static undos: ICommand[] = [];
	private static redos: ICommand[] = [];

	private static get debug (): boolean {
		return !Environment.production;
	}

	static clear (): void {

		if ( this.debug ) console.debug( 'clear history' );

		this.undos.splice( 0, this.undos.length );

		this.redos.splice( 0, this.redos.length );

	}

	static execute ( cmd: ICommand ): void {

		if ( this.debug ) console.debug( 'execute ', cmd );

		this.undos.push( cmd );

		cmd.execute();

		// clear all redos on a new action
		this.redos.splice( 0, this.redos.length );

	}

	static executeAll ( cmds: ICommand[] ): void {

		this.execute( new MultiCmdsCommand( cmds ) );

	}

	static executeMany ( ...cmds: ICommand[] ): void {

		this.execute( new MultiCmdsCommand( cmds ) );

	}

	static undo (): void {

		if ( this.undos.length > 0 ) {

			const cmd = this.undos.pop();

			if ( this.debug ) console.debug( 'undo ', cmd );

			cmd.undo();

			this.redos.push( cmd );


		} else {

			if ( this.debug ) console.debug( 'nothing to undo ' );

		}

	}

	static redo (): void {

		if ( this.redos.length > 0 ) {

			const cmd = this.redos.pop();

			if ( this.debug ) console.debug( 'redo ', cmd );

			cmd.redo();

			this.undos.push( cmd );

		} else {

			if ( this.debug ) console.debug( 'nothing to redo ' );

		}
	}
}
