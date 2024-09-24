/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AutoSpline } from "../../core/shapes/auto-spline-v2";
import { TvRoad } from "../../map/models/tv-road.model";
import { Maths } from "../../utils/maths";
import { MapEvents } from "../../events/map-events";
import { RoadRemovedEvent } from "../../events/road/road-removed-event";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { Vector2 } from "three";
import { TvAbstractRoadGeometry } from "../../map/models/geometries/tv-abstract-road-geometry";
import { RoundLine } from "../../core/shapes/round-line";
import { TvLineGeometry } from "../../map/models/geometries/tv-line-geometry";
import { TvArcGeometry } from "../../map/models/geometries/tv-arc-geometry";
import { breakGeometries, getArcParams } from "app/utils/spline.utils";
import { Log } from "app/core/utils/log";

@Injectable( {
	providedIn: 'root'
} )
export class AutoGeometryService {

	build ( spline: AutoSpline ): void {

		this.updateHdgs( spline );

		this.updateRoadSegments( spline );

		spline.getRoadSegments().forEach( road => {

			if ( road.geometries.length == 0 || Maths.approxEquals( road.length, 0 ) ) {

				Log.error( `No geometries found for road${ road.toString() }` );

				if ( !road.isJunction ) {
					MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );
				}

			}

		} )

	}

	updateHdgs ( spline: AutoSpline ): void {

		const hdgs = [];

		let hdg, p1, p2, currentPoint: AbstractControlPoint, previousPoint: AbstractControlPoint;

		for ( let i = 1; i < spline.controlPoints.length; i++ ) {

			previousPoint = spline.controlPoints[ i - 1 ];
			currentPoint = spline.controlPoints[ i ];

			p1 = new Vector2( currentPoint.position.x, currentPoint.position.y );
			p2 = new Vector2( previousPoint.position.x, previousPoint.position.y );

			hdg = new Vector2().subVectors( p1, p2 ).angle();

			previousPoint[ 'hdg' ] = hdg;

			hdgs.push( hdg );
		}

		// setting hdg for the last point
		if ( hdg != null ) {

			currentPoint[ 'hdg' ] = hdg;

		}

	}

	updateRoadSegments ( spline: AutoSpline ): void {

		const splineGeometries = this.exportGeometries( spline );

		let splineLength = 0;

		splineGeometries.forEach( geometry => splineLength += geometry.length );

		const segments = spline.segmentMap.toArray();

		for ( const road of segments ) {

			if ( road instanceof TvRoad ) {

				road.clearGeometryAndUpdateCoords();

				const sStart = road.sStart;

				const sEnd = spline.segmentMap.getNextKey( road ) || splineLength;

				const newGeometries = this.breakGeometries( splineGeometries, sStart, sEnd );

				newGeometries.forEach( geometry => road.getPlanView().addGeometry( geometry ) );

			}

		}

		spline.setGeometries( splineGeometries )

	}

	// eslint-disable-next-line max-lines-per-function
	exportGeometries ( spline: AutoSpline ): TvAbstractRoadGeometry[] {

		if ( spline.controlPoints.length < 2 ) return [];

		let totalLength = 0;

		const roundline = new RoundLine( spline.controlPoints );

		roundline.update();

		const points = roundline.points as AbstractControlPoint[];

		const radiuses = roundline.radiuses;

		const geometries: TvAbstractRoadGeometry[] = [];

		let s = 0;

		for ( let i = 1; i < points.length; i++ ) {

			let x: number, y: number, hdg: number, length: number;

			const previousPoint = points[ i - 1 ];
			const currentPoint = points[ i ];

			const previousPointPosition = previousPoint.position;
			const currentPointPosition = currentPoint.position;

			const p1 = new Vector2( previousPointPosition.x, previousPointPosition.y );
			const p2 = new Vector2( currentPointPosition.x, currentPointPosition.y );

			const distance = p1.distanceTo( p2 );

			const currentRadius = radiuses[ i ];
			const previousRadius = radiuses[ i - 1 ];

			// line between p1 and p2
			if ( distance - previousRadius - currentRadius > 0.001 ) {

				[ x, y ] = new Vector2()
					.subVectors( p2, p1 )
					.normalize()
					.multiplyScalar( radiuses[ i - 1 ] )
					.add( p1 )
					.toArray();

				hdg = new Vector2().subVectors( p2, p1 ).angle();
				// hdg = points[ i - 1 ][ 'hdg' ];

				length = distance - previousRadius - currentRadius;

				s = totalLength;

				totalLength += length;

				const lastGeometry = geometries[ geometries.length - 1 ];

				if ( lastGeometry instanceof TvLineGeometry && lastGeometry.hdg == hdg ) {

					lastGeometry.length += length;

				} else {

					geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

				}

			}

			// arc for p2
			if ( radiuses[ i ] > 0 ) { // first and last point can't have zero radiuses

				const next = points[ i + 1 ].position;

				const dir1 = new Vector2( currentPointPosition.x - previousPointPosition.x, currentPointPosition.y - previousPointPosition.y ).normalize();

				const dir2 = new Vector2( next.x - currentPointPosition.x, next.y - currentPointPosition.y ).normalize();

				const pp1 = new Vector2()
					.subVectors( p1, p2 )
					.normalize()
					.multiplyScalar( radiuses[ i ] )
					.add( p2 );

				const pp2 = new Vector2()
					.subVectors( ( new Vector2( next.x, next.y ) ), p2 )
					.normalize()
					.multiplyScalar( radiuses[ i ] )
					.add( p2 );

				x = pp1.x;

				y = pp1.y;

				hdg = dir1.angle();

				let r: number, alpha: number, sign: number;

				[ r, alpha, length, sign ] = getArcParams( pp1, pp2, dir1, dir2 );

				if ( r != Infinity && !isNaN( r ) ) {

					s = totalLength;

					totalLength += length;

					const curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / r ); // sign < for mirror image

					geometries.push( new TvArcGeometry( s, x, y, hdg, length, curvature ) );

				} else {

					s = totalLength;

					length = pp1.distanceTo( pp2 );

					totalLength += length;

					const lastGeometry = geometries[ geometries.length - 1 ];

					if ( lastGeometry instanceof TvLineGeometry && lastGeometry.hdg == hdg ) {

						lastGeometry.length += length;

					} else {

						geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

					}

					//console.warn( 'radius is infinity' );

				}

			}
		}

		return geometries;
	}

	breakGeometries ( geometries: TvAbstractRoadGeometry[], sStart: number, sEnd: number | null ): TvAbstractRoadGeometry[] {

		return breakGeometries( geometries, sStart, sEnd );

	}
}
