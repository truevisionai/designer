/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../map/models/tv-lane';
import { SerializedAction, SerializedField } from 'app/core/components/serialization';
import { TvColors, TvRoadMarkTypes, TvRoadMarkWeights, TvSupporteRoadMarkTypes } from 'app/map/models/tv-common';
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { Maths } from 'app/utils/maths';
import { Commands } from 'app/commands/commands';


export class LaneMarkingInspector {

	constructor (
		public lane: TvLane,
		public roadmark: TvLaneRoadMark
	) {
	}

	@SerializedField( { type: 'int' } )
	get s (): number {
		return this.roadmark.sOffset + this.lane.laneSection.s;
	}

	set s ( value: number ) {
		this.roadmark.sOffset = Maths.clamp( value - this.lane.laneSection.s, 0, this.lane.laneSection.length );
	}

	@SerializedField( { type: 'float' } )
	get width (): number {
		return this.roadmark.width;
	}

	set width ( value: number ) {
		this.roadmark.width = value;
	}

	@SerializedField( { type: 'float' } )
	get length (): number {
		return this.roadmark.length;
	}

	set length ( value: number ) {
		this.roadmark.length = value;
	}

	@SerializedField( { type: 'float' } )
	get space (): number {
		return this.roadmark.space;
	}

	set space ( value: number ) {
		this.roadmark.space = value;
	}

	@SerializedField( { type: 'enum', enum: TvSupporteRoadMarkTypes } )
	get markingType (): TvRoadMarkTypes {
		return this.roadmark.type;
	}

	set markingType ( value: TvRoadMarkTypes ) {
		this.roadmark.type = value;
		this.space = TvLaneRoadMark.getSpaceByType( value );
		this.length = TvLaneRoadMark.getLengthByType( value );
	}

	@SerializedField( { type: 'enum', enum: TvRoadMarkWeights } )
	get weight (): TvRoadMarkWeights {
		return this.roadmark.weight;
	}

	set weight ( value: TvRoadMarkWeights ) {
		this.roadmark.weight = value;
		this.width = TvLaneRoadMark.getWidthByWeight( value );
	}

	@SerializedField( { type: 'enum', enum: TvColors } )
	get color () {
		return this.roadmark.color;
	}

	set color ( value ) {
		this.roadmark.color = value;
	}

	@SerializedField( { type: 'material' } )
	get material () {
		return this.roadmark.materialGuid;
	}

	set material ( value ) {
		this.roadmark.materialGuid = value;
	}

	@SerializedAction()
	delete () {

		Commands.RemoveObject( this );

	}

}
