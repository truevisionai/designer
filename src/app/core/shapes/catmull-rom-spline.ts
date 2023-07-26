/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { COLOR } from 'app/shared/utils/colors.service';
import { BufferGeometry, CatmullRomCurve3, Line, LineBasicMaterial, LineLoop, Vector3 } from 'three';
import { AbstractSpline } from './abstract-spline';

export class CatmullRomSpline extends AbstractSpline {

	public type: string = 'catmullrom';

	public curveType: string = 'curve';

	public curve: CatmullRomCurve3;

	public mesh: Line;

	constructor ( closed = true, type = 'catmullrom', tension = 0.5 ) {

		super( closed, tension );

	}

	init (): void {

		this.curve = new CatmullRomCurve3( this.controlPointPositions, this.closed, this.type || 'catmullrom', this.tension );

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

		this.scene.add( this.mesh );
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

		this.controlPoints.forEach( ( cp: AnyControlPoint ) => {

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

	add ( point: AnyControlPoint ) {

		this.controlPoints.push( point );

		this.curve.points.push( point.position );

		this.update();
	}

	exportGeometries (): TvAbstractRoadGeometry[] {

		throw new Error( 'Method not implemented.' );

	}

	getLength () {

		return this.curve.getLength();

	}

	getPoints ( spacing = 10 ): Vector3[] {

		return this.curve.getPoints( spacing );

	}

	getPoint ( t: number, offset: number ): Vector3 {

		throw new Error( 'Method not implemented.' );

	}

}
