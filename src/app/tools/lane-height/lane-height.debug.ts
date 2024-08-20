/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseLaneDebugService } from 'app/core/interfaces/lane-node.debug';
import { TvLane } from "app/map/models/tv-lane";
import { DebugState } from "app/services/debug/debug-state";
import { TvLaneHeight } from "../../map/lane-height/lane-height.model";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { COLOR } from "app/views/shared/utils/colors.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { Object3DArrayMap } from "app/core/models/object3d-array-map";
import { Object3D } from "three";
import { DebugLine } from "app/objects/debug-line";
import { LaneSpanNode } from "app/objects/lane-node";
import { RoadDebugService } from "../../services/debug/road-debug.service";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightDebugService extends BaseLaneDebugService<TvLaneHeight> {

	private highlightedRoads = new Set<TvRoad>();
	private selectedRoads = new Set<TvRoad>();

	protected override lines = new Object3DArrayMap<TvLane, Object3D[]>();
	protected override nodes = new Object3DArrayMap<TvLane, Object3D[]>();

	private lineCache = new Map<TvLaneHeight, DebugLine<any>>();
	private nodeCache = new Map<TvLaneHeight, LaneSpanNode<any>>();

	constructor ( private roadDebugger: RoadDebugService ) {

		super();

	}

	setDebugState ( lane: TvLane, state: DebugState ): void {

		this.setBaseState( lane, state );

	}

	onHighlight ( lane: TvLane ): void {

		if ( this.highlightedRoads.has( lane.laneSection.road ) ) return;

		this.roadDebugger.showRoadBorderLine( lane.laneSection.road );

		this.highlightedRoads.add( lane.laneSection.road );

	}

	onUnhighlight ( lane: TvLane ): void {

		if ( this.selectedRoads.has( lane.laneSection.road ) ) return;

		this.roadDebugger.removeRoadBorderLine( lane.laneSection.road );

		this.highlightedRoads.delete( lane.laneSection.road );

	}

	onSelected ( lane: TvLane ): void {

		lane.laneSection.lanesMap.forEach( item => {

			this.showHeightNodes( item );

			this.showSpanLines( item );

		} )

		this.selectedRoads.add( lane.laneSection.road );
	}

	onUnselected ( lane: TvLane ): void {

		lane.laneSection.lanesMap.forEach( item => {

			this.nodes.removeKey( item );

			this.lines.removeKey( item );

		} )

		this.selectedRoads.delete( lane.laneSection.road );
	}

	onDefault ( lane: TvLane ): void {

		//

	}

	onRemoved ( lane: TvLane ): void {

		lane.laneSection.lanesMap.forEach( item => {

			this.nodes.removeKey( item );

			this.lines.removeKey( item );

		} )

		this.selectedRoads.delete( lane.laneSection.road );

		this.highlightedRoads.delete( lane.laneSection.road );
	}

	clear (): void {

		this.lines.clear();

		this.nodes.clear();

		this.highlighted.clear();

		this.selectedRoads.clear();

		this.roadDebugger.clear();

		super.clear();

	}

	private showHeightNodes ( lane: TvLane ) {

		this.nodes.removeKey( lane );

		for ( let i = 0; i < lane.height.length; i++ ) {

			const height = lane.height[ i ];

			const node = this.createHeightNode( lane, height );

			this.nodes.addItem( lane, node );

		}

	}

	createHeightNode ( lane: TvLane, height: TvLaneHeight ) {

		const laneCoord = new TvLaneCoord( lane.laneSection.road, lane.laneSection, lane, height.s, 0 );

		if ( this.nodeCache.has( height ) ) {

			const node = this.nodeCache.get( height );

			this.debugDrawService.updateLaneWidthLine( node, laneCoord );

			return node;

		}

		const node = this.debugDrawService.createLaneWidthLine( height, laneCoord, COLOR.CYAN, 8 );

		this.nodeCache.set( height, node );

		return node;
	}

	private showSpanLines ( lane: TvLane ) {

		this.lines.removeKey( lane );

		for ( let i = 0; i < lane.height.length; i++ ) {

			const height = lane.height[ i ];

			const sStart = height.sOffset + lane.laneSection.s;

			const next = lane.height[ i + 1 ];

			const sEnd = ( next?.sOffset || lane.laneSection.getLength() ) + lane.laneSection.s;

			let line: DebugLine<any>;

			if ( this.lineCache.has( height ) ) {

				line = this.lineCache.get( height );

				const points = this.debugDrawService.getPoints( lane, sStart, sEnd, 0.1 );

				this.debugDrawService.updateDebugLine( line, points );

			} else {

				line = this.createLine( height, lane, sStart, sEnd );

			}

			this.lines.addItem( lane, line );

			this.lineCache.set( height, line );

		}

		if ( lane.height.length == 0 ) {

			const sStart = lane.laneSection.s;

			const sEnd = lane.laneSection.s + lane.laneSection.getLength();

			const line = this.createDashedLine( lane, lane, sStart, sEnd );

			this.lines.addItem( lane, line );
		}

	}

}
