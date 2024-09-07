/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "three";
import { AbstractControlPoint } from "../objects/abstract-control-point";
import { SplineControlPoint } from "../objects/road/spline-control-point";
import { Injectable } from "@angular/core";
import { DynamicControlPoint } from "app/objects/dynamic-control-point";
import { IHasUpdate } from "app/commands/set-value-command";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { RoadControlPoint } from "app/objects/road/road-control-point";
import { TvRoad } from "app/map/models/tv-road.model";
import { SimpleControlPoint } from "../objects/simple-control-point";
import { TvAbstractRoadGeometry } from "app/map/models/geometries/tv-abstract-road-geometry";
import { Maths } from "app/utils/maths";
import { Log } from "app/core/utils/log";

@Injectable( {
	providedIn: 'root'
} )
export class ControlPointFactory {

	static createStraightControlPoints ( spline: AbstractSpline, start: Vector3, length: number, degrees: number ): AbstractControlPoint[] {

		const hdg = Maths.Deg2Rad * degrees;
		const direction = new Vector3( Math.cos( hdg ), Math.sin( hdg ), 0 );
		const secondPoint = start.clone().add( direction.clone().multiplyScalar( length ) );

		return [
			this.createControl( spline, start ),
			this.createControl( spline, secondPoint )
		];

	}

	static createControl ( spline: AbstractSpline, position: Vector3, index?: number ): AbstractControlPoint {

		return this.createSplineControlPoint( spline, position, index );

	}

	static createSimpleControlPoint<T> ( target: T, position: Vector3 ): SimpleControlPoint<T> {

		return new SimpleControlPoint( target, position );

	}

	static createSplineControlPoint ( spline: AbstractSpline, position: Vector3, index?: number ): AbstractControlPoint {

		if ( spline.type === SplineType.EXPLICIT ) {

			const road = spline.segmentMap.getFirst();

			if ( road instanceof TvRoad ) {

				const pointIndex = index || spline.controlPoints.length;

				const geometry = spline.geometries[ pointIndex - 1 ];

				const hdg = geometry?.hdg || 0;

				return this.createRoadControlPoint( road, geometry, pointIndex, position, hdg );

			} else {

				Log.error( 'Road not found for spline control point' );

			}

		}

		return new SplineControlPoint( spline, position );

	}

	static createRoadControlPoint ( road: TvRoad, geometry: TvAbstractRoadGeometry, index: number, position: Vector3, hdg: number ) {

		if ( !geometry ) {
			console.error( 'Geometry not found for road control point', road, geometry, index );
		}

		const controlPoint = new RoadControlPoint( road, position, index );

		controlPoint.segmentGeometry = geometry;

		controlPoint.segmentType = geometry?.geometryType;

		controlPoint.hdg = hdg;

		controlPoint.userData.geometry = geometry;

		controlPoint.createTangentAndLine( hdg, 1, 1 );

		return controlPoint;
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
