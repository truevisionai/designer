/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLaneCoord } from "../../map/models/tv-lane-coord";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { DebugState } from "../../services/debug/debug-state";
import { TvLane } from "../../map/models/tv-lane";
import { Material, MeshBasicMaterial } from "three";
import { LaneDebugService } from "../../services/debug/lane-debug.service";
import { ColorUtils } from "../../views/shared/utils/colors.service";
import { RoadToolDebugger } from "../road/road-tool.debugger";
import { JunctionUtils } from "app/utils/junction.utils";

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionsDebugger extends BaseDebugger<TvLaneCoord> {

	highlightedLanes = new Map<TvLane, Material | Material[]>();

	constructor (
		private laneDebugService: LaneDebugService,
		public roadToolDebugger: RoadToolDebugger,
	) {

		super();
	}

	setDebugState ( coord: TvLaneCoord, state: DebugState ): void {

		this.setBaseState( coord, state );

	}

	onHighlight ( coord: TvLaneCoord ): void {

		const highlight = ( lane: TvLane, color: number ) => {

			const material = lane.gameObject.material;

			lane.gameObject.material = new MeshBasicMaterial( { color: color } );

			this.highlightedLanes.set( lane, material );

			this.laneDebugService.showDirectionalArrows( lane, ColorUtils.WHITE );

		}

		if ( this.highlightedLanes.has( coord.lane ) ) return;

		highlight( coord.lane, ColorUtils.MBLUE );

		const successors = JunctionUtils.findSuccessors( coord.road, coord.lane, coord.road.successor );
		successors.forEach( lane => highlight( lane, ColorUtils.MGREEN ) );

		const predecessors = JunctionUtils.findPredecessors( coord.road, coord.lane, coord.road.predecessor );
		predecessors.forEach( lane => highlight( lane, ColorUtils.MRED ) );

	}

	onUnhighlight ( coord: TvLaneCoord ): void {

	}

	onSelected ( coord: TvLaneCoord ): void {

		//

	}

	onUnselected ( coord: TvLaneCoord ): void {

		//

	}

	onDefault ( coord: TvLaneCoord ): void {

		//

	}

	onRemoved ( coord: TvLaneCoord ): void {

		//

	}

	resetHighlighted (): void {

		this.highlightedLanes.forEach( ( material, lane ) => {

			lane.gameObject.material = material;

			this.highlightedLanes.delete( lane );

			this.laneDebugService.removeDirectionalArrows( lane );

		} );

	}

	clear (): void {

		super.clear();

		this.resetHighlighted();

		this.roadToolDebugger.clear();

	}

}
