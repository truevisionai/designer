/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { IHasPosition } from '../objects/i-has-position';
import { MapEvents } from 'app/events/map-events';
import { Vector3 } from "app/core/maths"
import { Object3D } from "three";
import { isView } from 'app/tools/lane/visualizers/IView';
import { isViewModel } from 'app/tools/lane/visualizers/IViewModel';

export class SetPositionCommand extends BaseCommand {

	private readonly object: IHasPosition;

	private readonly oldPosition: Vector3;

	private readonly newPosition: Vector3;

	constructor ( object: IHasPosition, newPosition: Vector3, oldPosition?: Vector3 ) {

		super();

		this.object = object;

		this.newPosition = newPosition.clone();

		this.oldPosition = oldPosition?.clone() || object.getPosition().clone();

	}

	execute (): void {

		this.object.setPosition( this.newPosition );

		this.updateObject( this.object );

		MapEvents.objectUpdated.emit( this.object );

	}

	undo (): void {

		this.object.setPosition( this.oldPosition );

		this.updateObject( this.object );

		MapEvents.objectUpdated.emit( this.object );

	}

	redo (): void {

		this.execute();

	}

	private updateObject ( object: object ): void {

		if ( object instanceof Object3D ) {
			object.updateMatrixWorld( true );
		}

		if ( isView( object ) ) {
			// do nothing
		}

		if ( isViewModel( object ) ) {
			// do nothing
		}
	}

}

