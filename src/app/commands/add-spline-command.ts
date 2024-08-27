/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from "./base-command";
import { AbstractSpline } from "../core/shapes/abstract-spline";
import { MapEvents } from "../events/map-events";
import { Log } from "app/core/utils/log";

export class AddSplineCommand extends BaseCommand {

	constructor ( private spline: AbstractSpline ) {

		super();

	}

	execute (): void {

		MapEvents.objectAdded.emit( this.spline );

		MapEvents.objectSelected.emit( this.spline );

		if ( this.spline.getControlPointCount() > 0 ) {

			MapEvents.objectSelected.emit( this.spline.getControlPoints()[ 0 ] );

		} else {

			Log.error( "Spline has no control points" );

		}

	}

	undo (): void {

		if ( this.spline.getControlPointCount() > 0 ) {

			MapEvents.objectUnselected.emit( this.spline.getControlPoints()[ 0 ] );

		} else {

			Log.error( "Spline has no control points" );

		}

		MapEvents.objectUnselected.emit( this.spline );

		MapEvents.objectRemoved.emit( this.spline );

	}

	redo (): void {

		this.execute();

	}

}
