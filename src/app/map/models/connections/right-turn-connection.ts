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
		this.isCornerConnection = true;
		connectingRoad.markAsCornerRoad();
	}

	getEntryCoords (): TvLaneCoord[] {

		// we need to get the rightmost of leftmost carrige way lane dependong on the contact point
		// then all lanes after it can be considered as right turn lanes

		const incomingLanes = this.getIncomingLanes();

		let outerMostDrivingLane = incomingLanes[ 0 ];

		if ( this.contactPoint == TvContactPoint.END ) {

			// sort in descending order
			// -1, -2, -3
			const drivingLanes = incomingLanes.filter( lane => lane.isDrivingLane ).sort( ( a, b ) => b.id - a.id );

			outerMostDrivingLane = drivingLanes[ drivingLanes.length - 1 ];

			if ( !outerMostDrivingLane ) return [];

			// return all lanes after the outermost carriageway including the carriageway
			return incomingLanes.filter( lane => lane.id <= outerMostDrivingLane.id )
				.map( lane => new TvLaneCoord( this.incomingRoad, this.getIncomingLaneSection(), lane, createLaneDistance( lane, this.contactPoint ), 0 ) );

		} else {

			// sort in ascending order
			// 1, 2, 3
			const drivingLanes = incomingLanes.filter( lane => lane.isDrivingLane ).sort( ( a, b ) => a.id - b.id );

			outerMostDrivingLane = drivingLanes[ drivingLanes.length - 1 ];

			if ( !outerMostDrivingLane ) return [];

			// return all lanes after the outermost carriageway including the carriageway
			return incomingLanes.filter( lane => lane.id >= outerMostDrivingLane.id )
				.map( lane => new TvLaneCoord( this.incomingRoad, this.getIncomingLaneSection(), lane, createLaneDistance( lane, this.contactPoint ), 0 ) );

		}

	}

	get isIncomingInSameDirection (): boolean {

		return this.contactPoint !== this.getOutgoingRoadContact();

	}

	getExitCoords (): TvLaneCoord[] {

		const direction = this.isIncomingInSameDirection ? LaneUtils.determineDirection( this.contactPoint ) : LaneUtils.determineOutDirection( this.contactPoint );

		let outgoingLanes = this.getOutgoingLanes().filter( lane => lane.direction == direction );

		const drivingLanes = outgoingLanes.filter( lane => lane.isDrivingLane );

		if ( direction == TravelDirection.forward ) {

			const outerMostDrivingLane = drivingLanes[ drivingLanes.length - 1 ];
			if ( !outerMostDrivingLane ) return [];

			// return all lanes after the outermost carriageway including the carriageway
			outgoingLanes = outgoingLanes.sort( ( a, b ) => b.id - a.id ).filter( lane => lane.id <= outerMostDrivingLane.id );

		} else {

			const outerMostDrivingLane = drivingLanes[ 0 ];
			if ( !outerMostDrivingLane ) return [];

			// return all lanes after the outermost carriageway including the carriageway
			outgoingLanes = outgoingLanes.sort( ( a, b ) => a.id - b.id ).filter( lane => lane.id >= outerMostDrivingLane.id );

		}

		const outgoingRoad = this.getOutgoingRoad();

		const laneSection = this.getOutgoingLaneSection();

		return outgoingLanes.map( lane =>

			new TvLaneCoord( outgoingRoad, laneSection, lane, createLaneDistance( lane, this.contactPoint ), 0 )
		);

	}

}