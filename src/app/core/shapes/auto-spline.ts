/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/objects/road-control-point';
import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from 'app/map/models/geometries/tv-arc-geometry';
import { TvLineGeometry } from 'app/map/models/geometries/tv-line-geometry';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector2, Vector3 } from 'three';
import { AbstractSpline, SplineType } from './abstract-spline';
import { Polyline } from '../../objects/polyline';
import { RoundLine } from './round-line';
import { SceneService } from '../../services/scene.service';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvPosTheta } from 'app/map/models/tv-pos-theta';


export class AutoSpline extends AbstractSpline {

	public type:SplineType = SplineType.AUTO;

	public polyline: Polyline;

	public roundline: RoundLine;

	constructor ( private road?: TvRoad ) {

		super();

	}

	init () {

		this.polyline = new Polyline( this.controlPoints );

		this.roundline = new RoundLine( this.controlPoints );

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

		this.showLines();

	}

	addControlPoint ( cp: RoadControlPoint ) {

		super.addControlPoint( cp );

	}

	update () {

		this.updateHdgs();

		this.polyline.update();

		this.roundline.update();

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

		this.controlPoints.splice( 0, this.controlPoints.length );

		SceneService.removeFromMain( this.polyline.mesh );

		SceneService.removeFromMain( this.roundline.mesh );

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

					//console.warn( 'radius is infinity' );

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

	getPoint ( t: number, offset = 0 ): TvPosTheta {

		const geometries = this.exportGeometries();

		const length = geometries.map( g => g.length ).reduce( ( a, b ) => a + b );

		const s = length * t;

		const geometry = geometries.find( g => s >= g.s && s <= g.endS );

		const posTheta = geometry.getRoadCoord( s );

		posTheta.addLateralOffset( offset );

		return posTheta;
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
