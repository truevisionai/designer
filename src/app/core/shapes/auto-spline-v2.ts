import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from 'app/modules/tv-map/models/geometries/tv-arc-geometry';
import { TvLineGeometry } from 'app/modules/tv-map/models/geometries/tv-line-geometry';
import { Vector2, Vector3 } from 'three';
import { AbstractSpline, SplineType } from './abstract-spline';
import { PolyLine } from './PolyLine';
import { RoundLine } from './round-line';
import { SceneService } from '../../services/scene.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";
import { SplineSegment } from './spline-segment';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';

export class AutoSplineV2 extends AbstractSpline {

	public type: SplineType = SplineType.AUTOV2;

	public polyline: PolyLine;

	public roundline: RoundLine;

	private cachedSplineGeometries: TvAbstractRoadGeometry[] = [];

	constructor () {

		super();

	}

	init () {

		this.polyline = new PolyLine( this.controlPoints );

		this.roundline = new RoundLine( this.controlPoints );

	}

	hide (): void {

		this.hideControlPoints();

		this.hideLines();

	}

	hideLines () {

		this.polyline.mesh.visible = false;
		this.roundline.mesh.visible = false;

		SceneService.removeFromTool( this.polyline.mesh );
		SceneService.removeFromTool( this.roundline.mesh );

	}

	showLines () {

		this.polyline.mesh.visible = true;
		this.roundline.mesh.visible = true;

		SceneService.addToolObject( this.polyline.mesh );
		SceneService.addToolObject( this.roundline.mesh );

	}

	show (): void {

		this.showControlPoints();

		this.showLines();

	}

	update () {

		this.updateHdgs();

		this.polyline.update();

		this.roundline.update();

		this.updateSplineGeometry();

		this.updateRoadSegments();

	}

	updateRoadSegments () {

		const geometries = this.cachedSplineGeometries;

		const splineLength = this.getLength();

		for ( let i = 0; i < this.splineSegments.length; i++ ) {

			const segment = this.splineSegments[ i ];

			let nextSegment: SplineSegment;
			if ( i + 1 < this.splineSegments.length ) {
				nextSegment = this.splineSegments[ i + 1 ];
			}

			// Clear previous geometries
			segment.geometries = [];

			let segmentLength: number;
			if ( nextSegment ) {
				segmentLength = nextSegment.start - segment.start
			} else {
				segmentLength = splineLength - segment.start;
			}

			// Variables to keep track of the current position and remaining length of the segment
			let currentS = segment.start;
			let remainingLength = segmentLength;
			let lengthCovered = 0;

			if ( !segment.isRoad ) {
				remainingLength -= segmentLength;
				currentS += segmentLength;
				lengthCovered += segmentLength;
				continue;
			}

			// Iterate through the geometries to find those that fall within the segment
			for ( const geometry of geometries ) {

				// If the current position has surpassed this geometry, skip it
				if ( currentS > geometry.endS ) {
					continue;
				}

				// If the current position is before this geometry, break the loop as we have covered all relevant geometries
				if ( currentS < geometry.s ) {
					break;
				}

				// Cut the geometry if the current position is within this geometry's bounds
				if ( currentS >= geometry.s && currentS < geometry.endS ) {
					// The segment's current position is within this geometry
					let section: TvAbstractRoadGeometry;
					if ( currentS + remainingLength <= geometry.endS ) {
						// The rest of the segment fits within this geometry
						const sections = geometry.cut( currentS );
						section = sections[ 1 ];
						section.length = remainingLength;
						// Update the start 's' to be relative to the segment's start, not the spline's start
						section.s = lengthCovered;

						remainingLength = 0; // The segment is now fully covered
					} else {
						// The segment extends beyond this geometry
						const sections = geometry.cut( currentS );
						section = sections[ 1 ];
						section.s = lengthCovered;
						section.length = geometry.endS - currentS; // The section's length is the remaining length of the geometry
						remainingLength -= section.length; // Reduce the remaining length by what's covered by this geometry
					}

					// Update the start 's' to be relative to the segment's start, not the spline's start
					// section.s -= segment.start;
					// Add this section to the segment's geometries
					segment.geometries.push( section );

					// Update the current position
					currentS += section.length;

					// Update the length covered so far
					lengthCovered += section.length;

					// If the segment is fully covered, break the loop
					if ( remainingLength <= 0 ) {
						break;
					}
				}
			}

			// Validation to ensure we are not exceeding the segment's length
			// const totalGeomLength = segment.geometries.reduce( ( total, geom ) => total + geom.length, 0 );
			// if ( segment.length != -1 && totalGeomLength > segment.length ) {
			// 	console.error( `Total length of geometries exceeds the segment length for segment starting at ${ segment.start }`, segment.length, totalGeomLength, segment.geometries );
			// 	// Additional handling may be needed here depending on your application's requirements
			// }
		}
	}

	updateHdgs () {

		const hdgs = [];

		let hdg, p1, p2, currentPoint: AbstractControlPoint, previousPoint: AbstractControlPoint;

		for ( let i = 1; i < this.controlPoints.length; i++ ) {

			previousPoint = this.controlPoints[ i - 1 ];
			currentPoint = this.controlPoints[ i ];

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

	clear () {

		this.hideControlPoints();
		this.hideLines();

	}

	exportGeometries (): TvAbstractRoadGeometry[] {

		let totalLength = 0;

		const points = this.roundline.points as AbstractControlPoint[];

		const radiuses = this.roundline.radiuses;

		const geometries: TvAbstractRoadGeometry[] = [];

		let s = totalLength;

		for ( let i = 1; i < points.length; i++ ) {

			let x, y, hdg, length;

			const previous = points[ i - 1 ].position;
			const current = points[ i ].position;

			const p1 = new Vector2( previous.x, previous.y );

			const p2 = new Vector2( current.x, current.y );

			const d = p1.distanceTo( p2 );

			// line between p1 and p2
			if ( d - radiuses[ i - 1 ] - radiuses[ i ] > 0.001 ) {

				[ x, y ] = new Vector2()
					.subVectors( p2, p1 )
					.normalize()
					.multiplyScalar( radiuses[ i - 1 ] )
					.add( p1 )
					.toArray();

				// hdg = new Vector2().subVectors( p2, p1 ).angle();
				hdg = points[ i - 1 ][ 'hdg' ];

				length = d - radiuses[ i - 1 ] - radiuses[ i ];

				s = totalLength;

				totalLength += length;

				geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

			}

			// arc for p2
			if ( radiuses[ i ] > 0 ) { // first and last point can't have zero radiuses

				const next = points[ i + 1 ].position;

				const dir1 = new Vector2( current.x - previous.x, current.y - previous.y ).normalize();

				const dir2 = new Vector2( next.x - current.x, next.y - current.y ).normalize();

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

				let r, alpha, sign;

				[ r, alpha, length, sign ] = this.getArcParams( pp1, pp2, dir1, dir2 );

				if ( r != Infinity ) {

					s = totalLength;

					totalLength += length;

					const curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / r ); // sign < for mirror image

					geometries.push( new TvArcGeometry( s, x, y, hdg, length, curvature ) );

				} else {

					s = totalLength;

					length = pp1.distanceTo( pp2 );

					totalLength += length;

					geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

					console.warn( 'radius is infinity' );

				}

			}

		}

		return geometries;
	}

	addControlPointAt ( position: Vector3 ): AbstractControlPoint {

		// const index = this.controlPoints.length;

		// const lastSegment = this.roadSegments[ this.roadSegments.length - 1 ];

		// const lastRoadId = lastSegment?.roadId;

		// const lastRoad = lastRoadId ? TvMapInstance.map.getRoadById( lastRoadId ) : null;

		const point = ControlPointFactory.createControl( this, position );

		this.controlPoints.push( point );

		this.update();

		return point;
	}

	getPoint ( t: number, offset = 0 ): TvPosTheta {

		const geometries = this.cachedSplineGeometries;

		const length = geometries.map( g => g.length ).reduce( ( a, b ) => a + b );

		const s = length * t;

		const geometry = geometries.find( g => s >= g.s && s <= g.endS );

		const posTheta = geometry.getRoadCoord( s );

		posTheta.addLateralOffset( offset );

		return posTheta;
	}

	getLength () {

		const geometries = this.cachedSplineGeometries;

		let length = 0;

		for ( let i = 0; i < geometries.length; i++ ) {

			length += geometries[ i ].length;

		}

		return length;
	}

	updateSplineGeometry () {

		this.cachedSplineGeometries = [];

		let totalLength = 0;

		const points = this.roundline.points as AbstractControlPoint[];

		const radiuses = this.roundline.radiuses;

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

				// hdg = new Vector2().subVectors( p2, p1 ).angle();
				hdg = points[ i - 1 ][ 'hdg' ];

				length = distance - previousRadius - currentRadius;

				s = totalLength;

				totalLength += length;

				geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

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

				[ r, alpha, length, sign ] = this.getArcParams( pp1, pp2, dir1, dir2 );

				if ( r != Infinity ) {

					s = totalLength;

					totalLength += length;

					const curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / r ); // sign < for mirror image

					geometries.push( new TvArcGeometry( s, x, y, hdg, length, curvature ) );

				} else {

					s = totalLength;

					length = pp1.distanceTo( pp2 );

					totalLength += length;

					geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );

					console.warn( 'radius is infinity' );

				}

			}

		}

		this.cachedSplineGeometries = geometries;

	}
}
