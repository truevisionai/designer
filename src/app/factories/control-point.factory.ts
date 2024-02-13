/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "three";
import { AbstractControlPoint } from "../objects/abstract-control-point";
import { SplineControlPoint } from "../objects/spline-control-point";
import { Injectable } from "@angular/core";
import { DynamicControlPoint } from "app/objects/dynamic-control-point";
import { IHasUpdate } from "app/commands/set-value-command";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { RoadControlPoint } from "app/objects/road-control-point";
import { TvRoad } from "app/map/models/tv-road.model";
import { SimpleControlPoint } from "../objects/simple-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class ControlPointFactory {

	static createControl ( target: AbstractSpline, position: Vector3, type = 'spline' ): AbstractControlPoint {

		if ( type = 'spline' ) {

			return this.createSplineControlPoint( target, position );

		}

		return this.createSplineControlPoint( target, position );

	}

	static createSplineControlPoint ( target: any, position: Vector3 ) {

		return new SplineControlPoint( target, position );

	}

	createDynamic<T extends IHasUpdate> ( target: T, position: Vector3 ): DynamicControlPoint<T> {

		return new DynamicControlPoint( target, position );

	}

	createSimpleControlPoint<T> ( target: T, position: Vector3 ): SimpleControlPoint<T> {

		return new SimpleControlPoint( target, position );

	}

	createSplineControlPoint ( spline: AbstractSpline, position: Vector3 ): AbstractControlPoint {

		if ( spline.type === SplineType.EXPLICIT ) {

			const segment = spline.getFirstRoadSegment();

			const road = segment?.getInstance<TvRoad>();

			return new RoadControlPoint( road, position );
		}

		return new SplineControlPoint( spline, position );

	}

}
