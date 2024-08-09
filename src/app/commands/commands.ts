/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AddObjectCommand } from "./add-object-command";
import { CommandHistory } from "./command-history";
import { RemoveObjectCommand } from "./remove-object-command";
import { SelectObjectCommand } from "./select-object-command";
import { SetValueCommand } from "./set-value-command";
import { UnselectObjectCommand } from "./unselect-object-command";

export abstract class Commands {

	static SetValue<T, K extends keyof T> ( object: T, attributeName: K, newValue: T[ K ], oldValue?: T[ K ] ) {

		CommandHistory.execute( new SetValueCommand( object, attributeName, newValue, oldValue ) );

	}

	static RemoveObject ( object: Object ) {

		CommandHistory.execute( new RemoveObjectCommand( object ) );

	}

	static AddObject ( object: any | any[] ) {

		CommandHistory.execute( new AddObjectCommand( object ) );

	}

	static Select ( object: any | any[], previousObject?: any | any[] ) {

		CommandHistory.execute( new SelectObjectCommand( object, previousObject ) );

	}

	static Unselect ( object: any | any[] ) {

		CommandHistory.execute( new UnselectObjectCommand( object ) );

	}

}
