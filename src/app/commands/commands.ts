/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "three";
import { AddObjectCommand } from "./add-object-command";
import { CommandHistory } from "./command-history";
import { RemoveObjectCommand } from "./remove-object-command";
import { SelectObjectCommand } from "./select-object-command";
import { SetValueCommand } from "./set-value-command";
import { UnselectObjectCommand } from "./unselect-object-command";
import { IHasPosition } from "app/objects/i-has-position";
import { CopyPositionCommand, IHasCopyUpdate } from "./copy-position-command";
import { UpdatePositionCommand } from "./update-position-command";
import { Tool } from "app/tools/tool";
import { SetToolCommand } from "./set-tool-command";

export abstract class Commands {

	static SetTool ( tool: Tool  ) {

		CommandHistory.execute( new SetToolCommand( tool ) );

	}

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

	static CopyPosition ( object: IHasPosition, newPosition: Vector3, oldPosition?: Vector3 ) {

		CommandHistory.execute( new CopyPositionCommand( object, newPosition, oldPosition ) );

	}

	static UpdatePosition ( object: IHasCopyUpdate, newPosition: Vector3, oldPosition?: Vector3 ) {

		CommandHistory.execute( new UpdatePositionCommand( object, newPosition, oldPosition ) );

	}

}
