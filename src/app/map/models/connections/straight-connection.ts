import { TvRoad } from "../tv-road.model";
import { TurnType, TvContactPoint } from "../tv-common";
import { TvLaneCoord } from "../tv-lane-coord";
import { createLaneDistance } from "../../road/road-distance";
import { LaneUtils } from "../../../utils/lane.utils";
import { TvJunctionConnection } from "./tv-junction-connection";

export class StraightConnection extends TvJunctionConnection {

	constructor (
		id: number,
		incomingRoad: TvRoad,
		connectingRoad: TvRoad,
		contactPoint: TvContactPoint,
	) {
		super( id, incomingRoad, connectingRoad, contactPoint );
		this.setTurnType( TurnType.STRAIGHT );
	}

	getEntryCoords (): TvLaneCoord[] {

		const contact = this.getIncomingRoadContact();
		const direction = LaneUtils.determineDirection( contact );
		const side = LaneUtils.findIncomingSide( contact );

		const entries: TvLaneCoord[] = this.getIncomingCoords();

		const drivingEntries = entries.filter( coord => coord.lane.isDrivingLane );

		if ( drivingEntries.length == 0 ) {
			return entries.filter( coord => this.isCornerConnection || coord.lane.isDrivingLane );
		}

		const firstExit = drivingEntries[ 0 ];

		return entries
			.filter( exit => exit.lane.isEqualOrAfter( firstExit.lane ) )
			.filter( exit => this.isCornerConnection || exit.lane.isDrivingLane );

	}

	getExitCoords (): TvLaneCoord[] {

		const contact = this.getOutgoingRoadContact();
		const direction = LaneUtils.determineOutDirection( contact );
		const side = LaneUtils.findOutgoingSide( contact );

		const exits: TvLaneCoord[] = this.getOutgoingCoords();

		const drivingExits = exits.filter( coord => coord.lane.isDrivingLane );

		if ( drivingExits.length == 0 ) {
			return exits.filter( coord => this.isCornerConnection || coord.lane.isDrivingLane );
		}

		const firstExit = drivingExits[ 0 ];

		return exits
			.filter( exit => exit.lane.isEqualOrAfter( firstExit.lane ) )
			.filter( exit => this.isCornerConnection || exit.lane.isDrivingLane );

	}

}
