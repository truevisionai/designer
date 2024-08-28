import { AddObjectCommand } from "./add-object-command";
import { BaseCommand } from "./base-command";
import { ICommand } from "./command";
import { SelectObjectCommand } from "./select-object-command";


export class AddSelectCommand extends BaseCommand {

	private addCommand: ICommand;

	private selectCommand: ICommand;

	constructor ( object: object | object[], previousObject?: object | object[] ) {

		super();

		this.addCommand = new AddObjectCommand( object );

		this.selectCommand = new SelectObjectCommand( object, previousObject );

	}

	execute (): void {

		this.addCommand.execute();

		this.selectCommand.execute();

	}

	undo (): void {

		this.selectCommand.undo();

		this.addCommand.undo();

	}

	redo (): void {

		this.execute();

	}

}
