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
import { TvUtils } from './tv-utils';
import { ModelNotFoundException } from "../../exceptions/exceptions";

export class TvPlaneView {

	// public geometry: ODGeometry[] = [];

	public geometries: TvAbstractRoadGeometry[] = [];

	constructor () {

	}

	getGeometryAtIndex ( index: number ) {

		return this.geometries[ index ];

	}

	getGeomtries (): TvAbstractRoadGeometry[] {

		return this.geometries;

	}

	getGeometryCount (): number {

		return this.geometries.length;

	}

	addGeometry ( geometry: TvAbstractRoadGeometry ): void {

		this.geometries.push( geometry );

	}

	addGeometryLine ( s: number, x: number, y: number, hdg: number, length: number ) {

		const geometry = new TvLineGeometry( s, x, y, hdg, length );

		this.geometries.push( geometry );

		return geometry;
	}

	addGeometrySpiral ( s, x, y, hdg, length, curvStart, curvEnd ): void {

		// const geometry = new ODGeometry();
		// geometry.spiral = new OdSpiralGeometry( s, x, y, hdg, length, curvStart, curvEnd );

		this.geometries.push( new TvSpiralGeometry( s, x, y, hdg, length, curvStart, curvEnd ) );
	}

	addGeometryArc ( s, x, y, hdg, length, curvature: number ) {

		const geometry = new TvArcGeometry( s, x, y, hdg, length, curvature );

		this.geometries.push( geometry );

		return geometry;
	}

	addGeometryPoly3 ( s, x, y, hdg, length, a, b, c, d ): void {

		this.geometries.push( new TvPoly3Geometry( s, x, y, hdg, length, a, b, c, d ) );

	}

	addGeometryPoly ( s: number, x: number, y: number, hdg: number, length: number, a: number, b: number, c: number, d: number ): void {

		this.geometries.push( new TvPoly3Geometry( s, x, y, hdg, length, a, b, c, d ) );

	}

	addGeometryParamPoly3 ( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV, pRange?): void {

		this.geometries.push( new TvParamPoly3Geometry( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV, pRange ) );

	}

	addGeometryParamPoly ( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV, pRange?): void {

		this.geometries.push( new TvParamPoly3Geometry( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV, pRange ) );

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

	clone (): TvPlaneView {

		const tvPlaneView = new TvPlaneView();

		tvPlaneView.geometries = this.geometries.map( geometry => geometry.clone() );

		return tvPlaneView;

	}

	cut ( s: number ): [ TvPlaneView, TvPlaneView ] {

		const planView1 = new TvPlaneView();
		const planView2 = new TvPlaneView();

		// this geometry has to be cut
		const commonGeometry = this.getGeometryAt( s );

		const planView1Geometries = this.geometries.filter( geometry => geometry.s < commonGeometry.s );
		const planView2Geometries = this.geometries.filter( geometry => geometry.s > commonGeometry.s );

		if ( !commonGeometry ) {
			console.error( 'could not find geometry at s', this );
			return [ planView1, planView2 ];
		}

		const geometries = commonGeometry.cut( s );

		if ( !geometries ) {
			console.error( 'could not cut geometry', this );
			return [ planView1, planView2 ];
		}

		planView1.addGeometry( geometries[ 0 ] );
		planView1Geometries.forEach( geometry => planView1.addGeometry( geometry ) );

		// planView1.geometries.forEach( geometry => geometry.s -= planView1.geometries[ 0 ].s );

		planView2.addGeometry( geometries[ 1 ] );
		planView2Geometries.forEach( geometry => planView2.addGeometry( geometry ) );

		planView2.geometries.forEach( geometry => geometry.s -= planView2.geometries[ 0 ].s );

		return [ planView1, planView2 ];
	}

	getGeometryAt ( s: number ): TvAbstractRoadGeometry {

		const geometry = TvUtils.checkIntervalArray( this.geometries, s );

		if ( geometry == null ) {
			throw new ModelNotFoundException( `GeometryNotFoundAt ${ s }` );
		}

		return geometry;

	}

	// getGeometryAt ( s: number ): TvAbstractRoadGeometry {
	// 	return TvUtils.checkIntervalArray( this.geometries, s );
	// }
}
