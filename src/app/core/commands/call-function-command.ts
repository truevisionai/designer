import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { BaseCommand } from "./base-command";
import { ICommandCallback } from "./i-command";

export class CallFunctionCommand extends BaseCommand {

	constructor (
		private target: any,
		private executeFn: ( ...args: any[] ) => void,
		private executeArgs: any[],
		private undoFn: ( ...args: any[] ) => void,
		private undoArgs: any[]
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
