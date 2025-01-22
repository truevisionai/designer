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

		const innerMostDrivingLane = this.getInnerMostDrivingLane();

		let drivingLanes = this.getIncomingLanes().filter( lane => lane.isDrivingLane );

		const contactPoint = this.getIncomingRoadContact();

		if ( contactPoint == TvContactPoint.END ) {

			drivingLanes = drivingLanes.filter( lane => lane.id <= innerMostDrivingLane.id )

		} else {

			drivingLanes = drivingLanes.filter( lane => lane.id >= innerMostDrivingLane.id )

		}

		const incomingRoad = this.getIncomingRoad();

		const laneSection = this.getIncomingLaneSection();

		return drivingLanes.map( lane =>

			new TvLaneCoord( incomingRoad, laneSection, lane, createLaneDistance( lane, contactPoint ), 0 )

		);

	}

	getExitCoords (): TvLaneCoord[] {

		const contactPoint = this.getOutgoingRoadContact();

		const direction = LaneUtils.determineOutDirection( contactPoint );

		const drivingLanes = this.getOutgoingLanes().filter( lane => lane.matchesDirection( direction ) ).filter( lane => lane.isDrivingLane );

		const outgoingRoad = this.getOutgoingRoad();

		const laneSection = this.getOutgoingLaneSection();

		return drivingLanes.map( exitLane => {

			return new TvLaneCoord( outgoingRoad, laneSection, exitLane, createLaneDistance( exitLane, contactPoint ), 0 );

		} );

	}

}
