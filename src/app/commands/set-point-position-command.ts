/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { MapEvents } from "app/events/map-events";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Vector3 } from "three";
import { BaseCommand } from "./base-command";


export class SetPointPositionCommand extends BaseCommand {

	private oldPosition: Vector3;

	constructor (
		private spline: AbstractSpline,
		private point: AbstractControlPoint,
		private newPosition: Vector3,
		oldPosition?: Vector3
	) {

		super();

		this.oldPosition = oldPosition || point.getPosition().clone();

	}

	execute (): void {

		this.point.setPosition( this.newPosition );

		MapEvents.objectUpdated.emit( this.point );

		MapEvents.objectUpdated.emit( this.spline );

	}

	undo (): void {

		this.point.setPosition( this.oldPosition );

		MapEvents.objectUpdated.emit( this.point );

		MapEvents.objectUpdated.emit( this.spline );
	}

	redo (): void {

		this.execute();

	}

}
