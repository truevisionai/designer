/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Object3D } from "three";
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { TvLane } from 'app/map/models/tv-lane';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { DebugLine } from '../../objects/debug-line';
import { MapService } from '../map/map.service';
import { DynamicControlPoint } from "../../objects/dynamic-control-point";
import { RoadNode } from 'app/objects/road/road-node';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';
import { RoadWidthService } from '../road/road-width.service';
import { RoadGeometryService } from '../road/road-geometry.service';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';

const LINE_WIDTH = 2.0;
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

	private laneLines = new Object3DArrayMap<TvRoad, DebugLine<TvRoad>[]>();

	private nodes = new Object3DArrayMap<number, RoadNode[]>();

	private arrows = new Object3DArrayMap<TvRoad, Object3D[]>();

	private highlightedRoads = new Set<TvRoad>();

	private selectedRoads = new Set<TvRoad>();

	private roadGeometryService: RoadGeometryService;

	constructor (
		private debugService: DebugDrawService,
		private mapService: MapService,
	) {
		this.roadGeometryService = RoadGeometryService.instance;
	}

	showNodes (): void {

		this.mapService.nonJunctionRoads.forEach( road => {

			this.showRoadNodes( road );

		} );

	}

	hideNodes (): void {

		this.nodes.clear();

	}

	showRoadNodes ( road: TvRoad ): void {

		const startNode = this.createRoadNode( road, road, 0, 6, COLOR.MAGENTA );
		const endNode = this.createRoadNode( road, road, road.length, 6, COLOR.MAGENTA );
		// const startNode = new RoadNode( road, TvContactPoint.START );
		// const endNode = new RoadNode( road, TvContactPoint.END );

		this.nodes.addItem( road.id, startNode );
		this.nodes.addItem( road.id, endNode );
	}

	upateRoadNodes ( road: TvRoad ): void {

		this.removeRoadNodes( road );
		this.showRoadNodes( road );

	}

	removeRoadNodes ( road: TvRoad ): void {

		this.nodes.removeKey( road.id );

	}

	showRoadBorderLine ( road: TvRoad, lineWidth = LINE_WIDTH, color = COLOR.CYAN ): void {

		const add = ( lane: TvLane ) => {

			const points = this.debugService.getPositions( road, lane.laneSection, lane, 0, lane.laneSection.getLength(), LINE_STEP );

			const positions = points.map( point => point.position );

			const line = this.debugService.createDebugLine( road, positions, lineWidth, color );

			this.lines.addItem( road, line );
		}

		road.laneSections?.forEach( laneSection => {

			add( laneSection.getRightMostLane() );

			add( laneSection.getLeftMostLane() );

		} )

	}

	removeRoadBorderLine ( road: TvRoad ): void {

		this.lines.removeKey( road );

	}

	highlightRoad ( road: TvRoad, arrows = true ): void {

		if ( this.selectedRoads.has( road ) ) return;

		if ( this.highlightedRoads.has( road ) ) return;

		this.lines.removeKey( road );

		this.showRoadBorderLine( road, LINE_WIDTH * 2 );

		if ( arrows ) this.showRoadDirectionArrows( road );

		this.highlightedRoads.add( road );

	}

	removeHighlight (): void {

		this.highlightedRoads.forEach( road => {

			this.unHighlightRoad( road );

		} )

		this.highlightedRoads.clear();

	}

	unHighlightRoad ( road: TvRoad ): void {

		if ( this.selectedRoads.has( road ) ) return;

		this.lines.removeKey( road );

		this.arrows.removeKey( road );

		this.showRoadBorderLine( road );

		this.highlightedRoads.delete( road );

	}

	clearLines (): void {

		this.highlightedRoads.forEach( road => {

			if ( this.selectedRoads.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

		} )

		this.highlightedRoads.clear();

	}

	showRoadDirectionArrows ( road: TvRoad ): void {

		this.getReferenceLinePoints( road, ARROW_STEP ).forEach( point => {

			const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

			this.arrows.addItem( road, arrow );

		} );

	}

	getReferenceLinePoints ( road: TvRoad, step = 1.0 ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		for ( let s = step * 0.5; s < road.length; s += step ) {

			points.push( road.getPosThetaAt( s ) );

		}

		return points;
	}

	createRoadNode<T> ( road: TvRoad, target: T, s: number, width = 2, color = COLOR.CYAN ): DebugLine<T> {

		const result = RoadWidthService.instance.findRoadWidthAt( road, s );

		const start = road.getPosThetaAt( s, result.leftSideWidth );
		const end = road.getPosThetaAt( s, -result.rightSideWidth );

		return this.debugService.createDebugLine<T>( target, [ start.position, end.position ], width, color );

	}

	showLaneReferenceLines ( road: TvRoad, color = COLOR.CYAN ): void {

		road.laneSections.forEach( section => {

			section.lanesMap.forEach( lane => {

				lane.width.forEach( width => {

					const referenceLine = this.createLaneReferenceLine( road, section, lane, width );

					this.laneLines.addItem( road, referenceLine );

				} );

			} );

		} );

	}

	removeLaneReferenceLines ( road: TvRoad ): void {

		this.laneLines.removeKey( road );

	}

	createLaneReferenceLine ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, node: TvLaneWidth ): DebugLine<TvLane> {

		const i = lane.width.indexOf( node );

		const next = lane.width[ i + 1 ];

		const sStart = node.s;

		// get s of next lane width node
		const sEnd = next?.s || laneSection.getLength();

		const points = this.debugService.getPositions( road, laneSection, lane, sStart, sEnd, 0.1 ).map( point => point.position );

		return this.debugService.createDebugLine( lane, points );

	}

	createRoadWidthLine ( roadCoord: TvRoadCoord ): Line2 {

		return this.createRoadWidthLinev2( roadCoord.road, roadCoord.s );

	}

	createRoadWidthLinev2<T> ( road: TvRoad, s: number, target?: T, width = 2 ): DebugLine<T> {

		const result = RoadWidthService.instance.findRoadWidthAt( road, s );

		const start = this.roadGeometryService.findRoadPosition( road, s, result.leftSideWidth );

		const end = this.roadGeometryService.findRoadPosition( road, s, -result.rightSideWidth );

		return this.debugService.createDebugLine( target, [ start.position, end.position ], width );

	}

	updateRoadWidthLine ( line: Line2, roadCoord: TvRoadCoord ): Line2 {

		const result = RoadWidthService.instance.findRoadWidthAt( roadCoord.road, roadCoord.s );

		const start = this.roadGeometryService.findRoadPosition( roadCoord.road, roadCoord.s, result.leftSideWidth );

		const end = this.roadGeometryService.findRoadPosition( roadCoord.road, roadCoord.s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z,
			end.x, end.y, end.z
		] );

		line.geometry.dispose();

		line.geometry = lineGeometry;

		return line;
	}

	updateRoadWidthLinev2 ( line: Line2, road: TvRoad, s: number ): Line2 {

		const result = RoadWidthService.instance.findRoadWidthAt( road, s );

		const start = this.roadGeometryService.findRoadPosition( road, s, result.leftSideWidth );

		const end = this.roadGeometryService.findRoadPosition( road, s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z,
			end.x, end.y, end.z
		] );

		line.geometry.dispose();

		line.geometry = lineGeometry;

		return line;
	}

	clear (): void {

		this.lines.clear();

		this.arrows.clear();

		this.removeHighlight();

		this.selectedRoads.clear();

		this.nodes.clear();

	}

}
