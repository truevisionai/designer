/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { BaseCommand } from 'app/commands/base-command';

export class CallFunctionCommand<T> extends BaseCommand {

	constructor (
		private target: T,
		private executeFn: ( this: T, ...args: any[] ) => void,
		private executeArgs: any[],
		private undoFn?: ( this: T, ...args: any[] ) => void,
		private undoArgs?: any[]
	) {
		super();
	}

	execute () {
		this.executeFn?.apply( this.target, this.executeArgs );
	}

	undo () {
		this.undoFn?.apply( this.target, this.undoArgs );
	}

	redo (): void {
		this.execute();
	}
}
