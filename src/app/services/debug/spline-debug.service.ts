/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { Object3D } from "three";
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugLine } from '../../objects/debug-line';
import { MapService } from '../map/map.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { SceneService } from '../scene.service';
import { DebugState } from 'app/services/debug/debug-state';
import { AbstractSplineDebugService } from './abstract-spline-debug.service';
import { RoadDebugService } from './road-debug.service';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { DebugService } from 'app/core/interfaces/debug.service';

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

	private controlPoints = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	constructor (
		private debugService: DebugDrawService,
		private laneDebugService: LaneDebugService,
		private mapService: MapService,
		private splineDebugService: AbstractSplineDebugService,
		private roadDebug: RoadDebugService,
	) {
		super();
	}

	get splines () {
		return this.mapService.splines;
	}

	setDebugState ( spline: AbstractSpline, state: DebugState ) {

		if ( !spline ) return;

		this.setBaseState( spline, state );
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

		this.showControlPoints( spline );

		if ( spline.controlPoints.length < 2 ) return;

		this.splineDebugService.showLines( spline );

		this.removeBorder( spline );
		this.showBorder( spline, LINE_WIDTH * 3, COLOR.RED );

		this.arrows.removeKey( spline );
		this.showArrows( spline );

		this.showReferenceLine( spline );

	}

	onUnselected ( spline: AbstractSpline ): void {

		this.hideControlPoints( spline );

		this.splineDebugService.hideLines( spline );

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

		this.hideControlPoints( spline );

		this.splineDebugService.hide( spline );

	}

	////// PRIVATE

	showBorders () {

		for ( let i = 0; i < this.splines.length; i++ ) {

			const spline = this.splines[ i ];

			this.showBorder( spline );

		}

	}

	showReferenceLine ( spline: AbstractSpline ) {

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

	removeBorder ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

	}

	select ( spline: AbstractSpline ) {

		if ( this.selected.has( spline ) ) return;

		this.lines.removeKey( spline );

		this.showBorder( spline, LINE_WIDTH * 3, COLOR.RED );

		this.showArrows( spline );

		this.selected.add( spline );

	}

	unselect ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.selected.delete( spline );

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

	resetHighlighted () {

		this.highlighted.forEach( road => {

			if ( this.selected.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

			this.showBorder( road );

		} )

		this.highlighted.clear();

	}

	clearLines () {

		this.highlighted.forEach( road => {

			if ( this.selected.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

		} )

		this.highlighted.clear();

	}

	upateBorder ( spline: AbstractSpline, lineWidth = LINE_WIDTH ) {

		this.lines.removeKey( spline );

		this.showBorder( spline, lineWidth );

	}

	showArrows ( spline: AbstractSpline ) {

		spline.getDirectedPoints( ARROW_STEP ).forEach( point => {

			const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

			this.arrows.addItem( spline, arrow );

		} )

	}

	updateArrows ( spline: AbstractSpline ) {

		this.arrows.removeKey( spline );

		this.showArrows( spline );

	}

	clear () {

		this.lines.clear();

		this.arrows.clear();

		this.resetHighlighted();

		this.selected.clear();

		this.splineDebugService.clear();

	}

	addControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		this.controlPoints.addItem( spline, controlPoint );

	}

	removeControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		SceneService.removeFromTool( controlPoint );

		this.controlPoints.removeItem( spline, controlPoint );

	}

	showControlPoints ( spline: AbstractSpline ) {

		this.splineDebugService.showControlPoints( spline );

	}

	hideControlPoints ( spline: AbstractSpline ) {

		this.splineDebugService.hideControlPoints( spline );

	}

}
