/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { MapEvents } from "../events/map-events";
import { IHasCopyUpdate } from '../core/interfaces/has-copy-update';
import { Vector3 } from "app/core/maths"
import { Object3D } from "three";

export class UpdatePositionCommand extends BaseCommand {

	private readonly oldPosition: Vector3;

	public fireEvents: boolean = true;

	constructor (
		private object: IHasCopyUpdate,
		private readonly newPosition: Vector3,
		oldPosition: Vector3 = null
	) {

		super();

		this.newPosition = newPosition.clone();

		this.oldPosition = oldPosition?.clone() || object.getPosition().clone();

	}

	execute (): void {

		this.object?.setPosition( this.newPosition );

		this.updateObject( this.object );

		this.object?.update();

		if ( this.fireEvents ) MapEvents.objectUpdated.emit( this.object );

	}

	undo (): void {

		this.object?.setPosition( this.oldPosition );

		this.updateObject( this.object );

		this.object?.update();

		if ( this.fireEvents ) MapEvents.objectUpdated.emit( this.object );

	}

	redo (): void {

		this.execute();

	}

	private updateObject ( object: object ): void {

		if ( object instanceof Object3D ) {

			object.updateMatrixWorld( true );

		}

	}

}
