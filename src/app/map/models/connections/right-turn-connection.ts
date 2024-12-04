import { TvRoad } from "../tv-road.model";
import { TravelDirection, TurnType, TvContactPoint } from "../tv-common";
import { TvLaneCoord } from "../tv-lane-coord";
import { createLaneDistance } from "../../road/road-distance";
import { LaneUtils } from "../../../utils/lane.utils";
import { TvJunctionConnection } from "./tv-junction-connection";
import { TvLane } from "../tv-lane";

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

		const incomingLanes = this.getIncomingLanes();
		const incomingContact = this.getIncomingRoadContact();

		const drivingLanes = incomingLanes.filter( lane => lane.isDrivingLane );

		if ( drivingLanes.length === 0 ) return [];

		const outerLane = drivingLanes[ drivingLanes.length - 1 ];

		if ( !outerLane ) return [];

		return [ outerLane.toLaneCoord( createLaneDistance( outerLane, incomingContact ) ) ];

	}

	// eslint-disable-next-line max-lines-per-function
	getExitCoords (): TvLaneCoord[] {

		const contactPoint = this.getOutgoingRoadContact()
		const outgoingCoords = this.getOutgoingCoords();

		let drivingCoords = outgoingCoords.filter( coord => coord.lane.isDrivingLane );

		if ( outgoingCoords.length == 0 ) {
			return this.getNonDrivingCoords();
		}

		if ( drivingCoords.length == 0 ) {
			return [];
		}

		if ( contactPoint == TvContactPoint.START ) {

			// right lanes
			// sort by lane id in ascending order
			drivingCoords = drivingCoords.sort( ( a, b ) => b.lane.id - a.lane.id );

			return [
				drivingCoords[ drivingCoords.length - 1 ]
			];


		} else {

			// left lanes
			// sort by lane id in descending order
			drivingCoords = drivingCoords.sort( ( a, b ) => b.lane.id - a.lane.id );

			return [
				drivingCoords[ 0 ]
			];

		}

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
