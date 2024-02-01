/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { Object3D } from "three";
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugLine } from '../../objects/debug-line';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { DebugState } from 'app/services/debug/debug-state';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { DebugService } from 'app/core/interfaces/debug.service';
import { ExplicitSplineHelper } from "./explicit-spline.helper";
import { AutoSplineHelper } from "./auto-spline.helper";

const LINE_WIDTH = 1.5;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.5;
const ARROW_STEP = 5;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class SplineDebugService extends DebugService<AbstractSpline> {

	private lines = new Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>();

	private arrows = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	private autoSplineHelper: DebugService<AbstractSpline>;

	private explicitSplineHelper: DebugService<AbstractSpline>;

	constructor (
		private debugService: DebugDrawService,
		private laneDebugService: LaneDebugService
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

	}

	onUnselected ( spline: AbstractSpline ): void {

		this.removeBorder( spline );

		this.arrows.removeKey( spline );

		this.lines.removeKey( spline );

	}

	onRemoved ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

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

	private showBorder ( spline: AbstractSpline, lineWidth = LINE_WIDTH, color = COLOR.CYAN ) {

		const leftPoints = [];
		const rightPoints = [];

		const roads = spline.getRoads();

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			if ( road.isJunction ) continue;

			road.laneSections?.forEach( laneSection => {

				const leftLane = laneSection.getLeftMostLane();
				const left = this.laneDebugService.getPoints( leftLane, 0, laneSection.length, LINE_STEP );

				const rightLane = laneSection.getRightMostLane();
				const right = this.laneDebugService.getPoints( rightLane, 0, laneSection.length, LINE_STEP );

				leftPoints.push( ...left );
				rightPoints.push( ...right );

			} );

			this.lines.addItem( spline, this.debugService.createDebugLine( spline, leftPoints, lineWidth, color ) );
			this.lines.addItem( spline, this.debugService.createDebugLine( spline, rightPoints, lineWidth, color ) );

		}

	}

	private removeBorder ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

	}

	private showArrows ( spline: AbstractSpline ) {

		spline.getDirectedPoints( ARROW_STEP ).forEach( point => {

			const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

			this.arrows.addItem( spline, arrow );

		} )

	}

}
