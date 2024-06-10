/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../map/models/tv-lane';
import { TvLaneRoadMark } from '../map/models/tv-lane-road-mark';
import { ISelectable } from './i-selectable';
import { DynamicControlPoint } from './dynamic-control-point';
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

	constructor ( public lane: TvLane, public roadmark: TvLaneRoadMark ) {

		super( roadmark );

		this.tag = LaneMarkingNode.tag;

	}

}

