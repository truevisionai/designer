/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseLaneDebugService } from 'app/core/interfaces/lane-node.debug';
import { TvLane } from "app/map/models/tv-lane";
import { DebugState } from "app/services/debug/debug-state";
import { TvLaneSide } from "../models/tv-common";
import { TvLaneHeight } from "./lane-height.model";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightDebugService extends BaseLaneDebugService<TvLaneHeight> {

	setDebugState ( lane: TvLane, state: DebugState ): void {

		if ( !lane ) return;

		this.setBaseState( lane, state );

	}

	onHighlight ( lane: TvLane ): void {

	}

	onUnhighlight ( lane: TvLane ): void {

	}

	onSelected ( lane: TvLane ): void {

		lane.laneSection.lanes.forEach( item => {

			this.showNodes( item );

			this.showLines( item );

		} )

	}

	onUnselected ( lane: TvLane ): void {

		lane.laneSection.lanes.forEach( item => {

			this.nodes.removeKey( item );

		} )

	}

	onDefault ( lane: TvLane ): void {

		lane.laneSection.lanes.forEach( item => {

			this.nodes.removeKey( item );

			this.showLines( item );

		} )

	}

	onRemoved ( lane: TvLane ): void {

		lane.laneSection.lanes.forEach( item => {

			this.nodes.removeKey( item );

			this.lines.removeKey( item );

		} )


	}

	clear (): void {

		this.mapService.roads.forEach( road => {

			road.laneSections.forEach( laneSection => {

				laneSection.lanes.forEach( lane => {

					if ( lane.side == TvLaneSide.CENTER ) return;

					this.setBaseState( lane, DebugState.REMOVED );

				} );

			} );

		} );

		super.clear();

	}

	private showNodes ( lane: TvLane ) {

		this.nodes.removeKey( lane );

		for ( let i = 0; i < lane.height.length; i++ ) {

			const height = lane.height[ i ];

			const point = this.debugDrawService.createLaneNode( lane.laneSection.road, lane, height );

			this.nodes.addItem( lane, point );

		}

	}

	private showLines ( lane: TvLane ) {

		this.lines.removeKey( lane );

		for ( let i = 0; i < lane.height.length; i++ ) {

			const height = lane.height[ i ];

			const sStart = height.sOffset;

			// get s of next lane width node
			let sEnd = lane.height[ i + 1 ]?.sOffset || lane.laneSection.length;

			this.createLine( height, lane, sStart, sEnd );

		}

		if ( lane.height.length == 0 ) {

			const sStart = 0;

			// get s of next lane width node
			let sEnd = lane.laneSection.length;

			this.createDashedLine( lane, lane, sStart, sEnd );

		}

	}

}
