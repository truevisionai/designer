/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MultiCmdsCommand } from 'app/commands/multi-cmds-command';
import { Environment } from 'app/core/utils/environment';
import { ICommand } from '../commands/command';

export class CommandHistory {

	private static undos: ICommand[] = [];
	private static redos: ICommand[] = [];

	private static get debug () {
		return true && !Environment.production;
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

		cmd.callbacks ? cmd.callbacks.onExecute() : null;

		// clear all redos on a new action
		this.redos.splice( 0, this.redos.length );

	}

	static executeAll ( cmds: ICommand[] ): void {

		this.execute( new MultiCmdsCommand( cmds ) );

	}

	static executeMany ( ...cmds: ICommand[] ) {

		this.execute( new MultiCmdsCommand( cmds ) );

	}

	static undo (): void {

		if ( this.undos.length > 0 ) {

			const cmd = this.undos.pop();

			if ( this.debug ) console.debug( 'undo ', cmd );

			cmd.undo();

			cmd.callbacks ? cmd.callbacks.onUndo() : null;

			this.redos.push( cmd );


		} else {

			if ( this.debug ) console.debug( 'nothing to undo ' );

		}

	}

	static redo (): any {

		if ( this.redos.length > 0 ) {

			const cmd = this.redos.pop();

			if ( this.debug ) console.debug( 'redo ', cmd );

			cmd.redo();

			cmd.callbacks ? cmd.callbacks.onRedo() : null;

			this.undos.push( cmd );

		} else {

			if ( this.debug ) console.debug( 'nothing to redo ' );

		}
	}
}
