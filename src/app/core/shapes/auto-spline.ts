/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from 'app/modules/tv-map/models/geometries/tv-arc-geometry';
import { TvLineGeometry } from 'app/modules/tv-map/models/geometries/tv-line-geometry';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector2, Vector3 } from 'three';
import { AbstractSpline } from './abstract-spline';
import { PolyLine } from './PolyLine';
import { RoundLine } from './round-line';


export class AutoSpline extends AbstractSpline {

	public type = 'auto';

	public polyline: PolyLine;

	public roundline: RoundLine;

	constructor ( private road?: TvRoad ) {

		super();

	}

	get hdgs () {
		return this.controlPoints.map( ( cp: RoadControlPoint ) => cp.hdg );
	}

	init () {

		this.polyline = new PolyLine( this.controlPoints );

		this.roundline = new RoundLine( this.controlPoints );

		if ( this.meshAddedInScene ) return;

		this.scene.add( this.polyline.mesh );

		this.scene.add( this.roundline.mesh );

		this.meshAddedInScene = true;

	}

	hide (): void {

		this.controlPoints.forEach( i => i.visible = false );

		this.hideLines();

	}

	hideLines () {

		this.polyline.mesh.visible = false;
		this.roundline.mesh.visible = false;

	}

	showLines () {

		this.polyline.mesh.visible = true;
		this.roundline.mesh.visible = true;

	}


	show (): void {

		this.controlPoints.forEach( i => i.visible = true );

		this.polyline.mesh.visible = true;

		this.roundline.mesh.visible = true;

	}

	addControlPoint ( cp: RoadControlPoint ) {

		// this.polyline.addPoint( cp );

		// this.roundline.addPoint( cp );

		super.addControlPoint( cp );

	}

	update () {

		this.updateHdgs();

		this.polyline.update();

		this.roundline.update();


	}

	updateHdgs () {

		const hdgs = [];

		let hdg, p1, p2, currentPoint, previousPoint;

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

		this.controlPoints.splice( 0, this.controlPoints.length );

		this.scene.remove( this.polyline.mesh );

		this.scene.remove( this.roundline.mesh );

	}

	exportGeometries (): TvAbstractRoadGeometry[] {

		let totalLength = 0;

		const points = this.roundline.points as RoadControlPoint[];

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
				hdg = points[ i - 1 ].hdg;

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

	addControlPointAt ( position: Vector3 ): RoadControlPoint {

		const index = this.controlPoints.length;

		const point = new RoadControlPoint( this.road, position, 'cp', index, index );

		this.controlPoints.push( point );

		this.update();

		return point;
	}

	getPoint ( t: number, offset = 0 ): Vector3 {

		const geometries = this.exportGeometries();

		const length = geometries.map( g => g.length ).reduce( ( a, b ) => a + b );

		const s = length * t;

		const geometry = geometries.find( g => s >= g.s && s <= g.s2 );

		const posTheta = new TvPosTheta();

		geometry.getCoords( s, posTheta );

		posTheta.addLateralOffset( offset );

		return posTheta.toVector3();
	}

	getLength () {

		const geometries = this.exportGeometries();

		let length = 0;

		for ( let i = 0; i < geometries.length; i++ ) {

			length += geometries[ i ].length;

		}

		return length;
	}
}
