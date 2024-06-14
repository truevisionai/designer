/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { Object3D } from "three";
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugLine } from '../../objects/debug-line';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { DebugState } from 'app/services/debug/debug-state';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { ExplicitSplineHelper } from "./explicit-spline.helper";
import { AutoSplineHelper } from "./auto-spline.helper";
import { TextObjectService } from '../text-object.service';
import { TvGeometryType } from 'app/map/models/tv-common';
import { TvArcGeometry } from 'app/map/models/geometries/tv-arc-geometry';
import { Maths } from 'app/utils/maths';
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { RoadDebugService } from "./road-debug.service";

const LINE_WIDTH = 2.0;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.5;
const ARROW_STEP = 5;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class SplineDebugService extends BaseDebugger<AbstractSpline> {

	private lines = new Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>();

	private arrows = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	private texts = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	private autoSplineHelper: BaseDebugger<AbstractSpline>;

	private explicitSplineHelper: BaseDebugger<AbstractSpline>;

	constructor (
		private roadDebugger: RoadDebugService,
		private debugService: DebugDrawService,
		private textService: TextObjectService,
	) {
		super();
		this.autoSplineHelper = new AutoSplineHelper();
		this.explicitSplineHelper = new ExplicitSplineHelper();
	}

	setDebugState ( spline: AbstractSpline, state: DebugState ) {

		if ( !spline ) return;

		this.setBaseState( spline, state );

		if ( spline.type == SplineType.AUTOV2 || spline.type == SplineType.AUTO ) {

			this.autoSplineHelper?.setDebugState( spline, state );

		} else if ( spline.type == SplineType.EXPLICIT ) {

			this.explicitSplineHelper.setDebugState( spline, state );

		}
	}

	onDefault ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		this.showBorder( spline );

	}

	onHighlight ( spline: AbstractSpline ): void {

		this.removeBorder( spline );

		if ( spline.controlPoints.length < 2 ) return;

		this.showBorder( spline, LINE_WIDTH * 2 );

		this.showArrows( spline );

	}

	onSelected ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		this.removeBorder( spline );
		this.showBorder( spline, LINE_WIDTH * 3, COLOR.RED );

		this.arrows.removeKey( spline );
		this.showArrows( spline );

		this.showReferenceLine( spline );

		this.showCurvature( spline );
	}

	showCurvature ( spline: AbstractSpline ) {

		this.texts.removeKey( spline );

		for ( const road of spline.getRoads() ) {

			road.geometries.filter( g => g.geometryType == TvGeometryType.ARC ).forEach( ( geometry: TvArcGeometry ) => {

				let text = `Radius: ` + Maths.round( geometry.radius ) + ' m';

				// Calculate the central angle of the arc
				// const centralAngle = ( geometry.length / geometry.radius ) * Maths.Rad2Deg;
				// text += ' ' + Maths.round( centralAngle ) + '*';

				const textObject3d = this.textService.createFromText( text );

				// Calculate the position for the text
				// Ensure the text is placed near the arc's midpoint, but slightly elevated or offset to improve visibility
				const midPoint = geometry.middleV3; // Assuming this is the midpoint on the arc
				const offsetDirection = midPoint.clone().sub( geometry.centre ).normalize(); // Direction from center to midpoint
				const offsetDistance = 15; // Adjust this value as needed to ensure visibility without clutter
				const position = midPoint.clone().sub( offsetDirection.multiplyScalar( offsetDistance ) );

				textObject3d.position.set( position.x, position.y, position.z + 0.5 );

				this.texts.addItem( spline, textObject3d );

			} )

		}

	}

	onUnselected ( spline: AbstractSpline ): void {

		this.removeBorder( spline );

		this.arrows.removeKey( spline );

		this.lines.removeKey( spline );

		this.texts.removeKey( spline );

	}

	onRemoved ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.texts.removeKey( spline );

		this.highlighted.delete( spline );

		this.selected.delete( spline );

		this.removeBorder( spline );

	}

	highlight ( spline: AbstractSpline ) {

		if ( this.selected.has( spline ) ) return;

		if ( this.highlighted.has( spline ) ) return;

		this.lines.removeKey( spline );

		this.showBorder( spline, LINE_WIDTH * 2 );

		this.showArrows( spline );

		this.highlighted.add( spline );

	}

	onUnhighlight ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

	}

	////// PRIVATE
	private showReferenceLine ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		const points = spline.getPoints( LINE_STEP ).map( point => point );

		points.forEach( point => point.z += LINE_ZOFFSET );

		try {

			const line = this.debugService.createDebugLine( spline, points, LINE_WIDTH );

			this.lines.addItem( spline, line );

		} catch ( error ) {

			console.error( error );

		}

	}

	showBorder ( spline: AbstractSpline, lineWidth = LINE_WIDTH, color = COLOR.CYAN ) {

		for ( const road of spline.getRoads() ) {

			this.roadDebugger.showRoadBorderLine( road, lineWidth, color );

		}

	}

	removeBorder ( spline: AbstractSpline ) {

		for ( const road of spline.getRoads() ) {

			this.roadDebugger.removeRoadBorderLine( road );

		}

	}

	private showArrows ( spline: AbstractSpline ) {

		for ( const road of spline.getRoads() ) {

			for ( const point of road.getReferenceLinePoints( ARROW_STEP ) ) {

				const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

				this.arrows.addItem( spline, arrow );


			}

		}

	}

	clear () {

		super.clear();

		this.lines.clear();

		this.arrows.clear();

		this.texts.clear();

		this.autoSplineHelper?.clear();

		this.explicitSplineHelper?.clear();

		this.roadDebugger.clear();

	}

}
