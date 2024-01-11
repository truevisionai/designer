/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../../tv-map/models/tv-lane-road-mark';
import { ISelectable } from './i-selectable';
import { DynamicControlPoint } from './dynamic-control-point';
import { Vector3 } from 'three';
import { SerializedField } from 'app/core/components/serialization';

export class LaneMarkingNode extends DynamicControlPoint<any> implements ISelectable {

	public static readonly tag = 'roadmark-node';

	@SerializedField( { type: 'int' } )
	get s (): number {
		return this.roadmark.sOffset;
	}

	set s ( value: number ) {
		this.roadmark.sOffset = value;
	}

	constructor ( public lane: TvLane, public roadmark: TvLaneRoadMark, position?: Vector3 ) {

		super( roadmark, position );

		this.layers.enable( 31 );

		this.tag = LaneMarkingNode.tag;

		if ( position ) {

			this.position.copy( position );

		} else {

			const lanePosition = lane.laneSection.road.getLaneEndPosition( lane, roadmark.sOffset );

			this.position.copy( lanePosition.toVector3() );

		}

	}

}

