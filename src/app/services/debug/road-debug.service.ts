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

const LINE_WIDTH = 1.5;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.5;
const ARROW_STEP = 5;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class RoadDebugService {

	private lines = new Object3DArrayMap<TvRoad, DebugLine<TvRoad>[]>();

	private arrows = new Object3DArrayMap<TvRoad, Object3D[]>();

	private highlightedRoads = new Set<TvRoad>();

	private selectedRoads = new Set<TvRoad>();

	constructor (
		private debugService: DebugDrawService,
		private laneReferenceLineService: LaneDebugService,
		private mapService: MapService,
	) {
	}

	showRoadReferenceLine ( road: TvRoad ) {

		const points = road.getReferenceLinePoints( LINE_STEP ).map( point => point.position );

		points.forEach( point => point.z += LINE_ZOFFSET );

		const line = this.debugService.createDebugLine( road, points, LINE_WIDTH );

		this.lines.addItem( road, line );

	}

	showRoadBorderLine ( road: TvRoad, lineWidth = LINE_WIDTH, color = COLOR.CYAN ) {

		const add = ( lane: TvLane ) => {

			const points = this.laneReferenceLineService.getPoints( lane, 0, lane.laneSection.length, LINE_STEP );

			const line = this.debugService.createDebugLine( road, points, lineWidth, color );

			this.lines.addItem( road, line );
		}

		road.laneSections?.forEach( laneSection => {

			add( laneSection.getRightMostLane() );

			add( laneSection.getLeftMostLane() );

		} )

	}

	highlightRoad ( road: TvRoad ) {

		if ( this.selectedRoads.has( road ) ) return;

		if ( this.highlightedRoads.has( road ) ) return;

		this.lines.removeKey( road );

		this.showRoadBorderLine( road, LINE_WIDTH * 2 );

		this.showRoadDirectionArrows( road );

		this.highlightedRoads.add( road );

	}

	selectRoad ( road: TvRoad ) {

		if ( this.selectedRoads.has( road ) ) return;

		this.lines.removeKey( road );

		this.showRoadBorderLine( road, LINE_WIDTH * 3, COLOR.RED );

		this.showRoadDirectionArrows( road );

		this.selectedRoads.add( road );

	}

	removeHighlight () {

		this.highlightedRoads.forEach( road => {

			if ( this.selectedRoads.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

			this.showRoadBorderLine( road );

		} )

		this.highlightedRoads.clear();

	}

	clearLines () {

		this.highlightedRoads.forEach( road => {

			if ( this.selectedRoads.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

		} )

		this.highlightedRoads.clear();

	}

	unselectRoad ( road: TvRoad ) {

		this.lines.removeKey( road );

		this.arrows.removeKey( road );

		this.showRoadBorderLine( road );

		this.selectedRoads.delete( road );

	}

	upateRoadBorderLine ( road: TvRoad, lineWidth = LINE_WIDTH ) {

		this.lines.removeKey( road );

		this.showRoadBorderLine( road, lineWidth );

		this.updatePredecessor( road, predecessor => {

			this.lines.removeKey( predecessor );

			this.showRoadBorderLine( predecessor );

		} );

		this.updateSuccessor( road, successor => {

			this.lines.removeKey( successor );

			this.showRoadBorderLine( successor );

		} );

	}

	showRoadDirectionArrows ( road: TvRoad ) {

		this.getReferenceLinePoints( road, ARROW_STEP ).forEach( point => {

			const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

			this.arrows.addItem( road, arrow );

		} );

	}

	updateRoadDirectionArrows ( road: TvRoad ) {

		this.arrows.removeKey( road );

		this.showRoadDirectionArrows( road );

		this.updatePredecessor( road, predecessor => {

			this.arrows.removeKey( predecessor );

			this.showRoadDirectionArrows( predecessor );

		} );

		this.updateSuccessor( road, successor => {

			this.arrows.removeKey( successor );

			this.showRoadDirectionArrows( successor );

		} );

	}

	getReferenceLinePoints ( road: TvRoad, step = 1.0 ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		for ( let s = step * 0.5; s < road.length; s += step ) {

			points.push( road.getRoadCoordAt( s ) );

		}

		return points;
	}

	clear () {

		this.lines.clear();

		this.arrows.clear();

	}

	private updatePredecessor ( road: TvRoad, callback: ( road: TvRoad ) => void ): void {

		if ( road.predecessor?.elementType === TvRoadLinkChildType.road ) {

			const predecessor = this.mapService.map.getRoadById( road.predecessor.elementId );

			callback( predecessor );

		}

	}

	private updateSuccessor ( road: TvRoad, callback: ( road: TvRoad ) => void ): void {

		if ( road.successor?.elementType === TvRoadLinkChildType.road ) {

			const successor = this.mapService.map.getRoadById( road.successor.elementId );

			callback( successor );

		}

	}

}
