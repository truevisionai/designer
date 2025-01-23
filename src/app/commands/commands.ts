/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "app/core/maths"
import { AddObjectCommand } from "./add-object-command";
import { AddSelectCommand } from "./add-select-command";
import { CommandHistory } from "./command-history";
import { RemoveObjectCommand } from "./remove-object-command";
import { SelectObjectCommand } from "./select-object-command";
import { SetValueCommand } from "./set-value-command";
import { UnselectObjectCommand } from "./unselect-object-command";
import { IHasPosition } from "app/objects/i-has-position";
import { SetPositionCommand } from "./set-position-command";
import { IHasCopyUpdate } from '../core/interfaces/has-copy-update';
import { UpdatePositionCommand } from "./update-position-command";
import { Tool } from "app/tools/tool";
import { SetToolCommand } from "./set-tool-command";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { DragSplineCommand } from "./drag-spline-command";
import { SetPointPositionCommand } from "./set-point-position-command";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { AddSplineCommand } from "./add-spline-command";
import { ICommand } from "./command";

export abstract class Commands {

	static SetTool ( tool: Tool ): void {

		this.execute( new SetToolCommand( tool ) );

	}

	static SetValue<T, K extends keyof T> ( object: T, attributeName: K, newValue: T[ K ], oldValue?: T[ K ] ): void {

		this.execute( new SetValueCommand( object, attributeName, newValue, oldValue ) );

	}

	static RemoveObject ( object: object | object[], fireUnselectEvent: boolean = false ): void {

		this.execute( new RemoveObjectCommand( object, fireUnselectEvent ) );

	}

	static AddObject ( object: object | object[] ): void {

		this.execute( new AddObjectCommand( object ) );

	}

	static AddSelect ( object: object | object[], previousObject: object | object[] ): void {

		this.execute( new AddSelectCommand( object, previousObject ) );

	}

	static AddSpline ( spline: AbstractSpline ): void {

		this.execute( new AddSplineCommand( spline ) );

	}

	static Select ( object: object | object[], previousObject?: object | object[] ): void {

		this.execute( new SelectObjectCommand( object, previousObject ) );

	}

	static Unselect ( object: object | object[] ): void {

		this.execute( new UnselectObjectCommand( object ) );

	}

	static SetPosition ( object: IHasPosition, newPosition: Vector3, oldPosition?: Vector3 ): void {

		this.execute( new SetPositionCommand( object, newPosition, oldPosition ) );

	}

	static UpdatePosition ( object: IHasCopyUpdate, newPosition: Vector3, oldPosition?: Vector3 ): void {

		this.execute( new UpdatePositionCommand( object, newPosition, oldPosition ) );

	}

	static SetPointPosition ( spline: AbstractSpline, point: AbstractControlPoint, newPosition: Vector3, oldPosition?: Vector3 ): void {

		this.execute( new SetPointPositionCommand( spline, point, newPosition, oldPosition ) );

	}

	static DragSpline ( object: AbstractSpline, newPositions: Vector3[], oldPositions: Vector3[] ): void {

		this.execute( new DragSplineCommand( object, newPositions, oldPositions ) );

	}

	private static execute ( command: ICommand ): void {

		CommandHistory.execute( command );

	}

}
