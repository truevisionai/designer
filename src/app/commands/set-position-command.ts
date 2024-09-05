/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { IHasPosition } from '../objects/i-has-position';
import { MapEvents } from 'app/events/map-events';
import { Vector3 } from "three";

export class SetPositionCommand extends BaseCommand {

	private readonly object: IHasPosition;

	private readonly oldPosition: Vector3;

	private readonly newPosition: Vector3;

	constructor ( object: IHasPosition, newPosition: Vector3, oldPosition?: Vector3 ) {

		super();

		this.newPosition = newPosition.clone();

		this.oldPosition = oldPosition?.clone() || object.getPosition().clone();

	}

	execute (): void {

		this.object.setPosition( this.newPosition );

		this.object.updateMatrixWorld( true );

		MapEvents.objectUpdated.emit( this.object );

	}

	undo (): void {

		this.object.setPosition( this.oldPosition );

		this.object.updateMatrixWorld( true );

		MapEvents.objectUpdated.emit( this.object );

	}

	redo (): void {

		this.execute();

	}
}

