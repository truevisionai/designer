/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector2, Vector3 } from 'three';
import { AbstractSpline, SplineType } from './abstract-spline';
import { Polyline } from '../../objects/polyline';
import { RoundLine } from './round-line';
import { SceneService } from '../../services/scene.service';
import { AbstractControlPoint } from "../../objects/abstract-control-point";


/**
 * @deprecated
 */
export class DepAutoSpline extends AbstractSpline {

	getPoints ( stepSize: number ): Vector3[] {
		throw new Error( 'Method not implemented.' );
	}

	public type: SplineType = SplineType.AUTO;

	public polyline: Polyline;

	public roundline: RoundLine;

	constructor () {

		super();

	}

	init () {

		this.polyline = new Polyline( this.controlPoints );

		this.roundline = new RoundLine( this.controlPoints );

	}

	hide (): void {

		this.controlPoints.forEach( i => i.visible = false );

		// this.hideLines();

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

}
