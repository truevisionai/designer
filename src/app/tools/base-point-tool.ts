/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IHasCopyUpdate } from 'app/core/interfaces/has-copy-update';
import { PointerEventData } from "../events/pointer-event-data";
import { CommandHistory } from "../commands/command-history";
import { AddObjectCommand } from "../commands/add-object-command";
import { SelectObjectCommand } from "../commands/select-object-command";
import { DebugState } from "../services/debug/debug-state";
import { BaseTool } from "./base-tool";
import { Commands } from "app/commands/commands";

export abstract class BasePointTool<T extends IHasCopyUpdate> extends BaseTool<T> {

	onPointerDownCreate ( e: PointerEventData ): void {

		this.onCreateObject( e );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.currentSelectedPointMoved ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedObject ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const oldPosition = this.pointerDownAt.clone();

		const newPosition = this.currentSelectedPoint.position.clone();

		Commands.UpdatePosition( this.currentSelectedObject, newPosition, oldPosition );

		this.currentSelectedPointMoved = false;

	}

	onCreateObject ( e: PointerEventData ): void {

		if ( e.point == null ) return;

		if ( this.objectFactory == null ) return;

		const object = this.objectFactory.createFromPosition( e.point );

		const addObjectCommand = new AddObjectCommand( object );

		const selectCommand = new SelectObjectCommand( object, this.currentSelectedObject );

		CommandHistory.executeMany( addObjectCommand, selectCommand );

	}

	onObjectAdded ( object: T ): void {

		if ( object.constructor.name === this.typeName ) {

			this.dataService.add( object );

			this.debugService.setDebugState( object, DebugState.SELECTED );

		}

	}
}
