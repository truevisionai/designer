/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { Vector3 } from "app/core/maths"
import { AbstractSpline } from "../core/shapes/abstract-spline";
import { MapEvents } from "../events/map-events";

export class DragSplineCommand extends BaseCommand {

	constructor ( private spline: AbstractSpline, private newPositions: Vector3[], private oldPositions: Vector3[] ) {

		super();

	}

	execute (): void {

		this.spline.getControlPoints().forEach( ( point, index ) => {

			point.setPosition( this.newPositions[ index ] );

		} );

		MapEvents.objectUpdated.emit( this.spline );

	}

	undo (): void {

		this.spline.getControlPoints().forEach( ( point, index ) => {

			point.setPosition( this.oldPositions[ index ] );

		} );

		MapEvents.objectUpdated.emit( this.spline );
	}

	redo (): void {

		this.execute();

	}

}
