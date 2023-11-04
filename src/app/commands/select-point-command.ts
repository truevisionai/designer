/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { ISelectable } from '../modules/three-js/objects/i-selectable';
import { IComponent } from '../core/game-object';
import { SelectionTool } from '../core/snapping/selection-tool';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { MapEvents } from 'app/events/map-events';

export interface IToolWithPoint {
	setPoint ( value: ISelectable ): void;

	getPoint (): ISelectable;
}

export interface IToolWithPoints {
	setPoint ( value: ISelectable[] ): void;

	getPoint (): ISelectable[];
}

export interface IToolWithSelection extends IToolWithPoints {
	selectionTool: SelectionTool<any>;
}

export interface IToolWithMainObject {
	setMainObject ( value: ISelectable ): void;

	getMainObject (): ISelectable;
}

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

export class SelectPointCommandv2 extends BaseCommand {

	constructor ( private point: AbstractControlPoint, private previousPoint?: AbstractControlPoint ) {
		super();
	}

	execute () {

		MapEvents.controlPointSelected.emit( this.point );

	}

	undo (): void {

		if ( this.previousPoint ) {

			MapEvents.controlPointSelected.emit( this.previousPoint );

		} else {

			MapEvents.controlPointUnselected.emit( this.point );

		}

	}

	redo (): void {

		this.execute();

	}
}

export class SelectObjectCommandv2 extends BaseCommand {

	constructor ( private object: any, private previousObject?: any ) {
		super();
	}

	execute () {

		MapEvents.objectSelected.emit( this.object );

	}

	undo (): void {

		if ( this.previousObject ) {

			MapEvents.objectSelected.emit( this.previousObject );

		} else {

			MapEvents.objectUnselected.emit( this.object );

		}

	}

	redo (): void {

		this.execute();

	}
}

export class UnselectObjectCommandv2 extends BaseCommand {

	constructor ( private object: any ) {

		super();

		if ( object == null ) {

			throw new Error( 'object cannot be null' );

		}

	}

	execute () {

		MapEvents.objectUnselected.emit( this.object );

	}

	undo (): void {

		MapEvents.objectSelected.emit( this.object );

	}

	redo (): void {

		this.execute();

	}
}

export class SelectPointsCommand extends BaseCommand {

	private readonly oldPoint: ISelectable[];
	private readonly setInspectorCommand: SetInspectorCommand;

	constructor (
		private tool: IToolWithPoints,
		private newPoint: ISelectable[] = [],
		inspector: Type<IComponent> = null,
		inspectorData: ISelectable[] = []
	) {
		super();

		this.oldPoint = this.tool.getPoint();

		this.setInspectorCommand = new SetInspectorCommand( inspector, inspectorData );
	}

	execute () {

		this.oldPoint.forEach( i => i.unselect() );

		this.newPoint?.forEach( i => i.select() );

		this.tool.setPoint( this.newPoint );

		this.setInspectorCommand?.execute();

	}

	undo (): void {

		this.newPoint.forEach( i => i.unselect() );

		this.oldPoint.forEach( i => i.select() );

		this.tool.setPoint( this.oldPoint );

		this.setInspectorCommand?.undo();

	}

	redo (): void {

		this.execute();

	}
}

export class SelectMainObjectCommand extends BaseCommand {

	private readonly oldMainObject: ISelectable;
	private readonly setInspectorCommand: SetInspectorCommand;

	constructor (
		private tool: IToolWithMainObject,
		private newMainObject: ISelectable,
		private inspector: Type<IComponent> = null,
		private inspectorData: any = null
	) {
		super();

		this.oldMainObject = this.tool.getMainObject();

		this.setInspectorCommand = new SetInspectorCommand( inspector, inspectorData );
	}

	execute () {

		this.oldMainObject?.unselect();

		this.newMainObject?.select();

		this.tool.setMainObject( this.newMainObject );

		this.setInspectorCommand?.execute();

	}

	undo (): void {

		this.oldMainObject?.select();

		this.newMainObject?.unselect();

		this.tool.setMainObject( this.oldMainObject );

		this.setInspectorCommand?.undo();

	}

	redo (): void {

		this.execute();

	}

}

export class AddObjectCommand extends BaseCommand {

	constructor ( private object: any ) {
		super();
	}

	execute () {

		MapEvents.objectAdded.emit( this.object );

	}

	undo (): void {

		MapEvents.objectRemoved.emit( this.object );

	}

	redo (): void {

		this.execute();

	}

}

export class RemoveObjectCommand extends BaseCommand {

	constructor ( private object: any ) {
		super();
	}

	execute () {

		MapEvents.objectRemoved.emit( this.object );

	}

	undo (): void {

		MapEvents.objectAdded.emit( this.object );

	}

	redo (): void {

		this.execute();

	}

}
