/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugger } from 'app/core/interfaces/base-debugger';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LaneWidthNode } from 'app/modules/lane-width/objects/lane-width-node';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { DebugState } from 'app/services/debug/debug-state';
import { Object3DArrayMap } from "../../../core/models/object3d-array-map";
import { DebugLine } from 'app/objects/debug-line';
import { RoadDebugService } from "../../../services/debug/road-debug.service";
import { Object3D } from 'three';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { LaneDistance, RoadDistance } from 'app/map/road/road-distance';

@Injectable()
export class LaneWidthToolDebugger extends BaseDebugger<TvRoad> {

	private items = new Object3DArrayMap<TvRoad, Object3D[]>();

	private nodes = new Object3DArrayMap<TvRoad, LaneWidthNode[]>();

	private nodeCache = new Map<TvLaneWidth, LaneWidthNode>();

	private spanCache = new Map<TvLaneWidth, DebugLine<any>>();

	constructor (
		private roadDebugger: RoadDebugService,
		private debugService: DebugDrawService,
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

		this.showRoad( road );

	}

	onUnselected ( road: TvRoad ): void {

		this.items.removeKey( road );
		this.nodes.removeKey( road );

	}

	onDefault ( road: TvRoad ): void {

		this.items.removeKey( road );
		this.nodes.removeKey( road );

	}

	onRemoved ( road: TvRoad ): void {

		this.items.removeKey( road );
		this.nodes.removeKey( road );

	}

	showRoad ( road: TvRoad ): void {

		road.laneSections.forEach( section => {

			section.lanesMap.forEach( lane => {

				this.showLane( road, section, lane );

			} );

		} );

	}

	showLane ( road: TvRoad, section: TvLaneSection, lane: TvLane ): void {

		lane.getWidthArray().forEach( width => {

			const node = this.createNode( road, section, lane, width );

			const spanLine = this.createSpanLine( road, section, lane, node );

			this.nodes.addItem( road, node );

			this.items.addItem( road, spanLine );

		} );

	}

	hideRoad ( road: TvRoad ): void {

		this.items.removeKey( road );
		this.nodes.removeKey( road );

	}

	addNode ( node: LaneWidthNode ): void {

		this.nodes.addItem( node.road, node );

	}

	removeNode ( node: LaneWidthNode ): void {

		this.nodes.removeItem( node.road, node );

	}

	createNode ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, width: TvLaneWidth ): LaneWidthNode {

		let node: LaneWidthNode;

		if ( this.nodeCache.has( width ) ) {

			node = this.nodeCache.get( width );

			const distance = laneSection.s + node.laneWidth.s as RoadDistance;

			const start = road.getLaneStartPosition( lane, distance );

			const end = road.getLaneEndPosition( lane, distance );

			const positions = [ start.position, end.position ];

			this.debugService.updateDebugLine( node.line, positions );

			node.point.setPosition( end.position );

		} else {

			const coord = new TvLaneCoord( road, laneSection, lane, width.s as LaneDistance, 0 );

			node = LaneWidthNode.create( coord, width );

			this.nodeCache.set( width, node );

		}

		return node;

	}

	createSpanLine ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, node: LaneWidthNode ) {

		const i = lane.getWidthArray().indexOf( node.laneWidth );

		const next = lane.getWidthArray()[ i + 1 ];

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

		this.nodes.clear();

		super.clear();

	}
}
