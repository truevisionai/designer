/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { TvRoad } from "../../map/models/tv-road.model";
import { AutoSplineV2 } from "../../core/shapes/auto-spline-v2";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { Box2, CatmullRomCurve3, Vector2, Vector3 } from "three";
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
import { RoadBuilder } from 'app/map/builders/road.builder';
import { MapService } from '../map/map.service';
import { Maths } from 'app/utils/maths';
import { TvConsole } from 'app/core/utils/console';
import { MapEvents } from "../../events/map-events";
import { RoadRemovedEvent } from "../../events/road/road-removed-event";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { SplineService } from "./spline.service";
import { Log } from 'app/core/utils/log';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';

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

function breakGeometries ( geometries: TvAbstractRoadGeometry[], sStart: number, sEnd: number | null ): TvAbstractRoadGeometry[] {

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

@Injectable( {
	providedIn: 'root'
} )
export class SplineBuilder {

	constructor (
		private splineService: SplineService,
		private mapService: MapService,
		private roadBuilder: RoadBuilder,
		private autoSplineBuilder: AutoSplineBuilder,
		private explicitSplineBuilder: ExplicitSplineBuilder
	) {
	}

	build ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) {
			Log.warn( 'No control points found in spline', spline?.toString() );
			return;
		}

		this.buildGeometry( spline );

		this.buildSegments( spline );

		this.buildBoundingBox( spline );

	}

	buildGeometry ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) {
			Log.warn( 'No control points found in spline', spline?.toString() );
			return;
		}

		if ( spline instanceof AutoSplineV2 ) {

			this.autoSplineBuilder.build( spline );

		} else if ( spline instanceof ExplicitSpline ) {

			this.explicitSplineBuilder.build( spline );

		} else if ( spline instanceof CatmullRomSpline ) {

			this.buildCatmullRomSpline( spline );

		}

	}

	/**
	 *
	 * @param spline
	 * @deprecated
	 */
	buildSpline ( spline: AbstractSpline ) {

		this.buildGeometry( spline );

	}

	buildSegments ( spline: AbstractSpline ) {

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				this.roadBuilder.rebuildRoad( segment, this.mapService.map );

			}

		}

	}

	buildBoundingBox ( spline: AbstractSpline ) {

		this.updateWidthCache( spline );

		this.updateWaypoints( spline );

		this.updateBoundPoints( spline );

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

	updateWidthCache ( spline: AbstractSpline ) {

		spline.widthCache.clear();

		const roads = this.splineService.getRoads( spline );

		let lastWidth = -1;

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			for ( let s = 0; s <= road.length; s += 5 ) {

				const width = road.getRoadWidthAt( s ).totalWidth;

				if ( width !== lastWidth ) {

					spline.widthCache.set( road.sStart + s, width );

					lastWidth = width;

				}

			}

		}
	}

	updateWaypoints ( spline: AbstractSpline ) {

		return;

		spline.waypoints = [];

		const stepSize = 1;

		const points = this.splineService.getPoints( spline, stepSize );

		for ( let i = 0; i < points.length - 1; i++ ) {

			const position = points[ i ];

			const roadWidth = this.getWidthAt( spline, position, i * stepSize );

			const point = new SimpleControlPoint( null, position );

			point.userData.width = roadWidth;

			spline.waypoints.push( point );

		}

	}

	getWidthAt ( spline: AbstractSpline, position?: Vector3, inputS?: number ): number {

		const cache = spline.widthCache;

		const checkS = inputS //;|| spline.getCoordAt( position )?.s;

		// Find the closest entry that is less than or equal to coord.s
		let closestS = -Infinity;

		let closestWidth = 12; // Default width

		for ( const [ s, width ] of cache ) {

			if ( s <= checkS && s > closestS ) {

				closestS = s;

				closestWidth = width;

			}

		}

		return closestWidth;

	}

	private updateBoundPoints ( spline: AbstractSpline ) {

		if ( spline.segmentMap.length == 0 ) {
			Log.warn( 'No segments found in spline', spline?.toString() );
			return;
		}

		if ( spline.controlPoints.length < 2 ) {
			Log.warn( 'No control points found in spline', spline?.toString() );
			return;
		}

		if ( spline.geometries.length == 0 ) {
			Log.warn( 'No geometries found in spline', spline?.toString() );
			return;
		}

		if ( spline.getLength() < 1 ) {
			Log.warn( 'No geometries found in spline', spline?.toString() );
			return;
		}

		// this buffer is added to left/right and center points to create a bounding box
		// to explain the width of the road
		// helps in intersection
		const BUFFER = 1;

		spline.leftPoints = [];
		spline.rightPoints = [];
		spline.centerPoints = [];

		let roadWidth: { leftSideWidth: number, rightSideWidth: number, totalWidth: number };

		const firstRoad = this.splineService.findFirstRoad( spline );

		if ( firstRoad ) {
			roadWidth = firstRoad.getRoadWidthAt( 0 );
		}

		const boundingBox = new Box2();

		let startPoints: { center: TvPosTheta, left: TvPosTheta, right: TvPosTheta };
		let endPoints: { center: TvPosTheta, left: TvPosTheta, right: TvPosTheta };

		for ( let s = 0; s <= spline.getLength(); s++ ) {

			const segment = spline.segmentMap.findAt( s );

			if ( segment instanceof TvRoad ) {
				roadWidth = segment.getRoadWidthAt( s - segment.sStart );
			}

			if ( !roadWidth ) {
				Log.error( 'Road width not found at ', s, spline.toString() );
				continue;
			}

			const center = this.splineService.getCoordAtOffset( spline, s );
			const left = center.clone().addLateralOffset( roadWidth.leftSideWidth + BUFFER );
			const right = center.clone().addLateralOffset( -roadWidth.rightSideWidth - BUFFER );

			const centerPoint = new SimpleControlPoint( null, center.position );
			const leftPoint = new SimpleControlPoint( null, left.position );
			const rightPoint = new SimpleControlPoint( null, right.position );

			spline.leftPoints.push( leftPoint );
			spline.centerPoints.push( centerPoint );
			spline.rightPoints.push( rightPoint );

			if ( startPoints === null ) {
				startPoints = { center, left, right };
			}

			endPoints = { center, left, right };

			boundingBox.expandByPoint( center.toVector2() );
			boundingBox.expandByPoint( left.toVector2() );
			boundingBox.expandByPoint( right.toVector2() );

		}

		if ( startPoints ) {

			const direction = startPoints.center.toDirectionVector().normalize().negate();
			const extenedPoint = startPoints.center.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedLeft = startPoints.left.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedRight = startPoints.right.position.add( direction.multiplyScalar( BUFFER ) );

			// add points at start of array
			spline.leftPoints.unshift( new SimpleControlPoint( null, extenedLeft ) );
			spline.centerPoints.unshift( new SimpleControlPoint( null, extenedPoint ) );
			spline.rightPoints.unshift( new SimpleControlPoint( null, extenedRight ) );

			boundingBox.expandByPoint( new Vector2( extenedPoint.x, extenedPoint.y ) );
			boundingBox.expandByPoint( new Vector2( extenedLeft.x, extenedLeft.y ) );
			boundingBox.expandByPoint( new Vector2( extenedRight.x, extenedRight.y ) );

		}

		if ( endPoints ) {

			const direction = endPoints.center.toDirectionVector().normalize();
			const extenedPoint = endPoints.center.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedLeft = endPoints.left.position.add( direction.multiplyScalar( BUFFER ) );
			const extenedRight = endPoints.right.position.add( direction.multiplyScalar( BUFFER ) );

			// add points at end of array
			spline.leftPoints.push( new SimpleControlPoint( null, extenedLeft ) );
			spline.centerPoints.push( new SimpleControlPoint( null, extenedPoint ) );
			spline.rightPoints.push( new SimpleControlPoint( null, extenedRight ) );

			boundingBox.expandByPoint( new Vector2( extenedPoint.x, extenedPoint.y ) );
			boundingBox.expandByPoint( new Vector2( extenedLeft.x, extenedLeft.y ) );
			boundingBox.expandByPoint( new Vector2( extenedRight.x, extenedRight.y ) );
		}

		spline.boundingBox.copy( boundingBox );

	}

	// spline.segmentMap.forEach( ( segment, sStart ) => {

	// 	if ( segment instanceof TvRoad ) {

	// 		for ( let s = 0; s < segment.length; s++ ) {

	// 			roadWidth = segment.getRoadWidthAt( s );

	// 			const center = segment.getPosThetaAt( s );
	// 			const left = center.clone().addLateralOffset( roadWidth.leftSideWidth );
	// 			const right = center.clone().addLateralOffset( -roadWidth.rightSideWidth );

	// 			const centerPoint = new SimpleControlPoint( null, center.position );
	// 			const leftPoint = new SimpleControlPoint( null, left.position );
	// 			const rightPoint = new SimpleControlPoint( null, right.position );

	// 			spline.leftPoints.push( leftPoint );
	// 			spline.centerPoints.push( centerPoint );
	// 			spline.rightPoints.push( rightPoint );

	// 		}

	// 	}

	// 	if ( segment instanceof TvJunction ) {

	// 		const previous = spline.segmentMap.getPrevious( segment );
	// 		const next = spline.segmentMap.getNext( segment );
	// 		const sEnd = spline.segmentMap.getNextKey( segment ) ?? spline.getLength();

	// 		if ( !roadWidth && next instanceof TvRoad ) {
	// 			roadWidth = next.getRoadWidthAt( 0 );
	// 		}

	// 		if ( !roadWidth && previous instanceof TvRoad ) {
	// 			roadWidth = previous.getRoadWidthAt( previous.length );
	// 		}

	// 		if ( !roadWidth ) {
	// 			const road = this.splineService.findFirstRoad( spline );
	// 			roadWidth = road.getRoadWidthAt( 0 );
	// 		}

	// 		if ( !roadWidth ) {
	// 			roadWidth = { leftSideWidth: 6, rightSideWidth: 6, totalWidth: 12 };
	// 		}

	// 		for ( let s = sStart; s < sEnd; s++ ) {

	// 			const center = this.splineService.getCoordAtOffset( spline, s );
	// 			const left = center.clone().addLateralOffset( roadWidth.leftSideWidth );
	// 			const right = center.clone().addLateralOffset( -roadWidth.rightSideWidth );

	// 			const centerPoint = new SimpleControlPoint( null, center.position );
	// 			const leftPoint = new SimpleControlPoint( null, left.position );
	// 			const rightPoint = new SimpleControlPoint( null, right.position );

	// 			spline.leftPoints.push( leftPoint );
	// 			spline.centerPoints.push( centerPoint );
	// 			spline.rightPoints.push( rightPoint );

	// 		}

	// 	}

	// } );
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

				if ( segment.geometries.length == 0 || Maths.approxEquals( segment.length, 0 ) ) {

					TvConsole.error( 'No geometries found for road' + segment.toString() );
					console.error( 'No geometries found for road', segment );

					if ( !segment.isJunction ) {
						MapEvents.roadRemoved.emit( new RoadRemovedEvent( segment ) );
					}

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

				const newGeometries = this.breakGeometries( splineGeometries, sStart, sEnd );

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

	breakGeometries ( geometries: TvAbstractRoadGeometry[], sStart: number, sEnd: number | null ): TvAbstractRoadGeometry[] {

		return breakGeometries( geometries, sStart, sEnd );

	}
}


@Injectable( {
	providedIn: 'root'
} )
export class ExplicitSplineBuilder {

	build ( spline: ExplicitSpline ): void {

		const geometries = this.exportFromSpline( spline );

		let splineLength = 0;

		geometries.forEach( geometry => splineLength += geometry.length );

		const segments = spline.segmentMap.toArray();

		for ( const segment of segments ) {

			if ( segment instanceof TvRoad ) {

				segment.clearGeometries();

				const sStart = segment.sStart;

				const sEnd = spline.segmentMap.getNextKey( segment ) || splineLength;

				const newGeometries = breakGeometries( geometries, sStart, sEnd );

				newGeometries.forEach( geometry => segment.addGeometry( geometry ) );

			}

		}

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

				geometry = this.computeGeometry( geometryType, currentPoint, nextPoint );

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

		if (
			Maths.approxEquals( curvStart, 0, 0.0001 ) &&
			Maths.approxEquals( curvEnd, 0, 0.0001 )
		) {
			p1.segmentType = TvGeometryType.LINE;
			return this.createLineGeometry( p1, p2 );
		}

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
