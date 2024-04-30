/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { RoadControlPoint } from 'app/objects/road-control-point';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { SceneService } from '../scene.service';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";

@Injectable( {
	providedIn: 'root'
} )
export class AbstractSplineDebugService {

	private points = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	private showing = new Set<AbstractSpline>();

	private lines = new Set<AbstractSpline>();

	constructor () {
	}

	clear () {

		this.points.clear();

		this.showing.forEach( spline => spline.hideLines() );

		this.showing.clear();

		this.lines.forEach( spline => spline.hideLines() );

		this.lines.clear();

	}

	hide ( spline: AbstractSpline ) {

		spline.hide();

		this.showing.delete( spline );

	}

	showLines ( spline: AbstractSpline ) {

		if ( spline.type == SplineType.CATMULLROM ) {

			this.showCatmullRomLines( spline as CatmullRomSpline );

		} else {

			spline.showLines();

		}

		this.lines.add( spline );

	}

	hideLines ( spline: AbstractSpline ) {

		if ( spline.type == SplineType.CATMULLROM ) {

			this.hideCatmullRomLines( spline as CatmullRomSpline );

		} else {

			spline.hideLines();

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

	addControlPoint ( spline: AbstractSpline, point: AbstractControlPoint ) {

		spline.addControlPoint( point );

		this.points.addItem( spline, point );

	}

	hideControlPoints ( spline: AbstractSpline ) {

		this.points.removeKey( spline );

	}

	private showCatmullRomLines ( spline: CatmullRomSpline ) {

		spline.mesh.visible = true;

		SceneService.addToolObject( spline.mesh );

	}

	private hideCatmullRomLines ( spline: CatmullRomSpline ) {

		spline.mesh.visible = false;

		SceneService.removeFromTool( spline.mesh );

	}

}
