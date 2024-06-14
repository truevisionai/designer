/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferGeometry, CatmullRomCurve3, CurveType, Line, LineBasicMaterial, LineLoop, Vector3 } from 'three';
import { AbstractSpline, SplineType } from './abstract-spline';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { TvConsole } from '../utils/console';

export class CatmullRomSpline extends AbstractSpline {

	public type: SplineType = SplineType.CATMULLROM;

	public curve: CatmullRomCurve3;

	public mesh: Line;

	constructor ( closed = true, public curveType: CurveType = 'catmullrom', tension = 0.5 ) {

		super( closed, tension );

	}

	init (): void {

		this.curve = new CatmullRomCurve3( this.controlPointPositions, this.closed, this.curveType || 'catmullrom', this.tension );

		const geometry = new BufferGeometry();

		// Create the final object to add to the scene
		if ( this.closed ) {

			this.mesh = new LineLoop( geometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35 } ) );

		} else {

			this.mesh = new Line( geometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35 } ) );

		}

		this.mesh.castShadow = true;

		this.mesh.renderOrder = 1;

		this.mesh.frustumCulled = false;

	}

	hide (): void {

		this.controlPoints.forEach( i => i.visible = false );

		this.mesh.visible = false;

	}

	hideLines () {

		this.mesh.visible = false;

	}

	showLines () {

		this.mesh.visible = true;

	}

	show (): void {

		this.controlPoints.forEach( i => i.visible = true );

		this.mesh.visible = true;

	}

	hideAllTangents () {

		this.controlPoints.forEach( ( cp: AbstractControlPoint ) => {

			this.hideTangenAt();

		} );

	}

	showcontrolPoints () {

		this.controlPoints.forEach( co => co.visible = true );

	}

	hidecontrolPoints () {

		this.controlPoints.forEach( co => co.visible = false );

	}

	showTangentsAt () {

	}

	hideTangenAt () {

	}

	update (): void {

		if ( this.controlPoints.length < 2 ) return;

		// if ( !this.curve ) {
		//     this.curve = new CatmullRomCurve3(
		//         this.controlPointPositions,
		//         this.closed,
		//         this.type,
		//         this.tension
		//     );
		// }

		this.curve.points = this.controlPointPositions;

		this.curve.updateArcLengths();

		this.mesh.geometry.dispose();

		this.mesh.geometry = new BufferGeometry().setFromPoints( this.curve.getPoints( 100 ) );

	}

	add ( point: AbstractControlPoint ) {

		this.controlPoints.push( point );

		this.curve.points.push( point.position );

		this.update();
	}

	insertPoint ( newPoint: AbstractControlPoint ) {

		// If the spline is not closed, just add the point to the end
		if ( !this.closed ) {

			this.addControlPoint( newPoint );

			this.update();

			return;

		}

		super.insertPoint( newPoint );
	}

	exportGeometries (): TvAbstractRoadGeometry[] {

		TvConsole.warn( 'Catmull rom spline does not support export geometries.' );
		return [];

	}

	getLength () {

		return this.curve.getLength();

	}

	getPoints ( spacing = 10 ): Vector3[] {

		return this.curve.getPoints( spacing );

	}

	getPoint ( t: number, offset: number ): TvPosTheta {

		TvConsole.warn( 'Catmull rom spline does not support export geometries.' );
		return;

	}

}
