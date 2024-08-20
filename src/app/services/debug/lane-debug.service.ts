/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TravelDirection, TvLaneLocation, TvLaneSide } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { DebugDrawService } from './debug-draw.service';
import { DebugLine } from '../../objects/debug-line';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { BufferGeometry, Material, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LanePositionService } from '../lane/lane-position.service';
import { TvLaneProfile } from 'app/map/models/tv-lane-profile';


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

	private outlines = new Object3DArrayMap<TvLane, Object3D[]>();

	private overlays = new Object3DArrayMap<TvLane, Object3D[]>();

	private highlightedLanes = new Set<TvLane>();

	private selectedLanes = new Set<TvLane>();

	constructor (
		private debugService: DebugDrawService
	) {
	}

	clear (): void {

		this.lines.clear();

		this.arrows.clear();

		this.highlightedLanes.clear();

		this.selectedLanes.clear();

		this.outlines.clear();

		this.overlays.clear();

	}

	showLaneOutlines ( laneProfile: TvLaneProfile, width = LINE_WIDTH, color = COLOR.CYAN ): void {

		laneProfile.getLanes().forEach( lane => {

			this.showLaneOutline( lane, width, color );

		} );

	}

	showLaneOutline ( lane: TvLane, width = LINE_WIDTH, color = COLOR.CYAN ): void {

		if ( lane.id == 0 ) return;

		if ( !lane.gameObject ) return;

		const outline = this.debugService.createOutlineFromGeometry( lane.gameObject.geometry, width, color );

		this.outlines.addItem( lane, outline );

	}

	removeLaneOutlines ( laneProfile: TvLaneProfile ): void {

		this.outlines.forEachKey( ( lane ) => {

			if ( lane.laneSection.road == laneProfile.getRoad() ) {

				this.removeLaneOutline( lane );

			}

		} );

	}

	removeLaneOutline ( lane: TvLane ): void {

		this.outlines.removeKey( lane );

	}

	showLaneOverlays ( laneProfile: TvLaneProfile, color = COLOR.CYAN ): void {

		laneProfile.getLanes().forEach( lane => {

			this.showLaneOverlay( lane, color );

		} );

	}

	showLaneOverlay ( lane: TvLane, color: number ): void {

		if ( lane.id == 0 ) return;

		if ( !lane.gameObject ) return;

		const geometry = lane.gameObject.geometry?.clone();

		const material = new MeshBasicMaterial( {
			color: color,
			transparent: true,
			opacity: 0.1,
		} );

		const overlay = new LaneOverlay( lane, geometry, material );

		this.overlays.addItem( lane, overlay );

	}

	removeLaneOverlays ( laneProfile: TvLaneProfile ): void {

		this.overlays.forEachKey( ( lane ) => {

			if ( lane.laneSection.road == laneProfile.getRoad() ) {

				this.removeLaneOverlay( lane );

			}

		} );

	}

	removeLaneOverlay ( lane: TvLane ): void {

		this.overlays.removeKey( lane );

	}

	showLaneBorders ( lane: TvLane, lineWidth = LINE_WIDTH, color = COLOR.CYAN ): void {

		const add = ( lane: TvLane, side: TvLaneSide ) => {

			const road = lane.laneSection.road;

			const laneSection = lane.laneSection;

			const points = this.debugService.getDirectedPoints( road, laneSection, lane, side, LINE_STEP ).map( point => point.position );

			const line = this.debugService.createDebugLine( lane, points, lineWidth, color );

			this.lines.addItem( lane, line );

		}

		add( lane, TvLaneSide.LEFT );
		add( lane, TvLaneSide.RIGHT );

	}

	showDirectionalArrows ( lane: TvLane, color: number = ARROW_COLOR, size: number = ARROW_SIZE ): void {

		if ( lane.direction == TravelDirection.undirected ) return;

		const addArrow = ( position: Vector3, hdg: number ) => {

			const arrow = this.debugService.createSharpArrow( position, hdg, color, size );

			this.arrows.addItem( lane, arrow );

		}

		const road = lane.laneSection.road;

		const laneSection = lane.laneSection;

		const points = this.debugService.getDirectedPoints( road, laneSection, lane, TvLaneSide.CENTER, ARROW_STEP );

		// skip first
		for ( let i = 1; i < points.length; i++ ) {

			const point = points[ i ];

			addArrow( point.position, point.hdg );

			if ( lane.direction != TravelDirection.bidirectional ) continue;

			// for direction we add arrows in both direction
			addArrow( point.position, point.hdg + Math.PI );

		}

	}

	removeDirectionalArrows ( lane: TvLane ): void {

		this.arrows.removeKey( lane );

	}

	createLaneReferenceLine ( lane: TvLane, location: TvLaneLocation, color = 0xffffff ): Line2 {

		const points = LanePositionService.instance.getPoints( lane.laneSection.road, lane.laneSection, lane, location );

		const positions = points.map( ( point ) => point.toVector3() );

		return this.debugService.createLine( positions, color );
	}

	updateLaneReferenceLine ( line: Line2, laneCoord: TvLaneCoord, location: TvLaneLocation ): Line2 {

		const points = LanePositionService.instance.getCoordPoints( laneCoord, location );

		const positions = points.map( ( point ) => point.toVector3() );

		const geometry = new LineGeometry();

		const positionsArray = [];

		positions.forEach( ( position ) => {
			positionsArray.push( position.x, position.y, position.z );
		} );

		geometry.setPositions( positionsArray );

		line.geometry.dispose();

		line.geometry = geometry;

		return line;

	}

}

export class LaneOverlay extends Mesh {

	public tag = 'lane-overlay';

	constructor ( public lane: TvLane, geometry: BufferGeometry, material: Material ) {

		super( geometry, material );

		this.userData.lane = lane;

	}

}
