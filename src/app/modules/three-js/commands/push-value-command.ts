import { BaseCommand } from "app/core/commands/base-command";

export class PushValueCommand<T> extends BaseCommand {

	constructor ( private container: T[], private object: T ) {
		super();
	}

	execute () {
		this.container.push( this.object );
	}

	undo () {
		const index = this.container.indexOf( this.object );
		if ( index > -1 ) {
			this.container.splice( index, 1 );
		}
	}
	redo (): void {
		this.execute();
	}

}
