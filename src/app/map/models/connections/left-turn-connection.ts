import { TvRoad } from "../tv-road.model";
import { TurnType, TvContactPoint } from "../tv-common";
import { TvLaneCoord } from "../tv-lane-coord";
import { createLaneDistance } from "../../road/road-distance";
import { LaneUtils } from "../../../utils/lane.utils";
import { TvJunctionConnection } from "./tv-junction-connection";

export class LeftTurnConnection extends TvJunctionConnection {

	constructor (
		id: number,
		incomingRoad: TvRoad,
		connectingRoad: TvRoad,
		contactPoint: TvContactPoint,
	) {
		super( id, incomingRoad, connectingRoad, contactPoint );
		this.setTurnType( TurnType.LEFT );
	}

	getEntryCoords (): TvLaneCoord[] {

		// const direction = LaneUtils.determineDirection( this.contactPoint );
		// const exitLanes = this.getIncomingLanes().filter( lane => lane.direction == direction );
		const entryLane = this.getInnerMostDrivingLane();

		if ( !entryLane ) return [];

		const incomingRoad = this.getIncomingRoad();

		const laneSection = this.getIncomingLaneSection();

		const laneDistance = createLaneDistance( entryLane, this.contactPoint );

		const coord = new TvLaneCoord( incomingRoad, laneSection, entryLane, laneDistance, 0 );

		return [ coord ];
	}

	getExitCoords (): TvLaneCoord[] {

		const direction = LaneUtils.determineDirection( this.contactPoint );

		const exitLanes = this.getOutgoingLanes().filter( lane => lane.direction == direction );

		const exitLane = exitLanes.filter( lane => lane.isDrivingLane )[ 0 ];

		if ( !exitLane ) return [];

		const outgoingRoad = this.getOutgoingRoad();

		const laneSection = this.getOutgoingLaneSection();

		const laneDistance = createLaneDistance( exitLane, this.contactPoint );

		const coord = new TvLaneCoord( outgoingRoad, laneSection, exitLane, laneDistance, 0 );

		return [ coord ];

	}

}