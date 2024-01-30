/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { ISelectable } from '../objects/i-selectable';
import { IComponent } from '../objects/game-object';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';

/**
 * @deprecated
 */
export interface IToolWithPoint {
	setPoint ( value: ISelectable ): void;

	getPoint (): ISelectable;
}

/**
 * @deprecated
 */
export interface IToolWithMainObject {
	setMainObject ( value: ISelectable ): void;

	getMainObject (): ISelectable;
}

/**
 * @deprecated
 */
export class SelectPointCommand extends BaseCommand {

	private readonly oldPoint: ISelectable;

	private readonly setInspectorCommand: SetInspectorCommand;

	constructor (
		private tool: IToolWithPoint,
		private newPoint: ISelectable,
		inspector?: Type<IComponent>,
		inspectorData?: any
	) {
		super();

		this.oldPoint = this.tool.getPoint();

		if ( inspector ) {
			this.setInspectorCommand = new SetInspectorCommand( inspector, inspectorData );
		}
	}

	execute () {

		this.oldPoint?.unselect();

		this.newPoint?.select();

		this.tool.setPoint( this.newPoint );

		this.setInspectorCommand?.execute();

	}

	undo (): void {

		this.oldPoint?.select();

		this.newPoint?.unselect();

		this.tool.setPoint( this.oldPoint );

		this.setInspectorCommand?.undo();

	}

	redo (): void {

		this.execute();

	}
}

// export class SelectPointCommandv2 extends BaseCommand {
//
// 	constructor ( private point: AbstractControlPoint, private previousPoint?: AbstractControlPoint ) {
// 		super();
// 	}
//
// 	execute () {
//
// 		MapEvents.controlPointSelected.emit( this.point );
//
// 	}
//
// 	undo (): void {
//
// 		if ( this.previousPoint ) {
//
// 			MapEvents.controlPointSelected.emit( this.previousPoint );
//
// 		} else {
//
// 			MapEvents.controlPointUnselected.emit( this.point );
//
// 		}
//
// 	}
//
// 	redo (): void {
//
// 		this.execute();
//
// 	}
// }

