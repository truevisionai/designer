/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Object3DMap } from "app/core/models/object3d-map";
import { DebugLine } from "app/objects/debug-line";
import { LaneMarkingNode } from "app/objects/lane-road-mark-node";
import { TvRoad } from "app/map/models/tv-road.model";
import { BaseDebugger } from "app/core/interfaces/base-debugger";
import { DebugState } from "app/services/debug/debug-state";
import { RoadDebugService } from "app/services/debug/road-debug.service";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneRoadMark } from "app/map/models/tv-lane-road-mark";
import { RoadService } from "app/services/road/road.service";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { RoadGeometryService } from "app/services/road/road-geometry.service";

@Injectable( {
	providedIn: 'root'
} )
export class LaneMarkingToolDebugger extends BaseDebugger<TvRoad> {

	private nodes: Object3DMap<string, LaneMarkingNode> = new Object3DMap();

	private spanLines: Object3DMap<string, DebugLine<LaneMarkingNode>> = new Object3DMap();

	private nodesCache = new Map<TvLaneRoadMark, LaneMarkingNode>();

	private spanLinesCache = new Map<TvLaneRoadMark, DebugLine<LaneMarkingNode>>();

	constructor (
		private debugService: DebugDrawService,
		private roadDebugger: RoadDebugService,
		private roadService: RoadService
	) {

		super();

	}

	setDebugState ( road: TvRoad, state: DebugState ): void {

		this.setBaseState( road, state );

	}

	onHighlight ( road: TvRoad ): void {

		if ( this.selected.has( road ) ) return;

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

		this.hideRoad( road );

	}

	onDefault ( road: TvRoad ): void {

		//

	}

	onRemoved ( road: TvRoad ): void {

		this.hideRoad( road );

	}

	showRoad ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanesMap.forEach( lane => {

				lane.roadMarks.forEach( roadMark => {

					const node = this.createNode( road, laneSection, lane, roadMark );

					const line = this.createSpanLine( road, laneSection, lane, roadMark, node );

					this.spanLines.add( roadMark.uuid, line );

					this.nodes.add( roadMark.uuid, node );

				} );

			} );

		} );
	}

	hideRoad ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanesMap.forEach( lane => {

				lane.roadMarks.forEach( roadMark => {

					this.nodes.remove( roadMark.uuid );

					this.spanLines.remove( roadMark.uuid );

				} );

			} )

		} );

		this.spanLines.clear();

		this.nodes.clear();

	}

	createNode ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, roadmark: TvLaneRoadMark ) {

		let node: LaneMarkingNode;

		if ( this.nodesCache.has( roadmark ) ) {

			node = this.nodesCache.get( roadmark );

		} else {

			node = new LaneMarkingNode( lane, roadmark );

			this.nodesCache.set( roadmark, node );

		}

		const lanePosition = RoadGeometryService.instance.findLaneEndPosition( road, laneSection, lane, roadmark.sOffset );

		node.position.copy( lanePosition.toVector3() );

		return node;
	}

	createSpanLine ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, roadmark: TvLaneRoadMark, node: LaneMarkingNode ) {

		const nextRoadMark = lane.roadMarks.getNext( roadmark );

		const sStart = roadmark.s;

		const sEnd = nextRoadMark?.s || laneSection.getLength();

		const positions = this.debugService.getPositions( road, laneSection, lane, sStart, sEnd, 0.1 ).map( pos => pos.toVector3() );

		if ( this.spanLinesCache.has( roadmark ) ) {

			const line = this.spanLinesCache.get( roadmark );

			this.debugService.updateDebugLine( line, positions );

			return line;

		}

		this.spanLinesCache.set( roadmark, this.debugService.createDashedLine( node, positions ) );

		return this.debugService.createDashedLine( node, positions );

	}

	clear () {

		super.clear();

		this.spanLines.clear();

		this.nodes.clear();

		this.roadDebugger.clear();

	}

}
