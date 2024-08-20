/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "../../map/models/tv-lane";
import { LaneService } from "../../services/lane/lane.service";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { TravelDirection, TvLaneType } from "../../map/models/tv-common";
import { Commands } from "../../commands/commands";
import { LaneFactory } from "app/services/lane/lane.factory";

export class LaneInspector {

	constructor (
		public lane: TvLane,
		public laneService: LaneService
	) {
	}

	@SerializedField( { label: 'Lane Id', type: 'int', disabled: true } )
	get laneId (): number {
		return Number( this.lane.id );
	}

	set laneId ( value: number ) {
		this.lane.id = value;
	}

	@SerializedField( { type: 'enum', enum: TvLaneType } )
	get type (): TvLaneType {
		return this.lane.type;
	}

	set type ( value: TvLaneType ) {
		this.laneService.setLaneType( this.lane, value );
	}

	@SerializedField( { type: 'boolean' } )
	get level (): boolean {
		return this.lane.level;
	}

	set level ( value ) {
		this.lane.level = value;
	}

	@SerializedField( { type: 'enum', enum: TravelDirection } )
	get direction () {
		return this.lane.direction;
	}

	set direction ( value: TravelDirection ) {
		this.lane.direction = value;
	}

	@SerializedAction()
	duplicate () {

		const duplicate = LaneFactory.createDuplicate( this.lane );

		Commands.AddObject( duplicate );

	}

	@SerializedAction()
	delete () {

		Commands.RemoveObject( this.lane );

	}

}
