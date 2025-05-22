import { TvRoad } from "../tv-road.model";
import { TravelDirection, TurnType, TvContactPoint } from "../tv-common";
import { TvLaneCoord } from "../tv-lane-coord";
import { createLaneDistance } from "../../road/road-distance";
import { LaneUtils } from "../../../utils/lane.utils";
import { TvJunctionConnection } from "./tv-junction-connection";

export class RightTurnConnection extends TvJunctionConnection {

	constructor (
		id: number,
		incomingRoad: TvRoad,
		connectingRoad: TvRoad,
		contactPoint: TvContactPoint,
	) {
		super( id, incomingRoad, connectingRoad, contactPoint );
		this.setTurnType( TurnType.RIGHT );
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

		const last = drivingEntries[ drivingEntries.length - 1 ];

		return entries.filter( exit => exit.lane.isEqualOrAfter( last.lane ) )
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

		const lastExit = drivingExits[ drivingExits.length - 1 ];

		return exits.filter( exit => exit.lane.isEqualOrAfter( lastExit.lane ) )
			.filter( exit => this.isCornerConnection || exit.lane.isDrivingLane );

	}

	getNonDrivingCoords (): TvLaneCoord[] {

		const contactPoint = this.getOutgoingRoadContact();
		const outgoingRoad = this.getOutgoingRoad();
		const laneSection = this.getOutgoingLaneSection();
		const direction = LaneUtils.determineOutDirection( contactPoint );

		let outgoingLanes = this.getOutgoingLanes();

		const drivingLanes = outgoingLanes.filter( lane => lane.isDrivingLane );

		if ( direction == TravelDirection.forward ) {

			const outerMostDrivingLane = drivingLanes[ drivingLanes.length - 1 ];
			if ( !outerMostDrivingLane ) return [];

			// return all lanes after the outermost carriageway including the carriageway
			outgoingLanes = outgoingLanes.sort( ( a, b ) => b.id - a.id ).filter( lane => lane.id > outerMostDrivingLane.id );

		} else {

			const outerMostDrivingLane = drivingLanes[ 0 ];
			if ( !outerMostDrivingLane ) return [];

			// return all lanes after the outermost carriageway including the carriageway
			outgoingLanes = outgoingLanes.sort( ( a, b ) => a.id - b.id ).filter( lane => lane.id < outerMostDrivingLane.id );

		}

		return outgoingLanes.map( lane =>
			new TvLaneCoord( outgoingRoad, laneSection, lane, createLaneDistance( lane, contactPoint ), 0 )
		);
	}

}
