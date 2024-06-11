/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TravelDirection, TvLaneSide } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { DebugDrawService } from './debug-draw.service';
import { DebugLine } from '../../objects/debug-line';
import { Object3D, Vector3 } from 'three';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";

const LINE_WIDTH = 1.5;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.0;
const ARROW_STEP = 5;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class LaneDebugService {

	private lines = new Object3DArrayMap<TvLane, DebugLine<TvLane>[]>();

	private arrows = new Object3DArrayMap<TvLane, Object3D[]>();

	private highlightedLanes = new Set<TvLane>();

	private selectedLanes = new Set<TvLane>();

	constructor (
		private debugService: DebugDrawService
	) {
	}

	clear () {

		this.lines.clear();

		this.arrows.clear();

		this.highlightedLanes.clear();

		this.selectedLanes.clear();

	}

	selectLane ( lane: TvLane ) {

		if ( this.selectedLanes.has( lane ) ) return;

		this.removeHighlight();

		this.showLaneBorders( lane, LINE_WIDTH * 2, COLOR.RED );

		this.showLaneDirection( lane );

		this.selectedLanes.add( lane );

	}

	unselectLane ( lane: TvLane ) {

		if ( !this.selectedLanes.has( lane ) ) return;

		this.lines.removeKey( lane );

		this.arrows.removeKey( lane );

		this.selectedLanes.delete( lane );

	}

	higlightLane ( lane: TvLane ) {

		if ( this.selectedLanes.has( lane ) ) return;

		if ( this.highlightedLanes.has( lane ) ) return;

		this.lines.removeKey( lane );

		this.showLaneBorders( lane, LINE_WIDTH * 2 );

		this.showLaneDirection( lane );

		this.highlightedLanes.add( lane );

	}

	removeHighlight () {

		this.highlightedLanes.forEach( lane => {

			if ( this.selectedLanes.has( lane ) ) return;

			this.lines.removeKey( lane );

			this.arrows.removeKey( lane );

		} )

		this.highlightedLanes.clear();

	}

	showLaneBorders ( lane: TvLane, lineWidth = LINE_WIDTH, color = COLOR.CYAN ) {

		const add = ( lane: TvLane, side: TvLaneSide ) => {

			const points = this.debugService.getDirectedPoints( lane, side, LINE_STEP ).map( point => point.position );

			const line = this.debugService.createDebugLine( lane, points, lineWidth, color );

			this.lines.addItem( lane, line );

		}

		add( lane, TvLaneSide.LEFT );
		add( lane, TvLaneSide.RIGHT );

	}

	showRoadLaneLines ( road: TvRoad, stepSize = 1.0, zOffset = 0.0, width = 2 ) {

		// const lines = this.createRoadLaneLines( road, stepSize, zOffset, width );

		// lines.forEach( line => {

		// 	this.lines.addItem( road, line );

		// } );

	}

	hideRoadLaneLines ( road: TvRoad ) {

		// this.lines.removeKey( road );

	}

	showLaneDirection ( lane: TvLane ) {

		if ( lane.direction == TravelDirection.undirected ) return;

		const addArrow = ( position: Vector3, hdg: number ) => {

			const arrow = this.debugService.createSharpArrow( position, hdg, ARROW_COLOR, ARROW_SIZE );

			this.arrows.addItem( lane, arrow );

		}

		const points = this.debugService.getDirectedPoints( lane, TvLaneSide.CENTER, ARROW_STEP );

		for ( let i = 0; i < points.length; i++ ) {

			const point = points[ i ];

			addArrow( point.position, point.hdg );

			if ( lane.direction != TravelDirection.bidirectional ) continue;

			// for direction we add arrows in both direction
			addArrow( point.position, point.hdg + Math.PI );

		}

	}

	getPoints ( lane: TvLane, sStart: number, sEnd: number, stepSize = 1.0 ) {

		return this.debugService.getPoints( lane, sStart, sEnd, stepSize );

	}

}
