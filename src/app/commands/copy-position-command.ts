/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { IHasPosition } from '../objects/i-has-position';
import { IHasUpdate } from './set-value-command';
import { MapEvents } from 'app/events/map-events';

export interface IHasCopyUpdate extends IHasUpdate, IHasPosition {

}

export class CopyPositionCommand extends BaseCommand {

	private oldPosition: THREE.Vector3;

	constructor (
		private object: IHasPosition,
		private newPosition: THREE.Vector3,
		oldPosition: THREE.Vector3 = null
	) {

		super();

		this.newPosition = newPosition.clone();

		this.oldPosition = oldPosition?.clone() || object.getPosition().clone();

	}

	execute (): void {

		this.object.copyPosition( this.newPosition );

		this.object.updateMatrixWorld( true );

		MapEvents.objectUpdated.emit( this.object );

	}

	undo (): void {

		this.object.copyPosition( this.oldPosition );

		this.object.updateMatrixWorld( true );

		MapEvents.objectUpdated.emit( this.object );

	}

	redo (): void {

		this.execute();

	}
}

export class UpdatePositionCommand extends BaseCommand {

	private oldPosition: THREE.Vector3;

	constructor (
		private object: IHasCopyUpdate,
		private newPosition: THREE.Vector3,
		oldPosition: THREE.Vector3 = null
	) {

		super();

		this.newPosition = newPosition.clone();

		this.oldPosition = oldPosition?.clone() || object.getPosition().clone();

	}

	execute (): void {

		this.object?.copyPosition( this.newPosition );

		this.object?.updateMatrixWorld( true );

		this.object?.update();

		MapEvents.objectUpdated.emit( this.object );

	}

	undo (): void {

		this.object?.copyPosition( this.oldPosition );

		this.object?.updateMatrixWorld( true );

		this.object?.update();

		MapEvents.objectUpdated.emit( this.object );

	}

	redo (): void {

		this.execute();

	}
}
