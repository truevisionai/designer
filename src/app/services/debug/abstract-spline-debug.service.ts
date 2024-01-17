import { Injectable } from '@angular/core';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { Object3DArrayMap } from 'app/tools/lane-width/object-3d-map';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { Object3D } from 'three';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { SceneService } from '../scene.service';

@Injectable( {
	providedIn: 'root'
} )
export class AbstractSplineDebugService {

	private points = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	private showing = new Set<AbstractSpline>();

	private lines = new Set<AbstractSpline>();

	constructor () { }

	show ( spline: AbstractSpline ) {

		spline.show();

		this.showing.add( spline );

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

	showControlPoints ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( point => {

			point.visible = true;

			this.points.addItem( spline, point );

			if ( point instanceof RoadControlPoint ) {

				this.points.addItem( spline, point.frontTangent )

				this.points.addItem( spline, point.backTangent )

				this.points.addItem( spline, point.tangentLine )

			}

		} );

	}

	addControlPoint ( spline: AbstractSpline, point: AbstractControlPoint ) {

		spline.addControlPoint( point );

		this.points.addItem( spline, point );

	}

	removeControlPoint ( spline: AbstractSpline, point: AbstractControlPoint ) {

		spline.removeControlPoint( point );

		this.points.removeItem( spline, point );

	}

	hideControlPoints ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( point => {

			point.visible = false;

			this.points.removeItem( spline, point );

		} );

	}

	clear () {

		for ( const spline of this.lines ) {
			this.hideLines( spline );
		}

		for ( const spline of this.showing ) {
			this.hide( spline );
		}

		this.showing.clear();
		this.lines.clear();
		this.points.clear();

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
