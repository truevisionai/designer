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

	static createControl ( spline: AbstractSpline, position: Vector3 ): AbstractControlPoint {

		return this.createSplineControlPoint( spline, position );

	}

	static createSimpleControlPoint<T> ( target: T, position: Vector3 ): SimpleControlPoint<T> {

		return new SimpleControlPoint( target, position );

	}

	static createSplineControlPoint ( spline: AbstractSpline, position: Vector3 ) {

		if ( spline.type === SplineType.EXPLICIT ) {

			const road = spline.segmentMap.getFirst();

			if ( road instanceof TvRoad ) {
				return new RoadControlPoint( road, position );
			}
		}

		return new SplineControlPoint( spline, position );

	}

	createDynamic<T extends IHasUpdate> ( target: T, position: Vector3 ): DynamicControlPoint<T> {

		return new DynamicControlPoint( target, position );

	}

	createSimpleControlPoint<T> ( target: T, position: Vector3 ): SimpleControlPoint<T> {

		return new SimpleControlPoint( target, position );

	}


	/**
	 * can use static createSplineControlPoint method instead
	 * @param spline
	 * @param position
	 * @deprecated
	 */
	createSplineControlPoint ( spline: AbstractSpline, position: Vector3 ): AbstractControlPoint {

		return ControlPointFactory.createControl( spline, position );

	}

}
