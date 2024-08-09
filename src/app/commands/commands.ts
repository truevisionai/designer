import { CommandHistory } from "./command-history";
import { RemoveObjectCommand } from "./remove-object-command";
import { SetValueCommand } from "./set-value-command";

export abstract class Commands {

	static SetValue<T, K extends keyof T> ( object: T, attributeName: K, newValue: T[ K ], oldValue?: T[ K ] ) {

		CommandHistory.execute( new SetValueCommand( object, attributeName, newValue, oldValue ) );

	}

	static RemoveObject ( object: Object ) {

		CommandHistory.execute( new RemoveObjectCommand( object ) );

	}

}
