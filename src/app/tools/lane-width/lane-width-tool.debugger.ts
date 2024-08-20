/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugger } from 'app/core/interfaces/base-debugger';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LaneWidthNode } from 'app/objects/lane-width-node';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { DebugState } from 'app/services/debug/debug-state';
import { RoadService } from 'app/services/road/road.service';
import { ControlPointFactory } from "../../factories/control-point.factory";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { DebugLine } from 'app/objects/debug-line';
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { Object3D } from 'three';
import { RoadGeometryService } from 'app/services/road/road-geometry.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthToolDebugger extends BaseDebugger<TvRoad> {

	private items = new Object3DArrayMap<TvRoad, Object3D[]>();

	private nodeCache = new Map<TvLaneWidth, LaneWidthNode>();

	private spanCache = new Map<TvLaneWidth, DebugLine<any>>();

	constructor (
		private roadDebugger: RoadDebugService,
		private roadService: RoadService,
		private debugService: DebugDrawService,
		private pointFactory: ControlPointFactory,
	) {
		super();
	}

	setDebugState ( road: TvRoad, state: DebugState ): void {

		this.setBaseState( road, state );

	}

	onHighlight ( road: TvRoad ): void {

		if ( this.selected.has( road ) ) {
			this.roadDebugger.removeRoadBorderLine( road );
			return;
		}

		this.roadDebugger.showRoadBorderLine( road );

	}

	onUnhighlight ( road: TvRoad ): void {

		if ( this.selected.has( road ) ) return;

		this.roadDebugger.removeRoadBorderLine( road );

	}

	onSelected ( road: TvRoad ): void {

		this.showNodes( road );

	}

	onUnselected ( road: TvRoad ): void {

		this.items.removeKey( road );

	}

	onDefault ( road: TvRoad ): void {

		this.items.removeKey( road );

	}

	onRemoved ( road: TvRoad ): void {

		this.items.removeKey( road );

	}

	showNodes ( road: TvRoad ) {

		road.laneSections.forEach( section => {

			section.lanesMap.forEach( lane => {

				lane.width.forEach( width => {

					const node = this.createNode( road, section, lane, width );

					const spanLine = this.createSpanLine( road, section, lane, node );

					this.items.addItem( road, node );

					this.items.addItem( road, spanLine );

				} );

			} );

		} );

	}

	createNode ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, width: TvLaneWidth ): LaneWidthNode {

		let node: LaneWidthNode;

		if ( this.nodeCache.has( width ) ) {

			node = this.nodeCache.get( width );

			const start = RoadGeometryService.instance.findLaneStartPosition( road, laneSection, lane, node.laneWidth.s );

			const end = RoadGeometryService.instance.findLaneEndPosition( road, laneSection, lane, node.laneWidth.s );

			const positions = [ start.position, end.position ];

			this.debugService.updateDebugLine( node.line, positions );

			node.point.copyPosition( end.position );

		} else {

			node = new LaneWidthNode( width, lane );

			const line = node.line = this.createNodeLine( road, laneSection, lane, node );

			const point = node.point = this.createPointHead( road, laneSection, lane, node );

			node.add( line, point );

			this.nodeCache.set( width, node );

		}

		return node;

	}

	createPointHead ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, node: LaneWidthNode ) {

		const end = RoadGeometryService.instance.findLaneEndPosition( road, laneSection, lane, node.laneWidth.s );

		const point = this.pointFactory.createSimpleControlPoint( node, end.position );

		point.tag = LaneWidthNode.pointTag;

		node.add( point );

		return point;

	}

	createNodeLine ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, node: LaneWidthNode ) {

		const start = RoadGeometryService.instance.findLaneStartPosition( road, laneSection, lane, node.laneWidth.s );

		const end = RoadGeometryService.instance.findLaneEndPosition( road, laneSection, lane, node.laneWidth.s );

		const positions = [ start.position, end.position ];

		const line = this.debugService.createDebugLine( node, positions );

		line.tag = LaneWidthNode.lineTag;

		return line;

	}

	createSpanLine ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, node: LaneWidthNode ) {

		const i = lane.width.indexOf( node.laneWidth );

		const next = lane.width[ i + 1 ];

		const sStart = node.laneWidth.s;

		// get s of next lane width node
		const sEnd = next?.s || laneSection.getLength();

		const points = this.debugService.getPositions( road, laneSection, lane, sStart, sEnd, 0.1 ).map( point => point.position );

		let line: DebugLine<any>;

		if ( this.spanCache.has( node.laneWidth ) ) {

			line = this.spanCache.get( node.laneWidth );

			this.debugService.updateDebugLine( line, points );

		} else {

			line = this.debugService.createDebugLine( node, points );

			this.spanCache.set( node.laneWidth, line );

		}

		return line;

	}

	clear (): void {

		this.items.clear();

		super.clear();

	}
}
