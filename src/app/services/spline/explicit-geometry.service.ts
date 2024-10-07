/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvAbstractRoadGeometry } from "../../map/models/geometries/tv-abstract-road-geometry";
import { breakGeometries } from "../../utils/spline.utils";
import { Vector2 } from "three";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { TvLineGeometry } from "app/map/models/geometries/tv-line-geometry";
import { TvArcGeometry } from "app/map/models/geometries/tv-arc-geometry";
import { TvSpiralGeometry } from "app/map/models/geometries/tv-spiral-geometry";

import * as SPIRAL from "../../core/shapes/spiral-math";
import { AbstractSpline } from "app/core/shapes/abstract-spline";

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitGeometryService {

	private static _instance: ExplicitGeometryService;

	static get instance (): ExplicitGeometryService {

		if ( !ExplicitGeometryService._instance ) {
			ExplicitGeometryService._instance = new ExplicitGeometryService();
		}

		return ExplicitGeometryService._instance;
	}

	constructor () {
	}

	updateGeometry ( spline: AbstractSpline ): void {

		const geometries = this.getGeometries( spline );

		let splineLength = 0;

		geometries.forEach( geometry => splineLength += geometry.length );

		spline.getRoadSegments().forEach( road => {

			road.clearGeometryAndUpdateCoords();

			const sStart = road.sStart;

			const sEnd = spline.segmentMap.getNextKey( road ) || splineLength;

			const newGeometries = breakGeometries( geometries, sStart, sEnd );

			newGeometries.forEach( geometry => road.addGeometryAndUpdateCoords( geometry ) );

		} );

		spline.setGeometries( geometries );

	}

	private getGeometries ( spline: AbstractSpline ): TvAbstractRoadGeometry[] {

		const controlPoints = spline.getControlPoints();

		const geometries = [];

		let s = 0;

		for ( let i = 1; i < controlPoints.length; i++ ) {

			const p1 = controlPoints[ i - 1 ];

			const p2 = controlPoints[ i ];

			const geometry = this.createGeometry( p1, p2 );

			geometry.s = s;

			s += geometry.length;

			geometries.push( geometry );

		}

		return geometries;

	}

	private createGeometry ( p1: AbstractControlPoint, p2: AbstractControlPoint ): TvAbstractRoadGeometry {

		const dir1 = new Vector2( Math.cos( p1.hdg ), Math.sin( p1.hdg ) );
		const dir2 = new Vector2( Math.cos( p2.hdg ), Math.sin( p2.hdg ) );

		const [ curvStart, curvatureChange, length, iter ] = SPIRAL.buildClothoid(
			p1.position.x, p1.position.y, SPIRAL.vec2Angle( dir1.x, dir1.y ),
			p2.position.x, p2.position.y, SPIRAL.vec2Angle( dir2.x, dir2.y )
		);

		const curvEnd = curvStart + curvatureChange * length;

		const curvatureTolerance = 1e-12;

		if ( Math.abs( curvStart ) < curvatureTolerance && Math.abs( curvEnd ) < curvatureTolerance ) {

			return this.createLineSegment( p1, p2 )

		} else if ( Math.abs( curvatureChange ) < curvatureTolerance ) {

			return this.createArcSegment( p1, p2, curvStart, length )

		} else {

			return this.createSpiralSegment( p1, p2, curvStart, curvEnd, length )

		}

	}

	private createSpiralSegment ( p1: AbstractControlPoint, p2: AbstractControlPoint, curvStart: number, curvEnd: number, length: number ): TvSpiralGeometry {

		return new TvSpiralGeometry( 0, p1.position.x, p1.position.y, p1.hdg, length, curvStart, curvEnd );

	}

	private createArcSegment ( p1: AbstractControlPoint, p2: AbstractControlPoint, curvature: number, length: number ): TvArcGeometry {

		return new TvArcGeometry( 0, p1.position.x, p1.position.y, p1.hdg, length, curvature );

	}

	private createLineSegment ( p1: AbstractControlPoint, p2: AbstractControlPoint ): TvLineGeometry {

		return new TvLineGeometry( 0, p1.position.x, p1.position.y, p1.hdg, p1.position.distanceTo( p2.position ) );

	}

}
