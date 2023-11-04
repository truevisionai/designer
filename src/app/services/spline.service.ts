import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SceneService } from './scene.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineService {

	constructor () { }

	show ( spline: AbstractSpline ) {

		spline.showLines();

	}

	hide ( spline: AbstractSpline ) {

		spline.hideLines();

	}

	showControlPoints ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( cp => SceneService.addToolObject( cp ) );

	}

	hideControlPoints ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( cp => SceneService.removeFromTool( cp ) );

	}

}
