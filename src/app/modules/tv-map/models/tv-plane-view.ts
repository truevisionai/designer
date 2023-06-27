/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2 } from 'three';
import { TvAbstractRoadGeometry } from './geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from './geometries/tv-arc-geometry';
import { TvLineGeometry } from './geometries/tv-line-geometry';
import { TvParamPoly3Geometry } from './geometries/tv-param-poly3-geometry';
import { TvPoly3Geometry } from './geometries/tv-poly3-geometry';
import { TvSpiralGeometry } from './geometries/tv-spiral-geometry';

export class TvPlaneView {

	// public geometry: ODGeometry[] = [];

	public geometries: TvAbstractRoadGeometry[] = [];


	constructor () {

	}

	addGeometry ( geometry: TvAbstractRoadGeometry ) {

		this.geometries.push( geometry );

	}

	addGeometryLine ( s: number, x: number, y: number, hdg: number, length: number ) {

		const geometry = new TvLineGeometry( s, x, y, hdg, length );

		this.geometries.push( geometry );

		return geometry;
	}

	addGeometrySpiral ( s, x, y, hdg, length, curvStart, curvEnd ) {

		// const geometry = new ODGeometry();
		// geometry.spiral = new OdSpiralGeometry( s, x, y, hdg, length, curvStart, curvEnd );

		this.geometries.push( new TvSpiralGeometry( s, x, y, hdg, length, curvStart, curvEnd ) );
	}

	addGeometryArc ( s, x, y, hdg, length, curvature: number ) {

		const geometry = new TvArcGeometry( s, x, y, hdg, length, curvature );

		this.geometries.push( geometry );

		return geometry;
	}

	addGeometryPoly3 ( s, x, y, hdg, length, a, b, c, d ) {

		this.geometries.push( new TvPoly3Geometry( s, x, y, hdg, length, a, b, c, d ) );

	}

	addGeometryParamPoly3 ( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV ) {

		this.geometries.push( new TvParamPoly3Geometry( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV ) );

	}

	/**
	 * Getter for the overall planView/ road length (sum of all geometry record lengths)
	 */
	getBlockLength () {

		let total = 0;

		for ( let i = 0; i < this.geometries.length; i++ ) {

			total += this.geometries[ i ].length;

		}

		return total;
	}

	distance ( pos: Vector2, x, y ): number {

		return Math.sqrt( ( x - pos.x ) * ( x - pos.x ) + ( y - pos.y ) * ( y - pos.y ) );

	}

}
