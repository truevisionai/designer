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

		const contactPoint = this.getIncomingRoadContact();
		const direction = LaneUtils.determineDirection( contactPoint );

		const entryLanes = this.getIncomingLanes()
			.filter( lane => lane.direction == direction )
			.filter( lane => lane.isDrivingLane );

		if ( entryLanes.length === 0 ) return [];

		const entryLane = entryLanes[ 0 ];

		const laneDistance = createLaneDistance( entryLane, contactPoint );

		return [ entryLane.toLaneCoord( laneDistance ) ];
	}

	getExitCoords (): TvLaneCoord[] {

		const contactPoint = this.getOutgoingRoadContact();
		const direction = LaneUtils.determineOutDirection( contactPoint );

		const exitLanes = this.getOutgoingLanes()
			.filter( lane => lane.direction == direction )
			.filter( lane => lane.isDrivingLane );

		if ( exitLanes.length === 0 ) return [];

		const exitLane = exitLanes[ 0 ];

		const laneDistance = createLaneDistance( exitLane, contactPoint );

		return [ exitLane.toLaneCoord( laneDistance ) ];

	}

}
