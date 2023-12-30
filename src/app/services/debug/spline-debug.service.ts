import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Object3DArrayMap } from "../../tools/lane-width/object-3d-map";
import { Object3D } from "three";
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { DebugLine } from './debug-line';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { MapService } from '../map.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

const LINE_WIDTH = 1.5;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.5;
const ARROW_STEP = 5;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class SplineDebugService {

	private lines = new Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>();

	private arrows = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	private highlighted = new Set<AbstractSpline>();

	private selected = new Set<AbstractSpline>();

	constructor (
		private debugService: DebugDrawService,
		private laneDebugService: LaneDebugService,
		private mapService: MapService,
	) {
	}

	showReferenceLine ( spline: AbstractSpline ) {

		const points = spline.getPoints( LINE_STEP ).map( point => point );

		points.forEach( point => point.z += LINE_ZOFFSET );

		const line = this.debugService.createDebugLine( spline, points, LINE_WIDTH );

		this.lines.addItem( spline, line );

	}

	showBorderLine ( spline: AbstractSpline, lineWidth = LINE_WIDTH, color = COLOR.CYAN ) {

		// const add = ( lane: TvLane ) => {

		// 	const points = this.laneDebugService.getPoints( lane, 0, lane.laneSection.length, LINE_STEP );

		// 	const line = this.debugService.createDebugLine( spline, points, lineWidth, color );

		// 	this.lines.addItem( spline, line );
		// }

		// road.laneSections?.forEach( laneSection => {

		// 	add( laneSection.getRightMostLane() );

		// 	add( laneSection.getLeftMostLane() );

		// } )

	}

	highlight ( spline: AbstractSpline ) {

		if ( this.selected.has( spline ) ) return;

		if ( this.highlighted.has( spline ) ) return;

		this.lines.removeKey( spline );

		this.showBorderLine( spline, LINE_WIDTH * 2 );

		this.showRoadDirectionArrows( spline );

		this.highlighted.add( spline );

	}

	select ( spline: AbstractSpline ) {

		if ( this.selected.has( spline ) ) return;

		this.lines.removeKey( spline );

		this.showBorderLine( spline, LINE_WIDTH * 3, COLOR.RED );

		this.showRoadDirectionArrows( spline );

		this.selected.add( spline );

	}

	removeHighlight () {

		this.highlighted.forEach( road => {

			if ( this.selected.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

			this.showBorderLine( road );

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

	unselect ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.showBorderLine( spline );

		this.selected.delete( spline );

	}

	upateRoadBorderLine ( spline: AbstractSpline, lineWidth = LINE_WIDTH ) {

		// this.lines.removeKey( road );

		// this.showBorderLine( road, lineWidth );

		// this.updatePredecessor( road, predecessor => {

		// 	this.lines.removeKey( predecessor );

		// 	this.showBorderLine( predecessor );

		// } );

		// this.updateSuccessor( road, successor => {

		// 	this.lines.removeKey( successor );

		// 	this.showBorderLine( successor );

		// } );

	}

	showRoadDirectionArrows ( spline: AbstractSpline ) {

		// this.getReferenceLinePoints( road, ARROW_STEP ).forEach( point => {

		// 	const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

		// 	this.arrows.addItem( road, arrow );

		// } );

	}

	updateRoadDirectionArrows ( spline: AbstractSpline ) {

		// this.arrows.removeKey( road );

		// this.showRoadDirectionArrows( road );

		// this.updatePredecessor( road, predecessor => {

		// 	this.arrows.removeKey( predecessor );

		// 	this.showRoadDirectionArrows( predecessor );

		// } );

		// this.updateSuccessor( road, successor => {

		// 	this.arrows.removeKey( successor );

		// 	this.showRoadDirectionArrows( successor );

		// } );

	}

	clear () {

		this.lines.clear();

		this.arrows.clear();

		this.removeHighlight();

		this.selected.clear();

	}

}
