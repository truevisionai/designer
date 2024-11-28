/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineType } from 'app/core/shapes/spline-type';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { RoadControlPoint } from 'app/objects/road/road-control-point';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { BufferGeometry, Line, LineBasicMaterial, LineLoop, Object3D } from "three";
import { COLOR } from "../../views/shared/utils/colors.service";
import { Object3DMap } from "../../core/models/object3d-map";

@Injectable( {
	providedIn: 'root'
} )
export class AbstractSplineDebugService {

	private linesInScene: Object3DMap<AbstractSpline, Object3D>;

	private points: Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>;

	private showing: Set<AbstractSpline>;

	private lines: Set<AbstractSpline>;

	constructor () {

		this.linesInScene = new Object3DMap();

		this.points = new Object3DArrayMap();

		this.showing = new Set();

		this.lines = new Set();

	}

	clear () {

		this.points.clear();

		// this.showing.forEach( spline => spline.hideLines() );

		this.showing.clear();

		// this.lines.forEach( spline => spline.hideLines() );

		this.lines.clear();

	}

	hide ( spline: AbstractSpline ) {

		// spline.hide();

		this.showing.delete( spline );

	}

	showLines ( spline: AbstractSpline ) {

		if ( spline.type == SplineType.CATMULLROM ) {

			this.showCatmullRomLines( spline as CatmullRomSpline );

		} else {

			// spline.showLines();

		}

		this.lines.add( spline );

	}

	hideLines ( spline: AbstractSpline ) {

		if ( spline.type == SplineType.CATMULLROM ) {

			this.hideCatmullRomLines( spline as CatmullRomSpline );

		} else {

			// spline.hideLines();

		}

		this.lines.delete( spline );

	}

	removeLines ( spline: AbstractSpline ) {

		this.lines.delete( spline );

	}

	removeControlPoints ( spline: AbstractSpline ) {

		this.points.removeKey( spline );

	}

	showControlPoints ( spline: AbstractSpline ) {

		this.points.removeKey( spline );

		spline.controlPoints.forEach( point => {

			point.visible = true;

			this.points.addItem( spline, point );

			if ( point instanceof RoadControlPoint ) {

				if ( point.frontTangent ) {

					point.frontTangent.visible = true;

					this.points.addItem( spline, point.frontTangent )
				}

				if ( point.backTangent ) {

					point.backTangent.visible = true;

					this.points.addItem( spline, point.backTangent )

				}

				if ( point.tangentLine ) {

					point.tangentLine.visible = true;

					this.points.addItem( spline, point.tangentLine )

				}

			}

		} );

	}

	hideControlPoints ( spline: AbstractSpline ) {

		this.points.removeKey( spline );

	}

	private showCatmullRomLines ( spline: CatmullRomSpline ) {

		if ( !spline.closed && spline.controlPoints.length < 2 ) return;

		if ( spline.closed && spline.controlPoints.length < 3 ) return;

		const line = this.createCatmullRomLine( spline );

		if ( !line ) return;

		this.linesInScene.add( spline, line );

	}

	private hideCatmullRomLines ( spline: CatmullRomSpline ) {

		this.linesInScene.remove( spline );

	}

	private createCatmullRomLine ( spline: CatmullRomSpline ) {

		const geometry = new BufferGeometry();

		geometry.setFromPoints( spline.curve.getPoints( 100 ) );

		let mesh: Line | LineLoop;

		// Create the final object to add to the scene
		if ( spline.closed ) {

			mesh = new LineLoop( geometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35 } ) );

		} else {

			mesh = new Line( geometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35 } ) );

		}

		mesh.castShadow = true;

		mesh.renderOrder = 1;

		mesh.frustumCulled = false;

		return mesh;
	}

}
