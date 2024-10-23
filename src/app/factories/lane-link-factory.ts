import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { TvLaneSide } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";

export class LaneLinkFactory {

	static generateLinks ( connection: TvJunctionConnection ): TvJunctionLaneLink[] {

		const entries = connection.getEntryCoords();
		const exits = connection.getExitCoords();

		const links: TvJunctionLaneLink[] = [];

		let id = 1;

		connection.getLaneSection().addCenterLane();

		for ( const entry of entries ) {

			const exit = this.findBestMatchingLane( entry, exits, connection.isCornerConnection );

			if ( !exit ) continue;

			const connectingLane = entry.lane.clone( id++ * -1 );

			connectingLane.side = TvLaneSide.RIGHT;

			if ( !connection.isCornerConnection ) connectingLane.removeRoadMarks();

			connection.getLaneSection().addLaneInstance( connectingLane );

			connectingLane.predecessorId = entry.lane.id;
			connectingLane.predecessorUUID = entry.lane.uuid;

			connectingLane.successorId = exit.lane?.id;
			connectingLane.successorUUID = exit.lane?.uuid;

			links.push( new TvJunctionLaneLink( entry.lane, connectingLane ) );

		}

		return links;

	}

	// private static createLaneLinks ( connection: TvJunctionConnection ): void {

	// 	switch ( connection.getTurnType() ) {
	// 		case TurnType.RIGHT:
	// 			this.createSimpleLaneLinks( connection );
	// 			break;
	// 		case TurnType.LEFT:
	// 			this.createTurnLaneLinks( connection, connection.getTurnType() );
	// 			break;
	// 		case TurnType.STRAIGHT:
	// 			this.createStraightLaneLinks( connection );
	// 			break;
	// 		default:
	// 			// Handle other cases or throw an error
	// 			break;
	// 	}

	// }

	// private static createStraightLaneLinks ( connection: TvJunctionConnection ): void {

	// 	// Sort lanes based on IDs and contact points for straight connections
	// 	const entries = this.sortLanesForStraight( connection.getIncomingCoords(), connection.contactPoint );
	// 	const exits = this.sortLanesForStraight( connection.getOutgoingCoords(), connection.getOutgoingRoadContact() );

	// 	this.connectLanes( entries, exits, connection );
	// }

	// private static createTurnLaneLinks ( connection: TvJunctionConnection, direction: TurnType ): void {

	// 	const entries = direction == TurnType.RIGHT
	// 		? connection.getIncomingCoords().sort( ( a, b ) => b.lane.id - a.lane.id )
	// 		: connection.getIncomingCoords();

	// 	const exits = direction == TurnType.RIGHT
	// 		? connection.getOutgoingCoords().sort( ( a, b ) => b.lane.id - a.lane.id )
	// 		: connection.getOutgoingCoords();

	// 	this.connectLanes( entries, exits, connection );
	// }

	// /**
	//  * Sort lanes for straight connections based on lane IDs and contact points.
	//  * We aim to match lanes with the same IDs.
	//  */
	// private static sortLanesForStraight ( lanes: TvLaneCoord[], contactPoint: TvContactPoint ): TvLaneCoord[] {
	// 	return lanes.sort( ( a, b ) => {
	// 		return a.lane.id - b.lane.id;
	// 	} );
	// }

	// private static createSimpleLaneLinks ( connection: TvJunctionConnection ): void {

	// 	const entries = connection.contactPoint == TvContactPoint.START
	// 		? connection.getIncomingCoords().sort( ( a, b ) => a.lane.id - b.lane.id )
	// 		: connection.getIncomingCoords().sort( ( a, b ) => b.lane.id - a.lane.id )

	// 	const exits = connection.getOutgoingRoadContact() == TvContactPoint.END
	// 		? connection.getOutgoingCoords().sort( ( a, b ) => a.lane.id - b.lane.id )
	// 		: connection.getOutgoingCoords().sort( ( a, b ) => b.lane.id - a.lane.id )

	// 	connection.getLaneSection().addLaneInstance( LaneFactory.createCenterLane() );

	// 	for ( const entry of entries ) {

	// 		const exit = this.findBestMatchingLane( entry, exits, connection.isCornerConnection );

	// 		const id = Math.abs( entry.lane.id ) * -1;

	// 		const connectingLane = entry.lane.clone( id );

	// 		connection.getLaneSection().addLaneInstance( connectingLane );

	// 		connectingLane.predecessorId = entry.lane.id;
	// 		connectingLane.predecessorUUID = entry.lane.uuid;

	// 		connectingLane.successorId = exit.lane?.id;
	// 		connectingLane.successorUUID = exit.lane?.uuid;

	// 		connection.addLaneLink( new TvJunctionLaneLink( entry.lane, connectingLane ) );

	// 	}

	// }

	// private static connectLanes ( entries: TvLaneCoord[], exits: TvLaneCoord[], connection: TvJunctionConnection ): void {

	// 	const laneSection = connection.getLaneSection();

	// 	// Add center lane (lane ID 0)
	// 	laneSection.addLaneInstance( LaneFactory.createCenterLane() );

	// 	// Determine the number of lanes to connect
	// 	const numConnections = Math.max( entries.length, exits.length );

	// 	for ( let i = 0; i < numConnections; i++ ) {

	// 		const entry = entries[ i % entries.length ];
	// 		const exit = exits[ i % exits.length ];

	// 		const connectingLane = entry.lane.clone();
	// 		connectingLane.id = -( i + 1 ); // Assign new IDs for connecting lanes

	// 		laneSection.addLaneInstance( connectingLane );

	// 		// Set predecessor and successor IDs for the connecting lane
	// 		connectingLane.predecessorId = entry.lane.id;
	// 		connectingLane.predecessorUUID = entry.lane.uuid;

	// 		connectingLane.successorId = exit.lane.id;
	// 		connectingLane.successorUUID = exit.lane.uuid;

	// 		// Add lane link to the connection
	// 		connection.addLaneLink( new TvJunctionLaneLink( entry.lane, connectingLane ) );
	// 	}
	// }

	private static findBestMatchingLane ( entry: TvLaneCoord, exits: TvLaneCoord[], corner: boolean ): TvLaneCoord | undefined {

		let bestMatch: TvLaneCoord | undefined;

		// const rightMostLane: TvLane = entry.laneSection.getRightMostIncomingLane( entry.contact );
		// const leftMostLane: TvLane = entry.laneSection.getLeftMostIncomingLane( entry.contact );
		let closestLane: TvLane | null = null;

		for ( const exit of exits ) {

			// lane types should match
			if ( exit.lane.type != entry.lane.type ) continue;

			// ids should match
			if ( Math.abs( exit.lane.id ) != Math.abs( entry.lane.id ) ) continue;

			const currentLaneDiff = Math.abs( Math.abs( exit.lane.id ) - Math.abs( entry.lane.id ) );

			const closestLaneDiff = closestLane ? Math.abs( Math.abs( closestLane.id ) - Math.abs( entry.lane.id ) ) : Infinity;

			// Update closestLane only if it's closer to the requested laneId
			if ( !closestLane || currentLaneDiff < closestLaneDiff ) {
				closestLane = exit.lane;
			}

			if ( exit.lane.id === entry.lane.id ) {
				return exit; // Exact match
			}

			bestMatch = exit;

			break;

		}

		return bestMatch;

	}

}
