/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { TvRoad } from "../../map/models/tv-road.model";
import { AutoSplineV2 } from "../../core/shapes/auto-spline-v2";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { CatmullRomCurve3, Vector2 } from "three";
import { TvAbstractRoadGeometry } from "../../map/models/geometries/tv-abstract-road-geometry";
import { TvLineGeometry } from "../../map/models/geometries/tv-line-geometry";
import { TvArcGeometry } from "../../map/models/geometries/tv-arc-geometry";
import { RoundLine } from "../../core/shapes/round-line";
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { TvGeometryType } from "../../map/models/tv-common";
import { RoadControlPoint } from "../../objects/road-control-point";
import * as SPIRAL from "../../core/shapes/spiral-math";
import { TvSpiralGeometry } from "../../map/models/geometries/tv-spiral-geometry";
import { PARACUBICFACTOR } from "../../core/shapes/spline-config";
import { HermiteSpline, Length } from "../../core/shapes/spline-data";
import { TvParamPoly3Geometry } from "../../map/models/geometries/tv-param-poly3-geometry";
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';

function getArcParams ( p1: Vector2, p2: Vector2, dir1: Vector2, dir2: Vector2 ): number[] {

	const distance = p1.distanceTo( p2 );

	const normalisedDotProduct = new Vector2()
		.copy( dir1 )
		.normalize()
		.dot( new Vector2().copy( dir2 ).normalize() );

	const alpha = Math.acos( normalisedDotProduct );

	const r = distance / 2 / Math.sin( alpha / 2 );

	const length = r * alpha;

	const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

	const det = 1 / ( ma * md - mb * mc );

	const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

	const p2proj = new Vector2().subVectors( p2, p1 );

	p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

	return [ r, alpha, length, Math.sign( p2proj.y ) ];
}

@Injectable( {
	providedIn: 'root'
} )
export class SplineBuilder {

	constructor (
		private autoSplineBuilder: AutoSplineBuilder,
		private explicitSplineBuilder: ExplicitSplineBuilder
	) {
	}

	// build ( spline: AbstractSpline ): GameObject[] {
	//
	// 	const gameObjects = [];
	//
	// 	if ( spline.controlPoints.length < 2 ) {
	// 		return gameObjects;
	// 	}
	//
	// 	spline.getSplineSegments().forEach( segment => {
	//
	// 		if ( !segment.isRoad ) return;
	//
	// 		const road = this.mapService.map.getRoadById( segment.id );
	//
	// 		road.clearGeometries();
	//
	// 		segment.geometries.forEach( geometry => road.addGeometry( geometry ) );
	//
	// 		const gameObject = this.roadBuilder.buildRoad( road );
	//
	// 		road.gameObject = gameObject;
	//
	// 		gameObjects.push( gameObject );
	//
	// 	} );
	//
	// 	return gameObjects;
	// }

	buildSpline ( spline: AbstractSpline ) {

		if ( spline instanceof AutoSplineV2 ) {

			this.autoSplineBuilder.build( spline );

		} else if ( spline instanceof ExplicitSpline ) {

			this.explicitSplineBuilder.build( spline );

		} else if ( spline instanceof CatmullRomSpline ) {

			this.buildCatmullRomSpline( spline );

		}

	}

	buildCatmullRomSpline ( spline: CatmullRomSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		if ( !spline.curve ) return;

		spline.curve.points = spline.controlPointPositions;

		spline.curve.closed = spline.closed;

		spline.curve.updateArcLengths();

	}

	buildNew ( spline: AbstractSpline ) {

		if ( spline.type === SplineType.CATMULLROM ) {

			this.buildCatmullRom( spline as CatmullRomSpline );

		}

	}

	buildCatmullRom ( spline: CatmullRomSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		if ( !spline.curve ) {
			spline.curve = new CatmullRomCurve3(
				spline.controlPointPositions,
				spline.closed,
				spline.curveType,
				spline.tension
			);
		}

		spline.curve.points = spline.controlPointPositions;

		spline.curve.updateArcLengths();

	}
}


@Injectable( {
	providedIn: 'root'
} )
export class AutoSplineBuilder {

	build ( spline: AutoSplineV2 ): void {

		if ( spline.controlPoints.length < 2 ) {
			this.removeMesh( spline );
			return;
		}

		this.updateHdgs( spline );
		this.updateRoadSegments( spline );

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				if ( segment.geometries.length == 0 ) {

					console.log( segment );
					throw new Error( 'No geometries found for road segment' );

				}

			}
		}

	}

	removeMesh ( spline: AbstractSpline ) {

		const segments = spline.segmentMap.toArray();

		for ( const segment of segments ) {

			if ( segment instanceof TvRoad ) {

				if ( !segment.gameObject ) continue;

				// this.mapService.map.gameObject.remove( road.gameObject );

				segment.gameObject.parent?.remove( segment.gameObject );

			}

		}

	}

	updateHdgs ( spline: AutoSplineV2 ) {

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

	updateRoadSegments ( spline: AutoSplineV2 ) {

		const splineGeometries = this.exportGeometries( spline );

		let splineLength = 0;

		splineGeometries.forEach( geometry => splineLength += geometry.length );

		const segments = spline.segmentMap.toArray();

		for ( const road of segments ) {

			if ( road instanceof TvRoad ) {

				road.clearGeometries();

				const sStart = road.sStart;

				const sEnd = spline.segmentMap.getNextKey( road ) || splineLength;

				const newGeometries = this.buildGeometries( splineGeometries, sStart, sEnd );

				newGeometries.forEach( geometry => road.addGeometry( geometry ) );

			}

		}

		spline.geometries = splineGeometries;
	}

	exportGeometries ( spline: AutoSplineV2 ): TvAbstractRoadGeometry[] {

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

	buildGeometries ( geometries: TvAbstractRoadGeometry[], sStart: number, sEnd: number | null ): TvAbstractRoadGeometry[] {

		const newGeometries: TvAbstractRoadGeometry[] = [];

		let currentS = 0;

		for ( const geometry of geometries ) {

			const effectiveSEnd = sEnd !== null ? sEnd : Infinity;

			if ( geometry.endS <= sStart || geometry.s >= effectiveSEnd ) continue; // Skip if geometry is completely out of bounds

			const newGeometry = geometry.clone();

			newGeometry.s = currentS;

			if ( geometry.s < sStart && geometry.endS > sStart ) {

				const posTheta = geometry.getRoadCoord( sStart );

				newGeometry.x = posTheta.x;

				newGeometry.y = posTheta.y;

				newGeometry.hdg = posTheta.hdg;

				newGeometry.length = Math.min( geometry.endS, effectiveSEnd ) - sStart;

			} else if ( geometry.endS > effectiveSEnd ) {

				const posTheta = geometry.getRoadCoord( geometry.s );

				newGeometry.x = posTheta.x;

				newGeometry.y = posTheta.y;

				newGeometry.hdg = posTheta.hdg;

				newGeometry.length = effectiveSEnd - geometry.s;

			} else {

				const posTheta = geometry.getRoadCoord( geometry.s );

				newGeometry.x = posTheta.x;

				newGeometry.y = posTheta.y;

				newGeometry.hdg = posTheta.hdg;

				newGeometry.length = geometry.length;

			}

			newGeometries.push( newGeometry );

			currentS += newGeometry.length;

		}

		return newGeometries;

	}
}


@Injectable( {
	providedIn: 'root'
} )
export class ExplicitSplineBuilder {

	build ( spline: ExplicitSpline ): void {

		const geometries = this.exportFromSpline( spline );

		const segments = spline.segmentMap.toArray();

		for ( const segment of segments ) {

			if ( segment instanceof TvRoad ) {

				segment.clearGeometries();

				geometries.forEach( geometry => segment.addGeometry( geometry ) );

			}

		}

		spline.geometries = geometries;

	}

	private exportFromSpline ( spline: ExplicitSpline ): TvAbstractRoadGeometry[] {

		const controlPoints: RoadControlPoint[] = spline.controlPoints as RoadControlPoint[];

		this.updateSegmentTypes( controlPoints );

		this.updateHdgs( controlPoints );

		const geometryTypes = controlPoints.map( cp => cp.segmentType );

		const hdgs: number[][] = controlPoints.map( cp => [ cp.hdg, 7, 7 ] );

		const points = spline.controlPoints.map( cp => cp.position );

		let s = 0;

		const geometries: TvAbstractRoadGeometry[] = [];

		for ( let i = 0; i < geometryTypes.length - 1; i++ ) {

			const currentPoint = spline.controlPoints[ i ] as RoadControlPoint;
			const nextPoint = spline.controlPoints[ i + 1 ] as RoadControlPoint;

			const geometryType = geometryTypes[ i ];

			const geometry = this.computeGeometry( geometryType, currentPoint, nextPoint );

			if ( !geometry ) continue;

			geometry.s = s;

			s += geometry.length;

			geometries.push( geometry );

		}

		return geometries;
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

			if ( !currentPoint.hdg ) {
				currentPoint.hdg = Math.atan2( p1.y - p2.y, p1.x - p2.x );
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

	private computeGeometry ( type: TvGeometryType, p1: RoadControlPoint, p2: RoadControlPoint ): TvAbstractRoadGeometry {

		switch ( type ) {
			case TvGeometryType.LINE:
				return this.createLineGeometry( p1, p2 );
			case TvGeometryType.ARC:
				return this.createArcGeometry( p1, p2 );
			case TvGeometryType.SPIRAL:
				return this.createSpiralGeometry( p1, p2 );
			case TvGeometryType.POLY3:
				break;
			case TvGeometryType.PARAMPOLY3:
				return this.createParamPoly3Geometry( p1, p2 );
			case TvGeometryType.SPLINE:
				break;
		}

	}

	private createLineGeometry ( p1: RoadControlPoint, p2: RoadControlPoint ) {

		return new TvLineGeometry( 0, p1.position.x, p1.position.y, p1.hdg, p1.position.distanceTo( p2.position ) );

	}

	private createArcGeometry ( p1: RoadControlPoint, p2: RoadControlPoint ) {

		const start = new Vector2( p1.position.x, p1.position.y );
		const end = new Vector2( p2.position.x, p2.position.y );

		const dir1 = new Vector2( Math.cos( p1.hdg ), Math.sin( p1.hdg ) );
		const dir2 = new Vector2( Math.cos( p2.hdg ), Math.sin( p2.hdg ) );

		const distance = p1.position.distanceTo( p2.position );

		const x = p1.position.x;
		const y = p1.position.y;

		const hdg = p1.hdg;

		let radius, alpha, sign;
		[ radius, alpha, length, sign ] = getArcParams( start, end, dir1, dir2 );

		// world z is flipped so inverse the sign
		// const curvature = + ( sign < 0 ? 1 : -1 ) + 1 / r;
		let curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / radius );  // sign < for mirror image

		// if radius if infinite then curvature should be the least possible value
		// so its almost close to a line but still an arc
		if ( radius === Infinity ) curvature = Number.MIN_VALUE;

		// because its alsmot a line we can take the arc length as the simple distance between the points
		if ( radius === Infinity ) length = distance;

		return new TvArcGeometry( 0, x, y, hdg, length, curvature );
	}

	private createSpiralGeometry ( p1: RoadControlPoint, p2: RoadControlPoint ) {

		const dir1 = new Vector2( Math.cos( p1.hdg ), Math.sin( p1.hdg ) );
		const dir2 = new Vector2( Math.cos( p2.hdg ), Math.sin( p2.hdg ) );

		const [ k, dk, _L, iter ] = SPIRAL.buildClothoid(
			p1.position.x,
			p1.position.y,
			SPIRAL.vec2Angle( dir1.x, dir1.y ),
			p2.position.x,
			p2.position.y,
			SPIRAL.vec2Angle( dir2.x, dir2.y )
		);

		const x = p1.position.x;
		const y = p1.position.y;

		const hdg = p1.hdg;

		const length = _L;

		const curvStart = k;
		const curvEnd = ( k + dk * _L );

		return new TvSpiralGeometry( 0, x, y, hdg, length, curvStart, curvEnd );

	}

	private createParamPoly3Geometry ( start: RoadControlPoint, end: RoadControlPoint ) {

		const p1 = new Vector2( start.position.x, start.position.y );
		const p2 = new Vector2( end.position.x, end.position.y );

		const dir1 = new Vector2( Math.cos( start.hdg ), Math.sin( start.hdg ) );
		const dir2 = new Vector2( Math.cos( end.hdg ), Math.sin( end.hdg ) );

		const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

		const det = 1 / ( ma * md - mb * mc );

		const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

		const dir2proj = new Vector2(
			dir2.x * mia + dir2.y * mic,
			dir2.x * mib + dir2.y * mid
		);

		/*flip y axis*/
		dir2proj.y = -dir2proj.y;

		const p2proj = new Vector2().subVectors( p2, p1 );

		p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

		/*flip y axis*/
		p2proj.y = -p2proj.y;

		const x = p1.x;
		const y = p1.y;

		const hdg = start.hdg;

		length = p1.distanceTo( p2 ); // TODO fix this

		const tangent1Length = 7; // hdgs[ i ][ 1 ]
		const tangent2Length = 7; // hdgs[ i + 1 ][ 2 ]

		const t1 = new Vector2( 1, 0 ).multiplyScalar( PARACUBICFACTOR * tangent1Length );
		const t2 = new Vector2( dir2proj.x, dir2proj.y ).multiplyScalar( PARACUBICFACTOR * tangent2Length );

		const hs = HermiteSpline( new Vector2( 0, 0 ), p2proj, t1, t2 );

		length = Length( hs, 0.001 );

		const f3 = new Vector2( -2 * p2proj.x + 1 * t1.x + 1 * t2.x, -2 * p2proj.y + 1 * t1.y + 1 * t2.y );
		const f2 = new Vector2( 3 * p2proj.x - 2 * t1.x - 1 * t2.x, 3 * p2proj.y - 2 * t1.y - 1 * t2.y );
		const f1 = new Vector2( 1 * t1.x, 1 * t1.y );

		const aU = 0;
		const bU = f1.x;
		const cU = f2.x;
		const dU = f3.x;

		const aV = 0;
		const bV = f1.y;
		const cV = f2.y;
		const dV = f3.y;

		return new TvParamPoly3Geometry( 0, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV )

	}
}
