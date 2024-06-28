/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLaneCoord } from "../../map/models/tv-lane-coord";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { DebugState } from "../../services/debug/debug-state";
import { TvLane } from "../../map/models/tv-lane";
import { Material, MeshBasicMaterial } from "three";
import { MapQueryService } from "../../map/queries/map-query.service";
import { LaneDebugService } from "../../services/debug/lane-debug.service";
import { COLOR } from "../../views/shared/utils/colors.service";

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionsDebugger extends BaseDebugger<TvLaneCoord> {

	highlightedLanes = new Map<TvLane, Material | Material[]>();

	constructor ( private queryService: MapQueryService, private laneDebugService: LaneDebugService ) {
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

			this.laneDebugService.showDirectionalArrows( lane, COLOR.WHITE );

		}

		if ( this.highlightedLanes.has( coord.lane ) ) return;

		highlight( coord.lane, COLOR.MBLUE );

		const successors = this.queryService.findLaneSuccessors( coord.road, coord.laneSection, coord.lane );

		successors.forEach( lane => highlight( lane, COLOR.MGREEN ) );

		const predecessors = this.queryService.findLanePredecessors( coord.road, coord.laneSection, coord.lane );

		predecessors.forEach( lane => highlight( lane, COLOR.MRED ) );

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

	resetHighlighted () {

		this.highlightedLanes.forEach( ( material, lane ) => {

			lane.gameObject.material = material;

			this.highlightedLanes.delete( lane );

			this.laneDebugService.removeDirectionalArrows( lane );

		} );

	}

	clear () {

		super.clear();

		this.resetHighlighted();

	}

}
