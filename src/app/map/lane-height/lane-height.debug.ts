/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { LaneNodeDebugService } from 'app/core/interfaces/lane-node.debug';
import { Object3DArrayMap } from "app/core/models/object3d-array-map";
import { TvLane } from "app/map/models/tv-lane";
import { DebugState } from "app/services/debug/debug-state";
import { Object3D } from "three";
import { SimpleControlPoint } from "../../objects/dynamic-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightDebugService extends LaneNodeDebugService<TvLane> {

	private points = new Object3DArrayMap<TvLane, Object3D[]>();

	setDebugState ( lane: TvLane, state: DebugState ): void {

		if ( !lane ) return;

		this.setBaseState( lane, state );

	}

	onHighlight ( lane: TvLane ): void {

	}

	onUnhighlight ( lane: TvLane ): void {

	}

	onSelected ( lane: TvLane ): void {

		lane.height?.forEach( height => {

			const s = lane.laneSection.s + height.sOffset;

			const width = lane.getWidthValue( height.sOffset );

			const position = lane.laneSection.road.getLaneStartPosition( lane, s );

			const point = new SimpleControlPoint( height, position.position );

			this.points.addItem( lane, point );

		} );

	}

	onUnselected ( lane: TvLane ): void {

		this.points.removeKey( lane );

	}

	onDefault ( lane: TvLane ): void {

		this.points.removeKey( lane );

	}

	onRemoved ( lane: TvLane ): void {

	}

}
