/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { TvAbstractRoadGeometry } from "../../map/models/geometries/tv-abstract-road-geometry";
import { RoadControlPoint } from "../../objects/road/road-control-point";
import { TvGeometryType } from "../../map/models/tv-common";
import { breakGeometries } from "../../utils/spline.utils";
import { GeometryFactory } from "./geometry.factory";
import { Log } from "app/core/utils/log";

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitGeometryService {

	build ( spline: ExplicitSpline ): void {

		const geometries = this.getGeometries( spline );

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

	private getGeometries ( spline: ExplicitSpline ): TvAbstractRoadGeometry[] {

		const controlPoints: RoadControlPoint[] = spline.controlPoints as RoadControlPoint[];

		let s = 0;

		const geometries: TvAbstractRoadGeometry[] = [];

		for ( let i = 1; i < controlPoints.length; i++ ) {

			const prevPoint = controlPoints[ i - 1 ];

			const currentPoint = controlPoints[ i ];

			const segmentTypes = controlPoints.map( point => point.segmentType );

			const geometryType = segmentTypes[ i - 1 ] ?? TvGeometryType.SPIRAL;

			const geometry = this.createGeometry( geometryType, prevPoint, currentPoint );

			if ( !geometry ) {
				Log.error( 'Geometry not created' );
				continue
			}

			geometry.s = s;

			s += geometry.length;

			geometries.push( geometry );

		}

		return geometries;

	}

	createGeometry ( geometryType: TvGeometryType, prevPoint: RoadControlPoint, currentPoint: RoadControlPoint ): TvAbstractRoadGeometry {

		let geometry: TvAbstractRoadGeometry;

		if ( geometryType == TvGeometryType.PARAMPOLY3 ) {

			geometry = currentPoint.segmentGeometry;

		} else {

			geometry = GeometryFactory.createFromPoint( geometryType, prevPoint, currentPoint );

			currentPoint.segmentGeometry = geometry;

			prevPoint.segmentGeometry = geometry;

		}

		return geometry;

	}

}
