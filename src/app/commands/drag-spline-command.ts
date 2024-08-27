/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { Vector3 } from "three";
import { AbstractSpline } from "../core/shapes/abstract-spline";
import { MapEvents } from "../events/map-events";

export class DragSplineCommand extends BaseCommand {

	private oldPositions: Vector3[];

	private newPositions: Vector3[];

	constructor ( private spline: AbstractSpline, delta: Vector3 ) {

		super();

		this.newPositions = spline.getPositions().map( point => point.clone() );

		this.oldPositions = spline.getPositions().map( pos => pos.clone().add( delta ) );

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
