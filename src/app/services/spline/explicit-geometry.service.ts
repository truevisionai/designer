/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { TvAbstractRoadGeometry } from "../../map/models/geometries/tv-abstract-road-geometry";
import { RoadControlPoint } from "../../objects/road/road-control-point";
import { TvGeometryType } from "../../map/models/tv-common";
import { Vector2 } from "three";
import { breakGeometries } from "../../utils/spline.utils";
import { GeometryFactory } from "./geometry.factory";

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitGeometryService {

	build ( spline: ExplicitSpline ): void {

		const geometries = this.exportFromSpline( spline );

		let splineLength = 0;

		geometries.forEach( geometry => splineLength += geometry.length );

		spline.getRoadSegments().forEach( road => {

			road.clearGeometryAndUpdateCoords();

			const sStart = road.sStart;

			const sEnd = spline.segmentMap.getNextKey( road ) || splineLength;

			const newGeometries = breakGeometries( geometries, sStart, sEnd );

			newGeometries.forEach( geometry => road.getPlanView().addGeometry( geometry ) );

		} );

		spline.geometries = geometries;

	}

	private exportFromSpline ( spline: ExplicitSpline ): TvAbstractRoadGeometry[] {

		const controlPoints: RoadControlPoint[] = spline.controlPoints as RoadControlPoint[];

		this.updateSegmentTypes( controlPoints );

		this.updateHdgs( controlPoints );

		const geometryTypes: TvGeometryType[] = this.getSegments( spline );

		const hdgs: number[][] = controlPoints.map( cp => [ cp.hdg, 7, 7 ] );

		const points = controlPoints.map( cp => cp.position );

		let s = 0;

		const geometries: TvAbstractRoadGeometry[] = [];

		for ( let i = 0; i < geometryTypes.length; i++ ) {

			const currentPoint = controlPoints[ i ];
			const nextPoint = controlPoints[ i + 1 ];

			const geometryType = geometryTypes[ i ];

			let geometry: TvAbstractRoadGeometry;

			if ( geometryType == TvGeometryType.PARAMPOLY3 ) {

				geometry = currentPoint.segmentGeometry

			} else {

				geometry = GeometryFactory.createFromPoint( geometryType, currentPoint, nextPoint );

				currentPoint.segmentGeometry = geometry;

				nextPoint.segmentGeometry = geometry;

			}

			if ( !geometry ) continue;

			geometry.s = s;

			s += geometry.length;

			geometries.push( geometry );

		}

		return geometries;
	}

	private getSegments ( spline: ExplicitSpline ) {

		const points = spline.controlPoints as RoadControlPoint[];

		const currentGeometries = spline.geometries;

		// return all points except last
		return points.map( point => point.segmentType ).slice( 0, points.length - 1 );
	}

	private updateHdgs ( controlPoints: RoadControlPoint[] ) {

		// smoothly update hdg for each control point
		// hdg is the angle between the current point and the next point
		// start from second point
		for ( let i = 1; i < controlPoints.length; i++ ) {

			const currentPoint = controlPoints[ i ];
			const previousPoint = controlPoints[ i - 1 ];

			const p1 = new Vector2( currentPoint.position.x, currentPoint.position.y );
			const p2 = new Vector2( previousPoint.position.x, previousPoint.position.y );

			// Calculate heading only if it's not defined
			if ( currentPoint.hdg === null || currentPoint.hdg === undefined ) {
				currentPoint.hdg = Math.atan2( p1.y - p2.y, p1.x - p2.x );
			}

			// Ensure the first point also gets a heading if it's not defined
			if ( i === 1 && ( previousPoint.hdg === null || previousPoint.hdg === undefined ) ) {
				previousPoint.hdg = Math.atan2( p2.y - p1.y, p2.x - p1.x );
			}
		}

	}

	private updateSegmentTypes ( controlPoints: RoadControlPoint[] ) {

		for ( let i = 0; i < controlPoints.length; i++ ) {

			const cp = controlPoints[ i ];

			if ( !cp.segmentType ) {
				cp.segmentType = TvGeometryType.SPIRAL;

				// mark previous point also as spiral
				if ( i > 0 ) controlPoints[ i - 1 ].segmentType = TvGeometryType.SPIRAL;
			}

		}
	}

}
