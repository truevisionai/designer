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
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { DragSplineCommand } from "./drag-spline-command";
import { SetPointPositionCommand } from "./set-point-position-command";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { AddSplineCommand } from "./add-spline-command";

export abstract class Commands {

	static SetTool ( tool: Tool ): void {

		CommandHistory.execute( new SetToolCommand( tool ) );

	}

	static SetValue<T, K extends keyof T> ( object: T, attributeName: K, newValue: T[ K ], oldValue?: T[ K ] ): void {

		CommandHistory.execute( new SetValueCommand( object, attributeName, newValue, oldValue ) );

	}

	static RemoveObject ( object: object | object[] ): void {

		CommandHistory.execute( new RemoveObjectCommand( object ) );

	}

	static AddObject ( object: object | object[] ): void {

		CommandHistory.execute( new AddObjectCommand( object ) );

	}

	static AddSpline ( spline: AbstractSpline ): void {

		CommandHistory.execute( new AddSplineCommand( spline ) );

	}

	static Select ( object: object | object[], previousObject?: object | object[] ): void {

		CommandHistory.execute( new SelectObjectCommand( object, previousObject ) );

	}

	static Unselect ( object: object | object[] ): void {

		CommandHistory.execute( new UnselectObjectCommand( object ) );

	}

	static CopyPosition ( object: IHasPosition, newPosition: Vector3, oldPosition?: Vector3 ): void {

		CommandHistory.execute( new CopyPositionCommand( object, newPosition, oldPosition ) );

	}

	static UpdatePosition ( object: IHasCopyUpdate, newPosition: Vector3, oldPosition?: Vector3 ): void {

		CommandHistory.execute( new UpdatePositionCommand( object, newPosition, oldPosition ) );

	}

	static SetPointPosition ( spline: AbstractSpline, point: AbstractControlPoint, newPosition: Vector3, oldPosition?: Vector3 ): void {

		CommandHistory.execute( new SetPointPositionCommand( spline, point, newPosition, oldPosition ) );

	}

	static DragSpline ( object: AbstractSpline, delta: Vector3 ): void {

		CommandHistory.execute( new DragSplineCommand( object, delta ) );

	}

}
